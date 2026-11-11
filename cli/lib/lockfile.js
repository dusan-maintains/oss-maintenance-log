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

/**
 * Match a relative file/directory path against a simple glob pattern.
 * Supports:
 * - '*' matches any single path segment
 * - '**' matches zero or more path segments
 * - literal characters
 */
function matchGlobPattern(pattern, relPath) {
  // Normalize slashes
  pattern = pattern.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
  relPath = relPath.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');

  const regexStr = pattern
    .split('/')
    .map(part => {
      if (part === '**') return '.*';
      return part
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '[^/]*');
    })
    .join('/');

  const re = new RegExp(`^${regexStr}$`);
  return re.test(relPath);
}

/**
 * Given workspace glob patterns (e.g. ['packages/*']), resolve all matching
 * directories under rootDir that contain a package.json.
 */
function resolveWorkspaceDirs(rootDir, patterns) {
  const result = [];
  const normalizedPatterns = patterns
    .map(p => p.trim())
    .filter(p => p && !p.startsWith('!'))
    .map(p => p.replace(/\\/g, '/').replace(/\/+$/, ''));

  function scan(currentDir, relPath) {
    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch (e) {
      return;
    }

    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      if (ent.name === 'node_modules' || ent.name === '.git') continue;

      const subRel = relPath ? `${relPath}/${ent.name}` : ent.name;
      const subFull = path.join(currentDir, ent.name);

      const matches = normalizedPatterns.some(pattern => {
        // Also allow matching if the pattern was 'packages/*' and subRel matches
        if (matchGlobPattern(pattern, subRel)) return true;
        // Or if pattern ends with wildcard and subRel matches direct glob
        return false;
      });

      if (matches) {
        if (fs.existsSync(path.join(subFull, 'package.json'))) {
          result.push(subFull);
        }
      }

      // Check if we should traverse deeper
      // If any pattern has more segments than current depth or has '**'
      const shouldDescend = normalizedPatterns.some(pattern => {
        if (pattern.includes('**')) return true;
        const patParts = pattern.split('/');
        const curParts = subRel.split('/');
        return patParts.length > curParts.length;
      });

      if (shouldDescend) {
        scan(subFull, subRel);
      }
    }
  }

  scan(rootDir, '');
  return result;
}

/**
 * Detect workspaces from rootDir:
 * 1. npm / yarn workspaces in package.json (workspaces field: array or { packages: [...] })
 * 2. pnpm workspaces in pnpm-workspace.yaml (packages: [...])
 *
 * Returns an array of absolute directories for each workspace member, or empty array if none.
 */
function findWorkspaceDirs(rootDir) {
  const patterns = [];

  // 1. package.json workspaces (npm / yarn)
  const pkgPath = path.join(rootDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (Array.isArray(pkg.workspaces)) {
        patterns.push(...pkg.workspaces);
      } else if (pkg.workspaces && Array.isArray(pkg.workspaces.packages)) {
        patterns.push(...pkg.workspaces.packages);
      }
    } catch (e) { /* ignore parse error */ }
  }

  // 2. pnpm-workspace.yaml (pnpm)
  const pnpmWs = path.join(rootDir, 'pnpm-workspace.yaml');
  if (fs.existsSync(pnpmWs)) {
    try {
      const content = fs.readFileSync(pnpmWs, 'utf8');
      // Simple parse for packages:\n  - 'packages/*'\n  - packages/*
      let inPackages = false;
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (/^packages\s*:/.test(trimmed)) {
          inPackages = true;
          continue;
        }
        if (inPackages) {
          if (trimmed.startsWith('-')) {
            const val = trimmed.replace(/^-\s*/, '').replace(/^['"]|['"]$/g, '').trim();
            if (val) patterns.push(val);
          } else if (trimmed && !trimmed.startsWith('#')) {
            inPackages = false;
          }
        }
      }
    } catch (e) { /* ignore parse error */ }
  }

  if (patterns.length === 0) return [];

  return resolveWorkspaceDirs(rootDir, patterns);
}

module.exports = { readLockfile, findWorkspaceDirs };
