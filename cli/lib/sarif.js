'use strict';

const { version } = require('../package.json');

/**
 * Convert scan results to SARIF 2.1.0 format for GitHub Code Scanning.
 *
 * SARIF (Static Analysis Results Interchange Format) is the OASIS standard
 * consumed by GitHub Advanced Security, VS Code, and most SAST tools.
 *
 * @param {object[]} results - scan results from scanPackages()
 * @param {string} [pkgJsonPath='package.json'] - path to the scanned package.json
 * @returns {object} SARIF 2.1.0 JSON
 */
function toSarif(results, pkgJsonPath) {
  pkgJsonPath = pkgJsonPath || 'package.json';

  const rules = [];
  const ruleIndex = {};
  const sarifResults = [];

  for (const r of results) {
    if (r.error || r.health_score == null) continue;

    const ruleId = `oss-health/${r.risk_level}`;
    if (!(ruleId in ruleIndex)) {
      ruleIndex[ruleId] = rules.length;
      rules.push({
        id: ruleId,
        shortDescription: { text: riskLabel(r.risk_level) },
        fullDescription: { text: riskDescription(r.risk_level) },
        defaultConfiguration: {
          level: r.risk_level === 'critical' ? 'error' : r.risk_level === 'warning' ? 'warning' : 'note'
        },
        properties: { tags: ['supply-chain', 'maintenance'] }
      });
    }

    const msg = buildMessage(r);

    sarifResults.push({
      ruleId,
      ruleIndex: ruleIndex[ruleId],
      level: r.risk_level === 'critical' ? 'error' : r.risk_level === 'warning' ? 'warning' : 'note',
      message: { text: msg },
      locations: [{
        physicalLocation: {
          artifactLocation: { uri: pkgJsonPath, uriBaseId: '%SRCROOT%' },
          region: { startLine: 1 }
        }
      }],
      properties: {
        packageName: r.name,
        healthScore: r.health_score,
        riskLevel: r.risk_level,
        downloads: r.downloads || 0,
        stars: r.stars || 0,
        daysSincePush: r.daysSincePush || null,
        breakdown: r.breakdown || null
      }
    });
  }

  return {
    $schema: 'https://docs.oasis-open.org/sarif/sarif/v2.1.0/errata01/os/schemas/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [{
      tool: {
        driver: {
          name: 'oss-health-scan',
          informationUri: 'https://github.com/dusan-maintains/oss-maintenance-log',
          version,
          rules
        }
      },
      results: sarifResults
    }]
  };
}

function riskLabel(level) {
  if (level === 'critical') return 'Critical: package is abandoned, deprecated, or archived';
  if (level === 'warning') return 'Warning: package shows signs of reduced maintenance';
  return 'Healthy package';
}

function riskDescription(level) {
  if (level === 'critical') return 'This dependency has a health score below 30/100, indicating it may be abandoned, deprecated, or archived. Consider finding an alternative.';
  if (level === 'warning') return 'This dependency has a health score between 30-59/100, indicating reduced maintenance activity. Monitor for abandonment.';
  return 'This dependency has a health score of 60+/100 and appears actively maintained.';
}

function buildMessage(r) {
  const parts = [`${r.name}: health score ${r.health_score}/100`];
  if (r.reason) parts.push(r.reason);
  if (r.daysSincePush) parts.push(`last push ${r.daysSincePush}d ago`);
  if (r.downloads) parts.push(`${fmt(r.downloads)} downloads/week`);
  if (r.breakdown) {
    parts.push(`breakdown: maintenance=${r.breakdown.maintenance}, community=${r.breakdown.community}, popularity=${r.breakdown.popularity}, risk=${r.breakdown.risk}`);
  }
  return parts.join(' | ');
}

function fmt(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
  return String(n);
}

module.exports = { toSarif };
