'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { computeScore, logScore, decayScore } = require('../lib/scoring');

// ── logScore ──────────────────────────────────────────────────

describe('logScore', () => {
  it('returns 0 for zero input', () => {
    assert.equal(logScore(0, 1000), 0);
  });

  it('returns 0 for negative input', () => {
    assert.equal(logScore(-5, 1000), 0);
  });

  it('returns value between 0 and 10 for positive input', () => {
    const s = logScore(500, 1000);
    assert.ok(s > 0 && s <= 10, `Expected 0 < ${s} <= 10`);
  });

  it('scales logarithmically — 1M scores higher than 1k', () => {
    const s1k = logScore(1000, 1000000);
    const s1m = logScore(1000000, 1000000);
    assert.ok(s1m > s1k, `${s1m} should be > ${s1k}`);
  });

  it('caps at 10', () => {
    const s = logScore(999999999, 1000);
    assert.ok(s <= 10, `Expected ${s} <= 10`);
  });
});

// ── decayScore ────────────────────────────────────────────────

describe('decayScore', () => {
  it('returns 10 for zero days', () => {
    assert.equal(decayScore(0, 180), 10);
  });

  it('returns 10 for negative days', () => {
    assert.equal(decayScore(-10, 180), 10);
  });

  it('decays over time', () => {
    const s30 = decayScore(30, 180);
    const s365 = decayScore(365, 180);
    assert.ok(s30 > s365, `30d score ${s30} should be > 365d score ${s365}`);
  });

  it('approaches 0 for very old dates', () => {
    const s = decayScore(5000, 180);
    assert.ok(s < 0.1, `Expected ${s} < 0.1 for 5000 days`);
  });
});

// ── computeScore ──────────────────────────────────────────────

