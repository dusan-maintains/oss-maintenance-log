'use strict';

const path = require('path');
const fs = require('fs');
const { fetchJson } = require('./fetcher');
const { computeScore } = require('./scoring');
const { getInstalledVersions, getVersionAge } = require('./outdated');
const { queryOSV, summarizeVulns } = require('./osv');

/**
 * Fetch info for a single npm package.
 * Returns raw package metadata + GitHub data.
 */
async function getPackageInfo(name) {
  const enc = encodeURIComponent(name);

  // Two small requests instead of one massive one:
  // 1. /latest endpoint: ~1-2KB (vs 50-250KB for full registry doc with all versions)
  // 2. Abbreviated doc: for modified date only
  const [latestMeta, abbrDoc, dlData] = await Promise.all([
    fetchJson(`https://registry.npmjs.org/${enc}/latest`).catch(() => null),
    fetchJson(`https://registry.npmjs.org/${enc}`, { 'Accept': 'application/vnd.npm.install-v1+json' }).catch(() => null),
    fetchJson(`https://api.npmjs.org/downloads/point/last-week/${enc}`).catch(() => null)
  ]);

  if (!latestMeta && !abbrDoc) {
    throw new Error(`Package "${name}" not found on npm`);
  }

  const latest = latestMeta ? latestMeta.version : (abbrDoc && abbrDoc['dist-tags'] && abbrDoc['dist-tags'].latest);
  const lastPublish = abbrDoc ? abbrDoc.modified : null;

  let repoUrl = null;
  const repo = latestMeta && latestMeta.repository;
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

  const downloads = dlData ? (dlData.downloads || 0) : 0;

  let ghData = null;
  if (owner && repoName) {
    try {
      const ghHeaders = { 'User-Agent': 'oss-health-scan' };
      if (process.env.GITHUB_TOKEN) ghHeaders['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
      const ghResponse = await fetchJson(`https://api.github.com/repos/${owner}/${repoName}`, ghHeaders);
      ghData = ghResponse.data || ghResponse;
    } catch (e) { /* GitHub data unavailable */ }
  }

  const deprecated = !!(latestMeta && latestMeta.deprecated);

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
    license: (latestMeta && latestMeta.license) || null
  };
}

/**
 * Scan a list of npm packages and return health results.
 *
 * @param {string[]} names - npm package names
 * @param {object} [options]
 * @param {number} [options.concurrency=2] - parallel fetch limit
 * @param {number} [options.threshold=0] - filter results below this score (0 = show all)
 * @param {boolean} [options.outdated=false] - include libyear/drift data (requires dir)
 * @param {boolean} [options.vulns=false] - check OSV.dev for known vulnerabilities
 * @param {string} [options.dir='.'] - project directory (for reading package-lock.json)
 * @returns {Promise<{scanned: number, results: object[], outdatedSummary?: object}>}
 *
 * @example
 *   const { scanPackages } = require('oss-health-scan');
 *   const { results } = await scanPackages(['react', 'lodash', 'moment']);
 *   for (const r of results) {
 *     console.log(`${r.name}: ${r.health_score}/100 [${r.risk_level}]`);
 *   }
 */
async function scanPackages(names, options) {
  const opts = { concurrency: process.env.GITHUB_TOKEN ? 5 : 2, threshold: 0, outdated: false, vulns: false, dir: '.', ...options };
  const results = [];

  // Load installed versions if outdated mode is on
  let installedVersions = {};
  if (opts.outdated) {
    installedVersions = getInstalledVersions(opts.dir || '.');
  }

  for (let i = 0; i < names.length; i += opts.concurrency) {
    const batch = names.slice(i, i + opts.concurrency);
    const infos = await Promise.all(batch.map(async (name) => {
      try {
        return await getPackageInfo(name);
      } catch (e) {
        return { name, error: e.message };
      }
    }));

    for (const info of infos) {
      if (info.error) {
        results.push({ name: info.name, health_score: null, risk_level: null, error: info.error });
        continue;
      }

      const score = computeScore(info);
      const entry = { ...info, ...score };

      // Outdated enrichment
      if (opts.outdated) {
        const installedVersion = installedVersions[info.name] || null;
        const age = await getVersionAge(info.name, installedVersion, info.latest, info.lastPublish);
        entry.installedVersion = age.installed;
        entry.libyear = age.libyear;
        entry.drift = age.drift;
      }

      // Vulnerability enrichment
      if (opts.vulns) {
        const version = (opts.outdated && installedVersions[info.name]) || info.latest;
        if (version) {
          const rawVulns = await queryOSV(info.name, version);
          entry.vulns = summarizeVulns(rawVulns);
        } else {
          entry.vulns = { count: 0, critical: 0, high: 0, moderate: 0, low: 0, ids: [] };
        }
      }

      results.push(entry);
    }
  }

  const filtered = opts.threshold > 0
    ? results.filter(r => r.health_score !== null && r.health_score < opts.threshold)
    : results;

  // Outdated summary
  let outdatedSummary = null;
  if (opts.outdated) {
    const withDrift = filtered.filter(r => r.drift && r.drift !== 'up-to-date');
    const totalLibyear = filtered.reduce((s, r) => s + (r.libyear || 0), 0);
    outdatedSummary = {
      totalLibyear: parseFloat(totalLibyear.toFixed(1)),
      outdatedCount: withDrift.length,
      majorDrift: withDrift.filter(r => r.drift === 'major').length,
      minorDrift: withDrift.filter(r => r.drift === 'minor').length,
      patchDrift: withDrift.filter(r => r.drift === 'patch').length
    };
  }

  return { scanned: names.length, results: filtered, ...(outdatedSummary ? { outdatedSummary } : {}) };
}

/**
 * Scan dependencies from a package.json file.
 *
 * @param {string} [dir='.'] - directory containing package.json
 * @param {object} [options]
 * @param {boolean} [options.dev=false] - include devDependencies
 * @param {number} [options.concurrency=2]
 * @param {number} [options.threshold=0]
 * @returns {Promise<{scanned: number, results: object[], pkgName: string}>}
 */
async function scanPackageJson(dir, options) {
  const opts = { dev: false, ...options };
  const pkgPath = path.resolve(dir || '.', 'package.json');

  if (!fs.existsSync(pkgPath)) {
    throw new Error(`${pkgPath} not found`);
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const deps = Object.keys(pkg.dependencies || {});
  const devDeps = opts.dev ? Object.keys(pkg.devDependencies || {}) : [];
  const names = [...deps, ...devDeps];

  if (names.length === 0) {
    return { scanned: 0, results: [], pkgName: pkg.name };
  }

  const result = await scanPackages(names, opts);
  return { ...result, pkgName: pkg.name };
}

module.exports = { scanPackages, scanPackageJson, getPackageInfo };
