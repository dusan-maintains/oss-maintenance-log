'use strict';

const path = require('path');
const fs = require('fs');
const { fetchJson } = require('./fetcher');
const { computeScore } = require('./scoring');

/**
 * Fetch info for a single npm package.
 * Returns raw package metadata + GitHub data.
 */
async function getPackageInfo(name) {
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
      const ghHeaders = { 'User-Agent': 'oss-health-scan' };
      if (process.env.GITHUB_TOKEN) ghHeaders['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
      const ghResponse = await fetchJson(`https://api.github.com/repos/${owner}/${repoName}`, ghHeaders);
      ghData = ghResponse.data || ghResponse;
    } catch (e) { /* GitHub data unavailable */ }
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
}

/**
 * Scan a list of npm packages and return health results.
 *
 * @param {string[]} names - npm package names
 * @param {object} [options]
 * @param {number} [options.concurrency=2] - parallel fetch limit
 * @param {number} [options.threshold=0] - filter results below this score (0 = show all)
 * @returns {Promise<{scanned: number, results: object[]}>}
 *
 * @example
 *   const { scanPackages } = require('oss-health-scan');
 *   const { results } = await scanPackages(['react', 'lodash', 'moment']);
 *   for (const r of results) {
 *     console.log(`${r.name}: ${r.health_score}/100 [${r.risk_level}]`);
 *   }
 */
async function scanPackages(names, options) {
  const opts = { concurrency: process.env.GITHUB_TOKEN ? 5 : 2, threshold: 0, ...options };
  const results = [];

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
      results.push({ ...info, ...score });
    }
  }

  const filtered = opts.threshold > 0
    ? results.filter(r => r.health_score !== null && r.health_score < opts.threshold)
    : results;

  return { scanned: names.length, results: filtered };
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
