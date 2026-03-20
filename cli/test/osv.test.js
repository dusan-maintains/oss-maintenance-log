'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { summarizeVulns, extractSeverity } = require('../lib/osv');

describe('summarizeVulns', () => {
  it('returns zeros for empty array', () => {
    const result = summarizeVulns([]);
    assert.equal(result.count, 0);
    assert.equal(result.critical, 0);
    assert.equal(result.high, 0);
    assert.equal(result.moderate, 0);
    assert.equal(result.low, 0);
    assert.deepEqual(result.ids, []);
  });

  it('returns zeros for null input', () => {
    const result = summarizeVulns(null);
    assert.equal(result.count, 0);
  });

  it('counts vulnerabilities correctly', () => {
    const vulns = [
      { id: 'GHSA-1234', database_specific: { severity: 'CRITICAL' } },
      { id: 'GHSA-5678', database_specific: { severity: 'HIGH' } },
      { id: 'CVE-2024-1111', database_specific: { severity: 'MODERATE' } }
    ];
    const result = summarizeVulns(vulns);
    assert.equal(result.count, 3);
    assert.equal(result.critical, 1);
    assert.equal(result.high, 1);
    assert.equal(result.moderate, 1);
    assert.equal(result.low, 0);
    assert.deepEqual(result.ids, ['GHSA-1234', 'GHSA-5678', 'CVE-2024-1111']);
  });

  it('uses aliases when id is missing', () => {
    const vulns = [{ aliases: ['CVE-2024-9999'] }];
    const result = summarizeVulns(vulns);
    assert.equal(result.ids[0], 'CVE-2024-9999');
  });
});

describe('extractSeverity', () => {
  it('extracts from database_specific', () => {
    const sev = extractSeverity({ database_specific: { severity: 'HIGH' } });
    assert.equal(sev, 'HIGH');
  });

  it('extracts from ecosystem_specific', () => {
    const sev = extractSeverity({ ecosystem_specific: { severity: 'low' } });
    assert.equal(sev, 'LOW');
  });

  it('extracts from CVSS v3 severity array — critical', () => {
    const sev = extractSeverity({
      severity: [{ type: 'CVSS_V3', score: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H 9.8' }]
    });
    assert.equal(sev, 'CRITICAL');
  });

  it('extracts from CVSS v3 severity array — high (vector only)', () => {
    const sev = extractSeverity({
      severity: [{ type: 'CVSS_V3', score: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N' }]
    });
    assert.equal(sev, 'HIGH');
  });

  it('defaults to MODERATE when no severity data', () => {
    const sev = extractSeverity({});
    assert.equal(sev, 'MODERATE');
  });
});
