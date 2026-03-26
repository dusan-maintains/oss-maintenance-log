'use strict';

const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = path.resolve(__dirname, '..', 'evidence');
const SCHEMA_DIR = path.resolve(__dirname, '..', 'schemas');

// ── Minimal JSON Schema validator (draft-07 subset, zero deps) ──────────

function getType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'number';
  return typeof value;
}

function validate(data, schema, keyPath) {
  const errors = [];

  // Type check
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    const actual = getType(data);
    // integer is subtype of number in JSON Schema
    const ok = types.some(t => t === actual || (t === 'number' && actual === 'integer'));
    if (!ok) {
      errors.push(`${keyPath}: expected ${types.join('|')}, got ${actual}`);
      return errors;
    }
  }

  // Required fields
  if (schema.required && typeof data === 'object' && data !== null && !Array.isArray(data)) {
    for (const key of schema.required) {
      if (!(key in data)) {
        errors.push(`${keyPath}: missing required field "${key}"`);
      }
    }
  }

  // Properties (recursive)
  if (schema.properties && typeof data === 'object' && data !== null && !Array.isArray(data)) {
    for (const [key, sub] of Object.entries(schema.properties)) {
      if (key in data) {
        errors.push(...validate(data[key], sub, `${keyPath}.${key}`));
      }
    }
  }

  // Array items (recursive)
  if (schema.items && Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      errors.push(...validate(data[i], schema.items, `${keyPath}[${i}]`));
    }
  }

  // Numeric range
  if (schema.minimum !== undefined && typeof data === 'number' && data < schema.minimum) {
    errors.push(`${keyPath}: ${data} < minimum ${schema.minimum}`);
  }
  if (schema.maximum !== undefined && typeof data === 'number' && data > schema.maximum) {
    errors.push(`${keyPath}: ${data} > maximum ${schema.maximum}`);
  }

  // Array length
  if (schema.minItems !== undefined && Array.isArray(data) && data.length < schema.minItems) {
    errors.push(`${keyPath}: array length ${data.length} < minItems ${schema.minItems}`);
  }

  // Enum
  if (schema.enum !== undefined && !schema.enum.includes(data)) {
    errors.push(`${keyPath}: "${data}" not in [${schema.enum.join(', ')}]`);
  }

  return errors;
}

// ── Evidence file mapping ───────────────────────────────────────────────

const VALIDATIONS = [
  { schema: 'ecosystem-status.schema.json', file: 'ecosystem-status.json', required: true },
  { schema: 'health-scores.schema.json', file: 'health-scores.json', required: false },
  { schema: 'manifest.schema.json', file: 'manifest.json', required: true },
  { schema: 'action-queue.schema.json', file: 'action-queue.json', required: false },
];

// ── Run ─────────────────────────────────────────────────────────────────

let totalErrors = 0;
let validated = 0;
let skipped = 0;

console.log('Evidence Schema Validation');
console.log('─'.repeat(50));

for (const v of VALIDATIONS) {
  const filePath = path.join(EVIDENCE_DIR, v.file);
  const schemaPath = path.join(SCHEMA_DIR, v.schema);

  if (!fs.existsSync(filePath)) {
    if (v.required) {
      console.error(`FAIL  ${v.file} — required file not found`);
      totalErrors++;
    } else {
      console.log(`SKIP  ${v.file} — optional, not present`);
      skipped++;
    }
    continue;
  }

  if (!fs.existsSync(schemaPath)) {
    console.error(`FAIL  ${v.file} — schema not found: ${v.schema}`);
    totalErrors++;
    continue;
  }

  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  let data;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    data = JSON.parse(raw.replace(/^\uFEFF/, '')); // strip PowerShell BOM
  } catch (e) {
    console.error(`FAIL  ${v.file} — invalid JSON: ${e.message}`);
    totalErrors++;
    continue;
  }

  const errors = validate(data, schema, v.file);
  if (errors.length > 0) {
    console.error(`FAIL  ${v.file} — ${errors.length} violation(s):`);
    for (const e of errors) console.error(`  · ${e}`);
    totalErrors += errors.length;
  } else {
    console.log(`  OK  ${v.file}`);
    validated++;
  }
}

console.log('─'.repeat(50));
console.log(`${validated} passed, ${skipped} skipped, ${totalErrors} errors`);

if (totalErrors > 0) {
  process.exit(1);
}
