'use strict';

const https = require('https');

/**
 * Batch-fetch GitHub repository data via GraphQL API.
 * Reduces N REST calls to 1 GraphQL query.
 * Requires GITHUB_TOKEN (GraphQL API is auth-only).
 *
 * @param {{ owner: string, repo: string }[]} repos - list of owner/repo pairs
 * @param {string} token - GitHub personal access token
 * @returns {Promise<Map<string, object>>} map of "owner/repo" → repo data
 */
async function batchFetchRepos(repos, token) {
  if (!repos.length || !token) return new Map();

  // Build GraphQL query with aliases
  const fragments = repos.map((r, i) => {
    const alias = `r${i}`;
    return `${alias}: repository(owner: "${escapeGql(r.owner)}", name: "${escapeGql(r.repo)}") {
      stargazerCount
      forkCount
      isArchived
      pushedAt
      licenseInfo { spdxId }
      issues(states: OPEN) { totalCount }
    }`;
  });

  const query = `query { ${fragments.join('\n')} }`;

  const result = await graphqlRequest(query, token);
  if (!result || !result.data) return new Map();

  const map = new Map();
  repos.forEach((r, i) => {
    const alias = `r${i}`;
    const data = result.data[alias];
    if (data) {
      map.set(`${r.owner}/${r.repo}`, {
        stargazers_count: data.stargazerCount,
        forks_count: data.forkCount,
        open_issues_count: data.issues ? data.issues.totalCount : 0,
        pushed_at: data.pushedAt,
        archived: data.isArchived,
        license: data.licenseInfo ? data.licenseInfo.spdxId : null
      });
    }
  });

  return map;
}

/**
 * Execute a GraphQL query against GitHub API.
 */
function graphqlRequest(query, token) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query });

    const req = https.request({
      hostname: 'api.github.com',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'oss-health-scan/1.4',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`GitHub GraphQL: HTTP ${res.statusCode}`));
        }
        try {
          const parsed = JSON.parse(data);
          if (parsed.errors && parsed.errors.length > 0) {
            // Partial errors are OK — some repos might not exist
            // Return what we have
          }
          resolve(parsed);
        } catch (e) {
          reject(new Error('GitHub GraphQL: invalid JSON response'));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('GitHub GraphQL: timeout')); });
    req.write(body);
    req.end();
  });
}

/**
 * Escape string for GraphQL string literal.
 */
function escapeGql(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

module.exports = { batchFetchRepos };
