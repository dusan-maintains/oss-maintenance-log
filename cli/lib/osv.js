'use strict';

const https = require('https');

/**
 * Query OSV.dev for known vulnerabilities in an npm package version.
 * OSV.dev is a free, open vulnerability database by Google.
 * Zero dependencies — uses raw https POST.
 *
 * @param {string} name - npm package name
 * @param {string} version - installed version
 * @returns {Promise<object[]>} array of vulnerability objects
 */
async function queryOSV(name, version) {
  if (!name || !version) return [];

  const body = JSON.stringify({
    package: { name, ecosystem: 'npm' },
    version
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.osv.dev',
      path: '/v1/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'oss-health-scan'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) return resolve([]);
        try {
          const parsed = JSON.parse(data);
          return resolve(parsed.vulns || []);
        } catch (e) {
          return resolve([]);
        }
      });
    });

    req.on('error', () => resolve([]));
    req.setTimeout(10000, () => { req.destroy(); resolve([]); });
    req.write(body);
    req.end();
  });
}

/**
 * Summarize vulnerabilities into a compact object.
 *
 * @param {object[]} vulns - raw OSV.dev vulnerability objects
 * @returns {{ count: number, critical: number, high: number, moderate: number, low: number, ids: string[] }}
 */
function summarizeVulns(vulns) {
  if (!vulns || vulns.length === 0) {
    return { count: 0, critical: 0, high: 0, moderate: 0, low: 0, ids: [] };
  }

  let critical = 0, high = 0, moderate = 0, low = 0;
  const ids = [];

  for (const v of vulns) {
    const id = v.id || v.aliases?.[0] || 'UNKNOWN';
    ids.push(id);

    // OSV severity can be in database_specific or severity array
    const severity = extractSeverity(v);
    if (severity === 'CRITICAL') critical++;
    else if (severity === 'HIGH') high++;
    else if (severity === 'MODERATE' || severity === 'MEDIUM') moderate++;
    else low++;
  }

  return { count: vulns.length, critical, high, moderate, low, ids };
}

/**
 * Extract severity level from OSV vulnerability object.
 */
function extractSeverity(vuln) {
  // Check CVSS in severity array
  if (vuln.severity && vuln.severity.length > 0) {
    for (const s of vuln.severity) {
      if (s.type === 'CVSS_V3' && s.score) {
        const score = parseCVSSScore(s.score);
        if (score >= 9.0) return 'CRITICAL';
        if (score >= 7.0) return 'HIGH';
        if (score >= 4.0) return 'MODERATE';
        return 'LOW';
      }
    }
  }

  // Check database_specific severity
  if (vuln.database_specific && vuln.database_specific.severity) {
    return String(vuln.database_specific.severity).toUpperCase();
  }

  // Check ecosystem_specific
  if (vuln.ecosystem_specific && vuln.ecosystem_specific.severity) {
    return String(vuln.ecosystem_specific.severity).toUpperCase();
  }

  return 'MODERATE'; // default if unknown
}

/**
 * Parse CVSS v3 vector string to extract base score.
 * Format: CVSS:3.1/AV:N/AC:L/... — we look for the numeric score at end or compute from vector.
 */
function parseCVSSScore(cvssString) {
  if (!cvssString) return 5.0;
  // Some OSV entries have the score directly
  const scoreMatch = cvssString.match(/(\d+\.?\d*)\s*$/);
  if (scoreMatch) return parseFloat(scoreMatch[1]);
  // For CVSS vectors without explicit score, estimate from Attack Vector
  if (cvssString.includes('AV:N')) return 7.5;
  if (cvssString.includes('AV:A')) return 5.5;
  return 5.0;
}

module.exports = { queryOSV, summarizeVulns, extractSeverity };
