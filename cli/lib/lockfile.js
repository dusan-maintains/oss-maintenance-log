'use strict';

const fs = require('fs');
const path = require('path');

// Collect package names from a lockfile (the full dependency tree).
// npm package-lock.json (v1/v2/v3) is parsed precisely; yarn.lock and
// pnpm-lock.yaml are parsed best-effort by name without extra deps.
function readLockfile(dir, opts) {
  opts = opts || {};
  const prodOnly = !!opts.prodOnly;
  const names = new Set();

  const npmLock = path.join(dir, 'package-lock.json');
  if (fs.existsSync(npmLock)) {
    try {
      const lock = JSON.parse(fs.readFileSync(npmLock, 'utf8'));
      if (lock.packages) {
        // v2/v3 — keys are "node_modules/<name>" (possibly nested)
        for (const [key, meta] of Object.entries(lock.packages)) {
          const idx = key.lastIndexOf('node_modules/');
          if (idx === -1) continue;
          if (prodOnly && meta && meta.dev) continue;
          const name = key.slice(idx + 'node_modules/'.length);
          if (name) names.add(name);
        }
      } else if (lock.dependencies) {
        // v1 — nested dependencies object
        const walk = (deps) => {
          for (const [name, meta] of Object.entries(deps)) {
            if (prodOnly && meta && meta.dev) continue;
            names.add(name);
            if (meta && meta.dependencies) walk(meta.dependencies);
          }
        };
        walk(lock.dependencies);
      }
      return { names: [...names], source: 'package-lock.json' };
    } catch (e) { /* fall through to other lockfiles */ }
  }

  const yarnLock = path.join(dir, 'yarn.lock');
  if (fs.existsSync(yarnLock)) {
    try {
      const txt = fs.readFileSync(yarnLock, 'utf8');
      for (const line of txt.split('\n')) {
        if (/^\s/.test(line) || !line.trim()) continue;
        const m = line.match(/^"?((?:@[^/]+\/)?[^@\s",]+)@/);
        if (m) names.add(m[1]);
      }
      return { names: [...names], source: 'yarn.lock' };
    } catch (e) { /* fall through */ }
  }

  const pnpmLock = path.join(dir, 'pnpm-lock.yaml');
  if (fs.existsSync(pnpmLock)) {
    try {
      const txt = fs.readFileSync(pnpmLock, 'utf8');
      for (const line of txt.split('\n')) {
        const m = line.match(/^\s{2,}\/?((?:@[^/]+\/)?[a-z0-9][^@\s:'"]*)[@(]/i);
        if (m) names.add(m[1]);
      }
      return { names: [...names], source: 'pnpm-lock.yaml' };
    } catch (e) { /* fall through */ }
  }

  return { names: [], source: null };
}

module.exports = { readLockfile };
