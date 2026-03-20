'use strict';

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
  bgGreen: '\x1b[42m'
};

function nc(str) { return str; }

function fmt(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
  return String(n);
}

function pad(s, len) {
  s = String(s);
  return s.length >= len ? s : s + ' '.repeat(len - s.length);
}

function scoreBar(score, c) {
  const filled = Math.round(score / 100 * 20);
  const empty = 20 - filled;
  const color = score < 30 ? c.red : score < 60 ? c.yellow : c.green;
  return color + '█'.repeat(filled) + c.dim + '░'.repeat(empty) + c.reset;
}

function printExtras(r, c) {
  // Drift line
  if (r.drift && r.drift !== 'up-to-date' && r.installedVersion) {
    const driftColor = r.drift === 'major' ? c.red : r.drift === 'minor' ? c.yellow : c.dim;
    process.stdout.write(`  ${' '.repeat(35)} ${c.dim}installed: ${r.installedVersion} → latest: ${r.latest}${c.reset} ${driftColor}[${r.drift}]${c.reset}`);
    if (r.libyear > 0) process.stdout.write(` ${c.dim}~${r.libyear} libyear${c.reset}`);
    process.stdout.write('\n');
  }
  // Vulnerability line
  if (r.vulns && r.vulns.count > 0) {
    const parts = [];
    if (r.vulns.critical > 0) parts.push(`${c.bgRed}${c.white} ${r.vulns.critical} CRITICAL ${c.reset}`);
    if (r.vulns.high > 0) parts.push(`${c.red}${r.vulns.high} HIGH${c.reset}`);
    if (r.vulns.moderate > 0) parts.push(`${c.yellow}${r.vulns.moderate} MODERATE${c.reset}`);
    if (r.vulns.low > 0) parts.push(`${c.dim}${r.vulns.low} LOW${c.reset}`);
    process.stdout.write(`  ${' '.repeat(35)} ${c.red}🛡️  ${r.vulns.count} vuln(s):${c.reset} ${parts.join(' ')}`);
    if (r.vulns.ids.length > 0 && r.vulns.ids.length <= 3) {
      process.stdout.write(` ${c.dim}${r.vulns.ids.join(', ')}${c.reset}`);
    }
    process.stdout.write('\n');
  }
}

