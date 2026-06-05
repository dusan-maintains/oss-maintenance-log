'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { computeBlastRadius, suggestedAction, whyItMatters } = require('../lib/blast');

describe('computeBlastRadius', () => {
  it('rates popular + single-maintainer + install-scripts + deprecated as EXTREME', () => {
    const b = computeBlastRadius({ downloads: 60e6, hasInstallScripts: true, maintainerCount: 1, deprecated: true });
    assert.equal(b.level, 'EXTREME');
    assert.ok(b.score >= 70);
    assert.ok(b.reasons.length >= 3);
  });

  it('rates a healthy popular multi-maintainer package LOW or MODERATE', () => {
    const b = computeBlastRadius({ downloads: 5e6, hasInstallScripts: false, maintainerCount: 8, deprecated: false, archived: false, daysSincePush: 3 });
    assert.ok(b.level === 'LOW' || b.level === 'MODERATE');
    assert.ok(b.score < 45);
  });

  it('counts known advisories into the score', () => {
    const base = { downloads: 2e6, maintainerCount: 5 };
    const without = computeBlastRadius(base);
    const withCve = computeBlastRadius({ ...base, vulns: { count: 2 } });
    assert.ok(withCve.score > without.score);
  });

  it('never exceeds 100', () => {
    const b = computeBlastRadius({ downloads: 500e6, hasInstallScripts: true, maintainerCount: 1, deprecated: true, archived: true, vulns: { count: 9 } });
    assert.ok(b.score <= 100);
    assert.equal(b.level, 'EXTREME');
  });

  it('handles missing fields without throwing', () => {
    const b = computeBlastRadius({});
    assert.ok(typeof b.score === 'number');
    assert.ok(['LOW', 'MODERATE', 'HIGH', 'EXTREME'].includes(b.level));
  });
});

describe('advice', () => {
  it('suggests known replacements for moment', () => {
    const a = suggestedAction({ name: 'moment', deprecated: false, risk_level: 'warning' });
    assert.match(a, /dayjs|date-fns|luxon/);
  });

  it('tells you to remove a deprecated package', () => {
    const a = suggestedAction({ name: 'request', deprecated: true, risk_level: 'critical' });
    assert.match(a, /Remove|migrate|undici|got|axios/);
  });

  it('whyItMatters always returns at least one reason', () => {
    assert.ok(whyItMatters({}).length > 0);
    assert.ok(whyItMatters({ downloads: 1e6, maintainerCount: 1, hasInstallScripts: true }).length >= 2);
  });
});
