'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { readLockfile, findWorkspaceDirs } = require('../lib/lockfile');

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'oss-lock-'));
}

describe('readLockfile', () => {
  it('parses npm package-lock v3 packages map and respects prodOnly', () => {
    const d = tmp();
    fs.writeFileSync(path.join(d, 'package-lock.json'), JSON.stringify({
      lockfileVersion: 3,
      packages: {
        '': { name: 'app' },
        'node_modules/lodash': { version: '4.17.21' },
        'node_modules/moment': { version: '2.30.1' },
        'node_modules/jest': { version: '29.0.0', dev: true },
        'node_modules/a/node_modules/b': { version: '1.0.0' }
      }
    }));
    const all = readLockfile(d);
    assert.equal(all.source, 'package-lock.json');
    for (const n of ['lodash', 'moment', 'jest', 'b']) assert.ok(all.names.includes(n), n);

    const prod = readLockfile(d, { prodOnly: true });
    assert.ok(!prod.names.includes('jest'));
    assert.ok(prod.names.includes('lodash'));
  });

  it('parses npm package-lock v1 nested dependencies', () => {
    const d = tmp();
    fs.writeFileSync(path.join(d, 'package-lock.json'), JSON.stringify({
      lockfileVersion: 1,
      dependencies: {
        lodash: { version: '4.17.21' },
        chalk: { version: '5.0.0', dependencies: { 'ansi-styles': { version: '6.0.0' } } }
      }
    }));
    const all = readLockfile(d);
    for (const n of ['lodash', 'chalk', 'ansi-styles']) assert.ok(all.names.includes(n), n);
  });

  it('returns empty with no lockfile', () => {
    const r = readLockfile(tmp());
    assert.equal(r.names.length, 0);
    assert.equal(r.source, null);
  });
});

describe('findWorkspaceDirs', () => {
  it('returns empty array when no workspaces defined', () => {
    const d = tmp();
    fs.writeFileSync(path.join(d, 'package.json'), JSON.stringify({ name: 'root' }));
    assert.deepEqual(findWorkspaceDirs(d), []);
  });

  it('detects workspaces from package.json array (npm / yarn)', () => {
    const d = tmp();
    fs.writeFileSync(path.join(d, 'package.json'), JSON.stringify({
      name: 'monorepo',
      workspaces: ['packages/*']
    }));
    const p1 = path.join(d, 'packages', 'pkg-a');
    const p2 = path.join(d, 'packages', 'pkg-b');
    fs.mkdirSync(p1, { recursive: true });
    fs.mkdirSync(p2, { recursive: true });
    fs.writeFileSync(path.join(p1, 'package.json'), JSON.stringify({ name: 'pkg-a' }));
    fs.writeFileSync(path.join(p2, 'package.json'), JSON.stringify({ name: 'pkg-b' }));

    const ws = findWorkspaceDirs(d);
    assert.equal(ws.length, 2);
    assert.ok(ws.includes(p1));
    assert.ok(ws.includes(p2));
  });

  it('detects workspaces from package.json object format (yarn workspaces.packages)', () => {
    const d = tmp();
    fs.writeFileSync(path.join(d, 'package.json'), JSON.stringify({
      name: 'yarn-repo',
      workspaces: {
        packages: ['packages/*', 'apps/*']
      }
    }));
    const p1 = path.join(d, 'packages', 'core');
    const p2 = path.join(d, 'apps', 'web');
    fs.mkdirSync(p1, { recursive: true });
    fs.mkdirSync(p2, { recursive: true });
    fs.writeFileSync(path.join(p1, 'package.json'), JSON.stringify({ name: '@scope/core' }));
    fs.writeFileSync(path.join(p2, 'package.json'), JSON.stringify({ name: '@scope/web' }));

    const ws = findWorkspaceDirs(d);
    assert.equal(ws.length, 2);
    assert.ok(ws.includes(p1));
    assert.ok(ws.includes(p2));
  });

  it('detects workspaces from pnpm-workspace.yaml', () => {
    const d = tmp();
    fs.writeFileSync(path.join(d, 'package.json'), JSON.stringify({ name: 'pnpm-repo' }));
    fs.writeFileSync(path.join(d, 'pnpm-workspace.yaml'), `
packages:
  - 'packages/*'
  - 'services/**'
`);
    const p1 = path.join(d, 'packages', 'shared');
    const p2 = path.join(d, 'services', 'auth', 'api');
    fs.mkdirSync(p1, { recursive: true });
    fs.mkdirSync(p2, { recursive: true });
    fs.writeFileSync(path.join(p1, 'package.json'), JSON.stringify({ name: 'shared' }));
    fs.writeFileSync(path.join(p2, 'package.json'), JSON.stringify({ name: 'auth-api' }));

    const ws = findWorkspaceDirs(d);
    assert.equal(ws.length, 2);
    assert.ok(ws.includes(p1));
    assert.ok(ws.includes(p2));
  });
});