function printReport(results, useColor) {
  const c = useColor ? C : new Proxy({}, { get: () => '' });

  const critical = results.filter(r => r.risk_level === 'critical');
  const warning = results.filter(r => r.risk_level === 'warning');
  const healthy = results.filter(r => r.risk_level === 'healthy');
  const errors = results.filter(r => r.error);

  const total = results.length;
  const avgScore = results.filter(r => r.health_score != null).reduce((s, r) => s + r.health_score, 0) / (total - errors.length || 1);

  // Header
  process.stdout.write('\n');
  process.stdout.write(`  ${c.bold}OSS Health Scan Results${c.reset}\n`);
  process.stdout.write(`  ${c.dim}${'─'.repeat(50)}${c.reset}\n`);
  process.stdout.write(`  Scanned: ${c.bold}${total}${c.reset} packages\n`);
  process.stdout.write(`  Average health: ${c.bold}${avgScore.toFixed(1)}/100${c.reset}\n`);
  process.stdout.write(`  ${c.red}● Critical: ${critical.length}${c.reset}  `);
  process.stdout.write(`${c.yellow}● Warning: ${warning.length}${c.reset}  `);
  process.stdout.write(`${c.green}● Healthy: ${healthy.length}${c.reset}\n`);

  if (errors.length > 0) {
    process.stdout.write(`  ${c.dim}● Errors: ${errors.length}${c.reset}\n`);
  }

  // Outdated summary
  const outdatedPkgs = results.filter(r => r.drift && r.drift !== 'up-to-date');
  if (outdatedPkgs.length > 0) {
    const totalLibyear = results.reduce((s, r) => s + (r.libyear || 0), 0);
    const majorCount = outdatedPkgs.filter(r => r.drift === 'major').length;
    const minorCount = outdatedPkgs.filter(r => r.drift === 'minor').length;
    const patchCount = outdatedPkgs.filter(r => r.drift === 'patch').length;
    process.stdout.write(`  ${c.cyan}⏳ Outdated: ${outdatedPkgs.length}${c.reset}`);
    if (majorCount) process.stdout.write(` ${c.red}(${majorCount} major)${c.reset}`);
    if (minorCount) process.stdout.write(` ${c.yellow}(${minorCount} minor)${c.reset}`);
    if (patchCount) process.stdout.write(` ${c.dim}(${patchCount} patch)${c.reset}`);
    process.stdout.write(`  ${c.dim}total libyear: ${totalLibyear.toFixed(1)}${c.reset}\n`);
  }

  // Vulnerability summary
  const vulnPkgs = results.filter(r => r.vulns && r.vulns.count > 0);
  if (vulnPkgs.length > 0) {
    const totalVulns = vulnPkgs.reduce((s, r) => s + r.vulns.count, 0);
    const critVulns = vulnPkgs.reduce((s, r) => s + r.vulns.critical, 0);
    const highVulns = vulnPkgs.reduce((s, r) => s + r.vulns.high, 0);
    process.stdout.write(`  ${c.red}🛡️  Vulnerabilities: ${totalVulns} in ${vulnPkgs.length} packages${c.reset}`);
    if (critVulns) process.stdout.write(` ${c.bgRed}${c.white} ${critVulns} CRITICAL ${c.reset}`);
    if (highVulns) process.stdout.write(` ${c.red} ${highVulns} HIGH${c.reset}`);
    process.stdout.write('\n');
  }

  // Critical section
  if (critical.length > 0) {
    process.stdout.write(`\n  ${c.bgRed}${c.white}${c.bold} 🔴 CRITICAL ${c.reset}\n\n`);
    for (const r of critical.sort((a, b) => (a.health_score || 0) - (b.health_score || 0))) {
      const bar = scoreBar(r.health_score || 0, c);
      process.stdout.write(`  ${pad(r.name, 35)} ${bar} ${c.bold}${c.red}${pad(String(r.health_score || 0), 3)}/100${c.reset}`);
      if (r.reason) process.stdout.write(`  ${c.red}${r.reason}${c.reset}`);
      else if (r.daysSincePush) process.stdout.write(`  ${c.dim}last push ${r.daysSincePush}d ago${c.reset}`);
      if (r.downloads) process.stdout.write(`  ${c.dim}${fmt(r.downloads)}/wk${c.reset}`);
      process.stdout.write('\n');
      printExtras(r, c);
    }
  }

  // Warning section
  if (warning.length > 0) {
    process.stdout.write(`\n  ${c.bgYellow}${c.bold} 🟡 WARNING ${c.reset}\n\n`);
    for (const r of warning.sort((a, b) => a.health_score - b.health_score)) {
      const bar = scoreBar(r.health_score, c);
      process.stdout.write(`  ${pad(r.name, 35)} ${bar} ${c.bold}${c.yellow}${pad(String(r.health_score), 3)}/100${c.reset}`);
      if (r.daysSincePush) process.stdout.write(`  ${c.dim}last push ${r.daysSincePush}d ago${c.reset}`);
      if (r.downloads) process.stdout.write(`  ${c.dim}${fmt(r.downloads)}/wk${c.reset}`);
      process.stdout.write('\n');
      printExtras(r, c);
    }
  }

  // Healthy section (compact)
  if (healthy.length > 0) {
    process.stdout.write(`\n  ${c.bgGreen}${c.white}${c.bold} 🟢 HEALTHY ${c.reset}\n\n`);
    for (const r of healthy.sort((a, b) => b.health_score - a.health_score)) {
      process.stdout.write(`  ${pad(r.name, 35)} ${scoreBar(r.health_score, c)} ${c.green}${pad(String(r.health_score), 3)}/100${c.reset}`);
      if (r.downloads) process.stdout.write(`  ${c.dim}${fmt(r.downloads)}/wk${c.reset}`);
      process.stdout.write('\n');
      printExtras(r, c);
    }
  }

  // Errors
  if (errors.length > 0) {
    process.stdout.write(`\n  ${c.dim}ERRORS${c.reset}\n`);
    for (const r of errors) {
      process.stdout.write(`  ${c.dim}${r.name}: ${r.error}${c.reset}\n`);
    }
  }

  process.stdout.write(`\n  ${c.dim}${'─'.repeat(50)}${c.reset}\n`);
  process.stdout.write(`  ${c.dim}Tip: set GITHUB_TOKEN env for higher API rate limits${c.reset}\n\n`);
}

module.exports = { printReport };
