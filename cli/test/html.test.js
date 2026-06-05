'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { toHtml } = require('../lib/html');

const sample = [
  { name: 'left-pad', health_score: 5, risk_level: 'critical', deprecated: true, downloads: 1200000, daysSincePush: 2604, blast: { level: 'MODERATE', score: 38 } },
  { name: 'express', health_score: 99, risk_level: 'healthy', downloads: 107000000, daysSincePush: 3, maintainerCount: 5, blast: { level: 'MODERATE', score: 40 } }
];

describe('toHtml', () => {
  it('produces a self-contained HTML document (inline CSS, no JS)', () => {
    const html = toHtml(sample, { project: 'demo', scanned: 2 });
    assert.match(html, /^<!DOCTYPE html>/);
    assert.match(html, /OSS Health Report/);
    assert.ok(html.includes('left-pad'));
    assert.ok(html.includes('express'));
    assert.ok(html.includes('<style>'));
    assert.ok(!html.includes('<script'));
  });

  it('escapes package names', () => {
    const html = toHtml([{ name: '<x>&"', health_score: 50, risk_level: 'warning', blast: { level: 'LOW', score: 5 } }], {});
    assert.ok(!html.includes('<x>&"'));
    assert.ok(html.includes('&lt;x&gt;'));
  });

  it('shows "no risk findings" for an all-healthy set', () => {
    const html = toHtml([{ name: 'react', health_score: 99, risk_level: 'healthy', blast: { level: 'LOW', score: 10 } }], {});
    assert.match(html, /No major risk findings/);
  });
});
