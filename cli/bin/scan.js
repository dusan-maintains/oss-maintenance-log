#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');
const { fetchJson } = require('../lib/fetcher');
const { computeScore } = require('../lib/scoring');
const { printReport } = require('../lib/reporter');

const HELP = `
  oss-health-scan — scan dependencies for abandoned/unhealthy packages

  Usage:
    npx oss-health-scan                  Scan ./package.json
    npx oss-health-scan path/to/dir      Scan package.json in given directory
    npx oss-health-scan pkg1 pkg2 ...    Scan specific npm packages

  Options:
    --json          Output raw JSON instead of terminal report
    --ci            Output GitHub Actions annotations (::warning::, ::error::)
    --threshold N   Only show packages below health score N (default: show all)
    --dev           Include devDependencies
    --no-color      Disable colored output
    -h, --help      Show this help
`;

async function resolvePackages(args) {
  const flags = { json: false, ci: false, threshold: 0, dev: false, color: true, packages: [] };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--json') flags.json = true;
    else if (a === '--ci') flags.ci = true;
    else if (a === '--dev') flags.dev = true;
    else if (a === '--no-color') flags.color = false;
    else if (a === '-h' || a === '--help') { process.stdout.write(HELP); process.exit(0); }
    else if (a === '--threshold') { flags.threshold = parseInt(args[++i]) || 0; }
    else flags.packages.push(a);
  }

  if (flags.packages.length > 0) {
    return { packages: flags.packages, flags };
  }

  const dir = flags.packages[0] || '.';
  const pkgPath = path.resolve(dir, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    process.stderr.write(`Error: ${pkgPath} not found\n`);
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const deps = Object.keys(pkg.dependencies || {});
  const devDeps = flags.dev ? Object.keys(pkg.devDependencies || {}) : [];
  return { packages: [...deps, ...devDeps], flags, pkgName: pkg.name };
}

async function getPackageInfo(name) {
  try {
    const registry = await fetchJson(`https://registry.npmjs.org/${encodeURIComponent(name)}`);
    const latest = registry['dist-tags'] && registry['dist-tags'].latest;
    const latestMeta = latest && registry.versions && registry.versions[latest];
    const time = registry.time || {};

    let repoUrl = null;
    const repo = registry.repository || (latestMeta && latestMeta.repository);
    if (repo) {
      const url = typeof repo === 'string' ? repo : repo.url;
      if (url) {
        repoUrl = url.replace(/^git\+/, '').replace(/\.git$/, '').replace(/^ssh:\/\/git@github\.com/, 'https://github.com');
      }
    }

    let owner = null, repoName = null;
    if (repoUrl) {
      const m = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (m) { owner = m[1]; repoName = m[2]; }
    }

    let downloads = 0;
    try {
      const dl = await fetchJson(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name)}`);
      downloads = dl.downloads || 0;
    } catch (e) { /* no downloads data */ }

    let ghData = null;
    if (owner && repoName) {
      try {
        ghData = await fetchJson(`https://api.github.com/repos/${owner}/${repoName}`, {
          'User-Agent': 'oss-health-scan',
          ...(process.env.GITHUB_TOKEN ? { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` } : {})
        });
      } catch (e) { /* no gh data */ }
    }

    const lastPublish = time[latest] || time.modified;
    const deprecated = !!(latestMeta && latestMeta.deprecated) || !!(registry.deprecated);

    return {
      name,
      latest,
      deprecated,
      deprecatedMsg: (latestMeta && latestMeta.deprecated) || null,
      lastPublish,
      daysSincePublish: lastPublish ? Math.round((Date.now() - new Date(lastPublish).getTime()) / 86400000) : null,
      downloads,
      owner,
      repo: repoName,
      repoUrl,
      stars: ghData ? ghData.stargazers_count : null,
      forks: ghData ? ghData.forks_count : null,
      openIssues: ghData ? ghData.open_issues_count : null,
      pushedAt: ghData ? ghData.pushed_at : null,
      daysSincePush: ghData && ghData.pushed_at ? Math.round((Date.now() - new Date(ghData.pushed_at).getTime()) / 86400000) : null,
      archived: ghData ? ghData.archived : false,
      license: (latestMeta && latestMeta.license) || registry.license || null
    };
  } catch (e) {
    return { name, error: e.message };
  }
}

async function main() {
  const { packages, flags, pkgName } = await resolvePackages(process.argv.slice(2));

  if (packages.length === 0) {
    process.stderr.write('No packages to scan.\n');
    process.exit(1);
  }

  const header = pkgName
    ? `\n  Scanning ${packages.length} dependencies of ${pkgName}...\n`
    : `\n  Scanning ${packages.length} package(s)...\n`;
  if (!flags.json) process.stderr.write(header);

  const concurrency = process.env.GITHUB_TOKEN ? 5 : 2;
  const results = [];

  for (let i = 0; i < packages.length; i += concurrency) {
    const batch = packages.slice(i, i + concurrency);
    const infos = await Promise.all(batch.map(p => getPackageInfo(p)));

    for (const info of infos) {
      if (info.error) {
        results.push({ name: info.name, health_score: null, error: info.error });
        continue;
      }
      const score = computeScore(info);
      results.push({ ...info, ...score });
    }

    if (!flags.json) {
      const done = Math.min(i + concurrency, packages.length);
      process.stderr.write(`  [${done}/${packages.length}]\r`);
    }
  }

  if (!flags.json) process.stderr.write('\n');

  const filtered = flags.threshold > 0
    ? results.filter(r => r.health_score !== null && r.health_score < flags.threshold)
    : results;

  if (flags.json) {
    process.stdout.write(JSON.stringify({ scanned: packages.length, results: filtered }, null, 2) + '\n');
  } else if (flags.ci) {
    for (const r of filtered) {
      if (r.error) continue;
      const level = r.risk_level === 'critical' ? 'error' : r.risk_level === 'warning' ? 'warning' : 'notice';
      const msg = `${r.name}@${r.latest || '?'}: health ${r.health_score}/100` +
        (r.reason ? ` — ${r.reason}` : '') +
        (r.daysSincePush ? ` (last push ${r.daysSincePush}d ago)` : '');
      process.stdout.write(`::${level}::${msg}\n`);
    }
    printReport(filtered, flags.color);
  } else {
    printReport(filtered, flags.color);
  }

  const critical = results.filter(r => r.risk_level === 'critical').length;
  process.exit(critical > 0 ? 1 : 0);
}

main().catch(e => {
  process.stderr.write(`Fatal: ${e.message}\n`);
  process.exit(2);
});
