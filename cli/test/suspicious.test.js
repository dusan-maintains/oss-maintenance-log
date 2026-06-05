'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { suspiciousRelease } = require('../lib/posture');

describe('suspiciousRelease', () => {
  it('flags a fresh publish on a cold repo with install scripts', () => {
    const s = suspiciousRelease({ daysSincePublish: 5, daysSincePush: 900, hasInstallScripts: true, maintainerCount: 1 });
    assert.equal(s.flagged, true);
    assert.ok(s.reasons.some(r => /inactive repository/.test(r)));
  });

  it('does not flag an actively maintained package', () => {
    const s = suspiciousRelease({ daysSincePublish: 5, daysSincePush: 3, hasInstallScripts: true, maintainerCount: 8 });
    assert.equal(s.flagged, false);
  });

  it('does not flag a long-cold package with no recent publish', () => {
    const s = suspiciousRelease({ daysSincePublish: 900, daysSincePush: 900, hasInstallScripts: false, maintainerCount: 1 });
    assert.equal(s.flagged, false);
  });
});
