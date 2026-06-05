'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { toIssuesMarkdown } = require('../lib/issues');

describe('toIssuesMarkdown', () => {
  it('drafts issues for deprecated/critical packages with alternatives', () => {
    const md = toIssuesMarkdown([
      { name: 'request', health_score: 5, risk_level: 'critical', deprecated: true, downloads: 14000000, blast: { level: 'HIGH' } },
      { name: 'express', health_score: 99, risk_level: 'healthy' }
    ]);
    assert.match(md, /Replace deprecated dependency: `request`/);
    assert.match(md, /undici|got|axios/);
    assert.ok(!md.includes('express'));
    assert.match(md, /review before filing/);
  });

  it('returns a placeholder when nothing is abandoned', () => {
    const md = toIssuesMarkdown([{ name: 'react', health_score: 99, risk_level: 'healthy' }]);
    assert.match(md, /no abandoned/);
  });
});
