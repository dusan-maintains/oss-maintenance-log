'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { extractImports, normalizePackageName, detectUnused } = require('../lib/unused');

describe('normalizePackageName', () => {
  it('returns bare package name', () => {
    assert.equal(normalizePackageName('lodash'), 'lodash');
  });

  it('strips subpath from package', () => {
    assert.equal(normalizePackageName('lodash/merge'), 'lodash');
  });

  it('handles scoped packages', () => {
    assert.equal(normalizePackageName('@babel/core'), '@babel/core');
  });

  it('strips subpath from scoped packages', () => {
    assert.equal(normalizePackageName('@babel/core/lib/parse'), '@babel/core');
  });
});

describe('extractImports', () => {
  it('extracts require() calls', () => {
    const imports = extractImports("const fs = require('fs');\nconst _ = require('lodash');");
    assert.ok(imports.has('fs'));
    assert.ok(imports.has('lodash'));
  });

  it('extracts ES import statements', () => {
    const imports = extractImports("import React from 'react';\nimport { useState } from 'react';");
    assert.ok(imports.has('react'));
  });

  it('extracts import with subpath', () => {
    const imports = extractImports("import merge from 'lodash/merge';");
    assert.ok(imports.has('lodash'));
  });

  it('extracts dynamic import()', () => {
    const imports = extractImports("const mod = await import('chalk');");
    assert.ok(imports.has('chalk'));
  });

  it('ignores relative imports', () => {
    const imports = extractImports("const foo = require('./foo');\nimport bar from '../bar';");
    assert.equal(imports.size, 0);
  });

  it('handles scoped packages in imports', () => {
    const imports = extractImports("import { something } from '@scope/pkg/sub';");
    assert.ok(imports.has('@scope/pkg'));
  });

  it('extracts bare import (side-effect)', () => {
    const imports = extractImports("import 'dotenv/config';");
    assert.ok(imports.has('dotenv'));
  });
});

describe('detectUnused', () => {
  it('returns empty for nonexistent directory', () => {
    const result = detectUnused('/nonexistent/path/99999');
    assert.deepEqual(result.unused, []);
    assert.equal(result.total, 0);
  });

  it('scans CLI directory itself (zero deps = zero unused)', () => {
    const path = require('path');
    const result = detectUnused(path.resolve(__dirname, '..'));
    assert.equal(result.total, 0);
    assert.deepEqual(result.unused, []);
  });
});