describe('computeScore', () => {
  it('returns score 5 for deprecated package', () => {
    const result = computeScore({ deprecated: true, deprecatedMsg: 'Use xyz' });
    assert.equal(result.health_score, 5);
    assert.equal(result.risk_level, 'critical');
    assert.ok(result.reason.includes('DEPRECATED'));
  });

  it('returns score 8 for archived package', () => {
    const result = computeScore({ archived: true });
    assert.equal(result.health_score, 8);
    assert.equal(result.risk_level, 'critical');
    assert.ok(result.reason.includes('ARCHIVED'));
  });

  it('healthy active package scores above 60', () => {
    const result = computeScore({
      stars: 5000,
      forks: 500,
      openIssues: 10,
      downloads: 500000,
      daysSincePush: 5,
      daysSincePublish: 30,
      deprecated: false,
      archived: false
    });
    assert.ok(result.health_score >= 60, `Expected >= 60, got ${result.health_score}`);
    assert.equal(result.risk_level, 'healthy');
  });

  it('inactive package scores below 30', () => {
    const result = computeScore({
      stars: 2,
      forks: 0,
      openIssues: 0,
      downloads: 10,
      daysSincePush: 2000,
      daysSincePublish: 2000,
      deprecated: false,
      archived: false
    });
    assert.ok(result.health_score < 30, `Expected < 30, got ${result.health_score}`);
    assert.equal(result.risk_level, 'critical');
  });

  it('handles null/missing fields gracefully', () => {
    const result = computeScore({
      stars: null,
      forks: null,
      openIssues: null,
      downloads: 0,
      daysSincePush: null,
      daysSincePublish: null,
      deprecated: false,
      archived: false
    });
    assert.ok(typeof result.health_score === 'number');
    assert.ok(result.health_score >= 0 && result.health_score <= 100);
    assert.ok(result.breakdown);
  });

  it('includes breakdown in result', () => {
    const result = computeScore({
      stars: 100, forks: 10, openIssues: 5,
      downloads: 1000, daysSincePush: 30, daysSincePublish: 60,
      deprecated: false, archived: false
    });
    assert.ok(result.breakdown);
    assert.ok(typeof result.breakdown.maintenance === 'number');
    assert.ok(typeof result.breakdown.community === 'number');
    assert.ok(typeof result.breakdown.popularity === 'number');
    assert.ok(typeof result.breakdown.risk === 'number');
  });

  it('score is between 0 and 100', () => {
    const extremes = [
      { stars: 0, forks: 0, openIssues: 500, downloads: 0, daysSincePush: 9999, daysSincePublish: 9999, deprecated: false, archived: false },
      { stars: 999999, forks: 99999, openIssues: 0, downloads: 50000000, daysSincePush: 0, daysSincePublish: 0, deprecated: false, archived: false }
    ];
    for (const data of extremes) {
      const result = computeScore(data);
      assert.ok(result.health_score >= 0, `Score ${result.health_score} should be >= 0`);
      assert.ok(result.health_score <= 100, `Score ${result.health_score} should be <= 100`);
    }
  });

  it('warning level for mid-range scores', () => {
    const result = computeScore({
      stars: 100, forks: 10, openIssues: 50,
      downloads: 5000, daysSincePush: 400, daysSincePublish: 500,
      deprecated: false, archived: false, license: 'MIT'
    });
    assert.ok(result.risk_level === 'warning' || result.risk_level === 'critical',
      `Expected warning or critical, got ${result.risk_level}`);
  });

  it('penalizes GPL license', () => {
    const mit = computeScore({
      stars: 100, forks: 10, openIssues: 5, downloads: 1000,
      daysSincePush: 30, daysSincePublish: 60,
      deprecated: false, archived: false, license: 'MIT'
    });
    const gpl = computeScore({
      stars: 100, forks: 10, openIssues: 5, downloads: 1000,
      daysSincePush: 30, daysSincePublish: 60,
      deprecated: false, archived: false, license: 'GPL-3.0'
    });
    assert.ok(mit.health_score > gpl.health_score,
      `MIT (${mit.health_score}) should score higher than GPL (${gpl.health_score})`);
  });

  it('penalizes missing license', () => {
    const withLicense = computeScore({
      stars: 100, forks: 10, openIssues: 5, downloads: 1000,
      daysSincePush: 30, daysSincePublish: 60,
      deprecated: false, archived: false, license: 'MIT'
    });
    const noLicense = computeScore({
      stars: 100, forks: 10, openIssues: 5, downloads: 1000,
      daysSincePush: 30, daysSincePublish: 60,
      deprecated: false, archived: false, license: null
    });
    assert.ok(withLicense.health_score > noLicense.health_score,
      `With license (${withLicense.health_score}) should score higher than no license (${noLicense.health_score})`);
  });

  it('ratio-based issue scoring: small project with many issues penalized', () => {
    const clean = computeScore({
      stars: 50, forks: 5, openIssues: 0, downloads: 1000,
      daysSincePush: 30, daysSincePublish: 60,
      deprecated: false, archived: false, license: 'MIT'
    });
    const overloaded = computeScore({
      stars: 50, forks: 5, openIssues: 50, downloads: 1000,
      daysSincePush: 30, daysSincePublish: 60,
      deprecated: false, archived: false, license: 'MIT'
    });
    const diff = clean.health_score - overloaded.health_score;
    assert.ok(diff > 3, `50 issues on 50-star project should penalize (actual: ${diff.toFixed(1)})`);
  });

  it('ratio-based issue scoring: popular project with many issues not penalized', () => {
    // React-like: 200k stars, 1000 issues = ratio 0.005 = healthy
    const result = computeScore({
      stars: 200000, forks: 40000, openIssues: 1000, downloads: 50000000,
      daysSincePush: 1, daysSincePublish: 7,
      deprecated: false, archived: false, license: 'MIT'
    });
    assert.ok(result.health_score >= 70,
      `Popular project with 1000 issues should still score 70+ (got ${result.health_score})`);
    assert.equal(result.risk_level, 'healthy');
  });
});
