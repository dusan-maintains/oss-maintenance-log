'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

// Test that api module exports correctly
const api = require('../lib/api');

describe('api module exports', () => {
  it('exports scanPackages function', () => {
    assert.equal(typeof api.scanPackages, 'function');
  });

  it('exports scanPackageJson function', () => {
    assert.equal(typeof api.scanPackageJson, 'function');
  });

  it('exports getPackageInfo function', () => {
    assert.equal(typeof api.getPackageInfo, 'function');
  });
});

describe('scanPackageJson', () => {
  it('throws on missing package.json', async () => {
    await assert.rejects(
      () => api.scanPackageJson('/nonexistent/path'),
      /not found/
    );
  });

  it('scans own package.json without error', async () => {
    const cliDir = path.resolve(__dirname, '..');
    const result = await api.scanPackageJson(cliDir, { dev: false });
    assert.ok(result.pkgName === 'oss-health-scan');
    assert.equal(result.scanned, 0); // zero deps by design
    assert.ok(Array.isArray(result.results));
  });
});
