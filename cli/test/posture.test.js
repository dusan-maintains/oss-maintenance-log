'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { maintainerRisk, securityPosture } = require('../lib/posture');

describe('maintainerRisk', () => {
  it('flags high risk for a single-maintainer, stale, backlogged package', () => {
    const r = maintainerRisk({ maintainerCount: 1, daysSincePush: 800, daysSincePublish: 900, stars: 100, openIssues: 80 });
    assert.equal(r.level, 'high');
    assert.ok(r.signals.length >= 3);
  });

  it('returns minimal for a healthy multi-maintainer package', () => {
    const r = maintainerRisk({ maintainerCount: 6, daysSincePush: 10, daysSincePublish: 20, stars: 50000, openIssues: 100 });
    assert.equal(r.level, 'minimal');
    assert.equal(r.signals.length, 0);
  });
});

describe('securityPosture', () => {
  it('reports install scripts, license, and activity', () => {
    const p = securityPosture({ hasInstallScripts: true, license: 'MIT', maintainerCount: 3, daysSincePush: 5 });
    assert.equal(p.installScripts, true);
    assert.equal(p.hasLicense, true);
    assert.equal(p.multiMaintainer, true);
    assert.equal(p.activeWithinYear, true);
  });

  it('handles missing fields without throwing', () => {
    const p = securityPosture({});
    assert.equal(p.installScripts, false);
    assert.equal(p.hasLicense, false);
    assert.equal(p.multiMaintainer, null);
  });
});
