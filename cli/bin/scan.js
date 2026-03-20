#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');
const { scanPackages, scanPackageJson } = require('../lib/api');
const { computeScore } = require('../lib/scoring');
const { printReport } = require('../lib/reporter');
const { toSarif } = require('../lib/sarif');
const { detectUnused } = require('../lib/unused');
const { version } = require('../package.json');

const HELP = `
  oss-health-scan — scan dependencies for abandoned/unhealthy packages

  Usage:
    npx oss-health-scan                  Scan ./package.json
    npx oss-health-scan path/to/dir      Scan package.json in given directory
    npx oss-health-scan pkg1 pkg2 ...    Scan specific npm packages

  Options:
    --json          Output raw JSON instead of terminal report
    --sarif         Output SARIF 2.1.0 for GitHub Code Scanning
    --markdown      Output Markdown table (for PR comments)
    --ci            Output GitHub Actions annotations (::warning::, ::error::)
    --outdated      Show installed vs latest versions with libyear metric
    --vulns         Check OSV.dev for known vulnerabilities (CVEs)
    --unused        Detect dependencies not imported in source code
    --threshold N   Only show packages below health score N (default: show all)
    --sort FIELD    Sort by: score (default), name, downloads, risk
    --dev           Include devDependencies
    --no-color      Disable colored output
    -v, --version   Show version
    -h, --help      Show this help

  Config:
    Add "oss-health-scan" field to package.json or create .oss-health-scanrc.json:
    { "threshold": 40, "exclude": ["moment"], "dev": true }
`;

function loadConfig(dir) {
  const defaults = { threshold: 0, dev: false, exclude: [] };

  // .oss-health-scanrc.json
  const rcPath = path.resolve(dir || '.', '.oss-health-scanrc.json');
  if (fs.existsSync(rcPath)) {
    try {
      return { ...defaults, ...JSON.parse(fs.readFileSync(rcPath, 'utf8')) };
    } catch (e) { /* invalid rc file, ignore */ }
  }

  // package.json "oss-health-scan" field
  const pkgPath = path.resolve(dir || '.', 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg['oss-health-scan']) {
        return { ...defaults, ...pkg['oss-health-scan'] };
      }
    } catch (e) { /* invalid package.json, ignore */ }
  }

  return defaults;
}

function parseArgs(args) {
  const flags = { json: false, sarif: false, markdown: false, ci: false, outdated: false, vulns: false, unused: false, threshold: 0, sort: 'score', dev: false, color: true, dir: null };
  const positional = [];

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--json') flags.json = true;
    else if (a === '--sarif') flags.sarif = true;
    else if (a === '--markdown') flags.markdown = true;
    else if (a === '--ci') flags.ci = true;
    else if (a === '--dev') flags.dev = true;
    else if (a === '--outdated') flags.outdated = true;
    else if (a === '--vulns') flags.vulns = true;
    else if (a === '--unused') flags.unused = true;
    else if (a === '--no-color') flags.color = false;
    else if (a === '-v' || a === '--version') { process.stdout.write(`oss-health-scan v${version}\n`); process.exit(0); }
    else if (a === '-h' || a === '--help') { process.stdout.write(HELP); process.exit(0); }
    else if (a === '--threshold') { flags.threshold = parseInt(args[++i]) || 0; }
    else if (a === '--sort') { flags.sort = args[++i] || 'score'; }
    else positional.push(a);
  }

  return { flags, positional };
}

function resolvePackages(positional, flags) {
  // Check if first positional arg is a directory containing package.json
  if (positional.length === 1) {
    const maybeDir = path.resolve(positional[0]);
    try {
      if (fs.statSync(maybeDir).isDirectory()) {
        flags.dir = maybeDir;
        return readDeps(maybeDir, flags);
      }
    } catch (e) { /* not a directory, treat as package name */ }
  }

  if (positional.length > 0) {
    return { packages: positional, flags };
  }

  return readDeps('.', flags);
}

