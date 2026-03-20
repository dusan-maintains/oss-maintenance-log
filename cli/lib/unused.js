'use strict';

const fs = require('fs');
const path = require('path');

// Dependencies that are used via config files, not imports.
// These should never be flagged as unused.
const CONFIG_ONLY_DEPS = new Set([
  // Build tools
  'typescript', 'webpack', 'rollup', 'vite', 'esbuild', 'parcel', 'turbo',
  'babel-core', '@babel/core', '@babel/preset-env', '@babel/preset-react',
  '@babel/preset-typescript', '@babel/plugin-transform-runtime',
  // Linters / formatters
  'eslint', 'prettier', 'stylelint', 'tslint',
  // Test frameworks (often in config or scripts)
  'jest', 'mocha', 'vitest', 'ava', 'tap', 'c8', 'nyc', 'istanbul',
  // Type defs
  '@types/node', '@types/react', '@types/jest', '@types/mocha',
  // PostCSS / Tailwind
  'postcss', 'autoprefixer', 'tailwindcss',
  // Husky / lint-staged
  'husky', 'lint-staged', 'commitlint',
  // Next / Nuxt (framework conventions)
  'next', 'nuxt',
  // Nodemon / ts-node
  'nodemon', 'ts-node', 'tsx',
  // Misc
  'dotenv', 'cross-env', 'rimraf', 'concurrently', 'npm-run-all'
]);

const SOURCE_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.mts', '.cts', '.vue', '.svelte'
]);

const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', '.next', '.nuxt',
  'coverage', '.cache', '.turbo', '.vite'
]);

/**
 * Recursively collect source files from a directory.
 */
function collectSourceFiles(dir, files) {
  files = files || [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch (e) { return files; }

  for (const entry of entries) {
    if (entry.name.startsWith('.') && IGNORE_DIRS.has(entry.name)) continue;
    if (IGNORE_DIRS.has(entry.name)) continue;

    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectSourceFiles(full, files);
    } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

/**
 * Extract package names from require() and import statements in source code.
 * Returns a Set of bare package names (e.g., 'lodash', '@scope/pkg').
 */
function extractImports(source) {
  const imports = new Set();

  // require('pkg') or require("pkg")
  const requireRe = /require\s*\(\s*['"]([^'"./][^'"]*)['"]\s*\)/g;
  let m;
  while ((m = requireRe.exec(source)) !== null) {
    imports.add(normalizePackageName(m[1]));
  }

  // import ... from 'pkg' or import 'pkg'
  const importRe = /import\s+(?:(?:[\w{}\s*,]+)\s+from\s+)?['"]([^'"./][^'"]*)['"]/g;
  while ((m = importRe.exec(source)) !== null) {
    imports.add(normalizePackageName(m[1]));
  }

  // Dynamic import('pkg')
  const dynamicRe = /import\s*\(\s*['"]([^'"./][^'"]*)['"]\s*\)/g;
  while ((m = dynamicRe.exec(source)) !== null) {
    imports.add(normalizePackageName(m[1]));
  }

  return imports;
}

/**
 * Normalize 'lodash/merge' → 'lodash', '@scope/pkg/sub' → '@scope/pkg'.
 */
function normalizePackageName(specifier) {
  if (specifier.startsWith('@')) {
    const parts = specifier.split('/');
    return parts.slice(0, 2).join('/');
  }
  return specifier.split('/')[0];
}

/**
 * Detect unused dependencies in a project.
 *
 * @param {string} dir - project root directory
 * @param {object} [options]
 * @param {boolean} [options.dev=false] - also check devDependencies
 * @returns {{ unused: string[], total: number, scanned: number }}
 */
function detectUnused(dir, options) {
  const opts = { dev: false, ...options };
  const pkgPath = path.resolve(dir, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    return { unused: [], total: 0, scanned: 0 };
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const deps = Object.keys(pkg.dependencies || {});
  const devDeps = opts.dev ? Object.keys(pkg.devDependencies || {}) : [];
  const allDeps = [...deps, ...devDeps];

  if (allDeps.length === 0) {
    return { unused: [], total: 0, scanned: 0 };
  }

  // Collect all source files
  const sourceFiles = collectSourceFiles(dir);

  // Extract all imports across all files
  const usedPackages = new Set();
  for (const file of sourceFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const imports = extractImports(content);
      for (const imp of imports) usedPackages.add(imp);
    } catch (e) { /* skip unreadable files */ }
  }

  // Also check scripts in package.json for CLI tool usage
  if (pkg.scripts) {
    const scriptsStr = JSON.stringify(pkg.scripts);
    for (const dep of allDeps) {
      // If the dep name appears in any script command, count it as used
      if (scriptsStr.includes(dep)) usedPackages.add(dep);
    }
  }

  // Find unused
  const unused = allDeps.filter(dep => {
    if (CONFIG_ONLY_DEPS.has(dep)) return false;
    if (dep.startsWith('@types/')) return false;
    return !usedPackages.has(dep);
  });

  return {
    unused,
    total: allDeps.length,
    scanned: sourceFiles.length
  };
}

module.exports = { detectUnused, extractImports, normalizePackageName, collectSourceFiles };
