'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { scanPackages } = require('./api');

function depsFromPkgJson(text, includeDev) {
  const pkg = JSON.parse(text);
  const deps = Object.keys(pkg.dependencies || {});
  const dev = includeDev ? Object.keys(pkg.devDependencies || {}) : [];
  return new Set([...deps, ...dev]);
}

function currentDeps(dir, includeDev) {
  const p = path.resolve(dir || '.', 'package.json');
  return depsFromPkgJson(fs.readFileSync(p, 'utf8'), includeDev);
}

function baseDeps(ref, dir, includeDev) {
  const out = execFileSync('git', ['show', `${ref}:package.json`], {
    cwd: path.resolve(dir || '.'), encoding: 'utf8'
  });
  return depsFromPkgJson(out, includeDev);
}

// Compare current package.json dependencies against those at a git ref,
// then scan the added and removed sets for health/risk.
async function runDiff(ref, opts) {
  opts = opts || {};
  const dir = opts.dir || '.';
  const dev = !!opts.dev;

  const cur = currentDeps(dir, dev);
  let base;
  try {
    base = baseDeps(ref, dir, dev);
  } catch (e) {
    throw new Error(`could not read package.json at "${ref}" — is this a git repo with a valid ref? (${e.message.split('\n')[0]})`);
  }

  const added = [...cur].filter(p => !base.has(p));
  const removed = [...base].filter(p => !cur.has(p));

  const addedScan = added.length ? (await scanPackages(added)).results : [];
  const removedScan = removed.length ? (await scanPackages(removed)).results : [];

  return { ref, added: addedScan, removed: removedScan };
}

module.exports = { runDiff, depsFromPkgJson };