function readDeps(dir, flags) {
  const pkgPath = path.resolve(dir, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    process.stderr.write(`Error: ${pkgPath} not found\n`);
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const deps = Object.keys(pkg.dependencies || {});
  const devDeps = flags.dev ? Object.keys(pkg.devDependencies || {}) : [];
  let packages = [...deps, ...devDeps];

  // Apply exclusions from config
  if (flags.exclude && flags.exclude.length > 0) {
    const excludeSet = new Set(flags.exclude);
    packages = packages.filter(p => !excludeSet.has(p));
  }

  if (packages.length === 0) {
    process.stderr.write(`No dependencies found in ${pkgPath}\n`);
    process.exit(1);
  }

  return { packages, flags, pkgName: pkg.name };
}

function fmt(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
  return String(n);
}

function riskIcon(level) {
  if (level === 'critical') return ':red_circle:';
  if (level === 'warning') return ':yellow_circle:';
  return ':green_circle:';
}

function printMarkdown(results, total, flags) {
  const valid = results.filter(r => r.health_score != null);
  const critical = valid.filter(r => r.risk_level === 'critical').length;
  const warning = valid.filter(r => r.risk_level === 'warning').length;
  const healthy = valid.filter(r => r.risk_level === 'healthy').length;
  const avg = valid.length > 0 ? (valid.reduce((s, r) => s + r.health_score, 0) / valid.length).toFixed(1) : '0';

  const hasOutdated = flags && flags.outdated;
  const hasVulns = flags && flags.vulns;

  const lines = [];
  lines.push(`### Dependency Health Scan`);
  lines.push('');

  let summary = `**${total}** packages scanned | avg health: **${avg}/100** | :red_circle: ${critical} critical | :yellow_circle: ${warning} warning | :green_circle: ${healthy} healthy`;
  if (hasVulns) {
    const totalVulns = valid.reduce((s, r) => s + (r.vulns ? r.vulns.count : 0), 0);
    if (totalVulns > 0) summary += ` | :rotating_light: ${totalVulns} vulnerabilities`;
  }
  lines.push(summary);
  lines.push('');

  // Build header
  let header = '| Package | Score | Risk | Downloads | Last Push | License |';
  let separator = '|---------|-------|------|-----------|-----------|---------|';
  if (hasOutdated) {
    header += ' Installed | Latest | Drift |';
    separator += '-----------|--------|-------|';
  }
  if (hasVulns) {
    header += ' CVEs |';
    separator += '------|';
  }
  lines.push(header);
  lines.push(separator);

  for (const r of valid) {
    const icon = riskIcon(r.risk_level);
    const score = `**${r.health_score}**/100`;
    const dl = r.downloads ? fmt(r.downloads) + '/wk' : '—';
    const push = r.daysSincePush != null ? r.daysSincePush + 'd ago' : '—';
    const lic = r.license || '—';
    const reason = r.reason ? ` ${r.reason}` : '';
    let row = `| ${r.name} | ${score} | ${icon}${reason} | ${dl} | ${push} | ${lic} |`;

    if (hasOutdated) {
      const inst = r.installedVersion || '—';
      const lat = r.latest || '—';
      const drift = r.drift === 'major' ? ':red_circle: major'
                   : r.drift === 'minor' ? ':yellow_circle: minor'
                   : r.drift === 'patch' ? ':green_circle: patch'
                   : ':white_check_mark:';
      row += ` ${inst} | ${lat} | ${drift} |`;
    }

    if (hasVulns) {
      if (r.vulns && r.vulns.count > 0) {
        const parts = [];
        if (r.vulns.critical > 0) parts.push(`${r.vulns.critical}C`);
        if (r.vulns.high > 0) parts.push(`${r.vulns.high}H`);
        if (r.vulns.moderate > 0) parts.push(`${r.vulns.moderate}M`);
        if (r.vulns.low > 0) parts.push(`${r.vulns.low}L`);
        row += ` :rotating_light: ${parts.join('/')} |`;
      } else {
        row += ` :white_check_mark: |`;
      }
    }

    lines.push(row);
  }

  lines.push('');
  lines.push('*Generated by [oss-health-scan](https://github.com/dusan-maintains/oss-maintenance-log)*');
  process.stdout.write(lines.join('\n') + '\n');
}

async function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2));

  // Load config file and merge (CLI flags override config)
  const dir = positional.length === 1 && fs.existsSync(path.resolve(positional[0])) ? positional[0] : '.';
  const config = loadConfig(dir);
  if (!flags.threshold && config.threshold) flags.threshold = config.threshold;
  if (!flags.dev && config.dev) flags.dev = config.dev;
  if (config.exclude) flags.exclude = config.exclude;

  const { packages, pkgName } = resolvePackages(positional, flags);

  if (packages.length === 0) {
    process.stderr.write('No packages to scan.\n');
    process.exit(1);
  }

  const header = pkgName
    ? `\n  Scanning ${packages.length} dependencies of ${pkgName}...\n`
    : `\n  Scanning ${packages.length} package(s)...\n`;
  if (!flags.json && !flags.sarif && !flags.markdown) process.stderr.write(header);

  const scanDir = flags.dir || dir;
  let { results, outdatedSummary } = await scanPackages(packages, {
    threshold: flags.threshold,
    outdated: flags.outdated,
    vulns: flags.vulns,
    dir: scanDir
  });

  // Sort results
  const validResults = results.filter(r => r.health_score != null);
  const errorResults = results.filter(r => r.health_score == null);
  switch (flags.sort) {
    case 'name': validResults.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'downloads': validResults.sort((a, b) => (b.downloads || 0) - (a.downloads || 0)); break;
    case 'risk': validResults.sort((a, b) => (a.health_score || 0) - (b.health_score || 0)); break;
    case 'score': default: validResults.sort((a, b) => (a.health_score || 0) - (b.health_score || 0)); break;
  }
  results = [...validResults, ...errorResults];

  // Unused detection
  let unusedResult = null;
  if (flags.unused && (flags.dir || pkgName)) {
    unusedResult = detectUnused(scanDir, { dev: flags.dev });
  }

  if (flags.sarif) {
    const sarif = toSarif(results, pkgName ? `${dir}/package.json` : 'package.json');
    process.stdout.write(JSON.stringify(sarif, null, 2) + '\n');
  } else if (flags.json) {
    const output = { scanned: packages.length, results };
    if (outdatedSummary) output.outdatedSummary = outdatedSummary;
    if (unusedResult) output.unused = unusedResult;
    process.stdout.write(JSON.stringify(output, null, 2) + '\n');
  } else if (flags.markdown) {
    printMarkdown(results, packages.length, flags);
  } else if (flags.ci) {
    for (const r of results) {
      if (r.error) continue;
      const level = r.risk_level === 'critical' ? 'error' : r.risk_level === 'warning' ? 'warning' : 'notice';
      const msg = `${r.name}@${r.latest || '?'}: health ${r.health_score}/100` +
        (r.reason ? ` — ${r.reason}` : '') +
        (r.daysSincePush ? ` (last push ${r.daysSincePush}d ago)` : '');
      process.stdout.write(`::${level}::${msg}\n`);
    }
    printReport(results, flags.color);
  } else {
    printReport(results, flags.color);
  }

  // Print unused deps
  if (unusedResult && unusedResult.unused.length > 0 && !flags.json && !flags.sarif) {
    const c = flags.color ? { yellow: '\x1b[33m', dim: '\x1b[2m', reset: '\x1b[0m', bold: '\x1b[1m' } : { yellow: '', dim: '', reset: '', bold: '' };
    process.stdout.write(`\n  ${c.yellow}${c.bold}📦 Potentially unused dependencies (${unusedResult.unused.length}):${c.reset}\n`);
    for (const dep of unusedResult.unused) {
      process.stdout.write(`  ${c.dim}  - ${dep}${c.reset}\n`);
    }
    process.stdout.write(`  ${c.dim}(scanned ${unusedResult.scanned} source files)${c.reset}\n`);
  }

  const critical = results.filter(r => r.risk_level === 'critical').length;
  process.exit(critical > 0 ? 1 : 0);
}

main().catch(e => {
  process.stderr.write(`Fatal: ${e.message}\n`);
  process.exit(2);
});
