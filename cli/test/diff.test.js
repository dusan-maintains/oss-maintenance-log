'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { depsFromPkgJson } = require('../lib/diff');

describe('depsFromPkgJson', () => {
  it('extracts dependencies as a set', () => {
    const s = depsFromPkgJson(JSON.stringify({ dependencies: { a: '1', b: '2' } }), false);
    assert.ok(s.has('a') && s.has('b'));
    assert.equal(s.size, 2);
  });

  it('includes devDependencies only when asked', () => {
    const json = JSON.stringify({ dependencies: { a: '1' }, devDependencies: { d: '1' } });
    assert.ok(!depsFromPkgJson(json, false).has('d'));
    assert.ok(depsFromPkgJson(json, true).has('d'));
  });

  it('handles a package.json with no dependencies', () => {
    const s = depsFromPkgJson(JSON.stringify({ name: 'x' }), true);
    assert.equal(s.size, 0);
  });
});
