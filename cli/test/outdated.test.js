'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { parseSemver, getVersionAge, getInstalledVersions } = require('../lib/outdated');

describe('parseSemver', () => {
  it('parses standard version', () => {
    const v = parseSemver('1.2.3');
    assert.deepEqual(v, { major: 1, minor: 2, patch: 3 });
  });

  it('strips caret prefix', () => {
    const v = parseSemver('^1.2.3');
    assert.deepEqual(v, { major: 1, minor: 2, patch: 3 });
  });

  it('strips tilde prefix', () => {
    const v = parseSemver('~1.2.3');
    assert.deepEqual(v, { major: 1, minor: 2, patch: 3 });
  });

  it('strips >=  prefix', () => {
    const v = parseSemver('>=1.2.3');
    assert.deepEqual(v, { major: 1, minor: 2, patch: 3 });
  });

  it('handles prerelease suffix', () => {
    const v = parseSemver('2.0.0-beta.1');
    assert.deepEqual(v, { major: 2, minor: 0, patch: 0 });
  });

  it('returns null for null input', () => {
    assert.equal(parseSemver(null), null);
  });

  it('returns null for unparseable string', () => {
    assert.equal(parseSemver('latest'), null);
  });
});

describe('getVersionAge', () => {
  it('returns libyear 0 when installed equals latest', async () => {
    const result = await getVersionAge('foo', '1.0.0', '1.0.0', '2025-01-01');
    assert.equal(result.libyear, 0);
    assert.equal(result.drift, null);
  });

  it('classifies major drift', async () => {
    const result = await getVersionAge('foo', '1.0.0', '3.0.0', '2025-01-01');
    assert.equal(result.drift, 'major');
    assert.ok(result.libyear > 0);
  });

  it('classifies minor drift', async () => {
    const result = await getVersionAge('foo', '1.0.0', '1.5.0', '2025-01-01');
    assert.equal(result.drift, 'minor');
  });

  it('classifies patch drift', async () => {
    const result = await getVersionAge('foo', '1.0.0', '1.0.5', '2025-01-01');
    assert.equal(result.drift, 'patch');
  });

  it('handles null installed version', async () => {
    const result = await getVersionAge('foo', null, '1.0.0', '2025-01-01');
    assert.equal(result.libyear, 0);
  });

  it('handles unparseable versions gracefully', async () => {
    const result = await getVersionAge('foo', 'latest', '1.0.0', '2025-01-01');
    assert.equal(result.libyear, 0);
    assert.equal(result.drift, null);
  });
});

describe('getInstalledVersions', () => {
  it('returns empty object for nonexistent directory', () => {
    const result = getInstalledVersions('/nonexistent/path/12345');
    assert.deepEqual(result, {});
  });
});
