'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { toSarif } = require('../lib/sarif');

describe('toSarif', () => {
  it('returns valid SARIF 2.1.0 structure', () => {
    const results = [
      {
        name: 'test-pkg',
        health_score: 45,
        risk_level: 'warning',
        downloads: 1000,
        stars: 50,
        daysSincePush: 200,
        breakdown: { maintenance: 5, community: 4, popularity: 3, risk: 6 }
      }
    ];

    const sarif = toSarif(results);

    assert.equal(sarif.version, '2.1.0');
    assert.ok(sarif.$schema.includes('sarif-schema'));
    assert.equal(sarif.runs.length, 1);
    assert.equal(sarif.runs[0].tool.driver.name, 'oss-health-scan');
    assert.ok(sarif.runs[0].tool.driver.rules.length > 0);
    assert.equal(sarif.runs[0].results.length, 1);
  });

  it('maps risk levels to SARIF levels correctly', () => {
    const results = [
      { name: 'critical-pkg', health_score: 10, risk_level: 'critical', breakdown: {} },
      { name: 'warning-pkg', health_score: 45, risk_level: 'warning', breakdown: {} },
      { name: 'healthy-pkg', health_score: 80, risk_level: 'healthy', breakdown: {} }
    ];

    const sarif = toSarif(results);
    const levels = sarif.runs[0].results.map(r => r.level);

    assert.equal(levels[0], 'error');
    assert.equal(levels[1], 'warning');
    assert.equal(levels[2], 'note');
  });

  it('skips results with errors', () => {
    const results = [
      { name: 'broken-pkg', error: 'HTTP 404', health_score: null },
      { name: 'ok-pkg', health_score: 70, risk_level: 'healthy', breakdown: {} }
    ];

    const sarif = toSarif(results);
    assert.equal(sarif.runs[0].results.length, 1);
    assert.equal(sarif.runs[0].results[0].properties.packageName, 'ok-pkg');
  });

  it('includes package metadata in properties', () => {
    const results = [
      {
        name: 'react',
        health_score: 85,
        risk_level: 'healthy',
        downloads: 81000000,
        stars: 230000,
        daysSincePush: 1,
        breakdown: { maintenance: 9.5, community: 9.8, popularity: 9.9, risk: 10 }
      }
    ];

    const sarif = toSarif(results);
    const props = sarif.runs[0].results[0].properties;

    assert.equal(props.packageName, 'react');
    assert.equal(props.healthScore, 85);
    assert.equal(props.downloads, 81000000);
  });

  it('returns empty results for empty input', () => {
    const sarif = toSarif([]);
    assert.equal(sarif.runs[0].results.length, 0);
  });

  it('uses custom package.json path', () => {
    const results = [{ name: 'pkg', health_score: 50, risk_level: 'warning', breakdown: {} }];
    const sarif = toSarif(results, 'apps/web/package.json');
    const uri = sarif.runs[0].results[0].locations[0].physicalLocation.artifactLocation.uri;
    assert.equal(uri, 'apps/web/package.json');
  });
});
