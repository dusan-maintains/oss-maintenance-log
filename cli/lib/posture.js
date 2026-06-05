'use strict';

// Maintainer-risk and security-posture signals derived from the npm + GitHub
// metadata already fetched (no extra API calls). Surfaced in the --json manifest.

function maintainerRisk(r) {
  const signals = [];
  if (r.maintainerCount != null && r.maintainerCount <= 1) signals.push('single maintainer');
  if (r.daysSincePush != null && r.daysSincePush > 365) signals.push('no upstream commit in 1y+');
  if (r.daysSincePublish != null && r.daysSincePublish > 730) signals.push('no npm release in 2y+');
  if (r.stars != null && r.openIssues != null && r.stars > 0 && r.openIssues / r.stars > 0.5) signals.push('high open-issue backlog');
  const level = signals.length >= 3 ? 'high' : signals.length === 2 ? 'elevated' : signals.length === 1 ? 'low' : 'minimal';
  return { level, signals };
}

function securityPosture(r) {
  return {
    installScripts: !!r.hasInstallScripts,
    hasLicense: !!r.license,
    license: r.license || null,
    multiMaintainer: r.maintainerCount != null ? r.maintainerCount > 1 : null,
    activeWithinYear: r.daysSincePush != null ? r.daysSincePush <= 365 : null,
    archived: !!r.archived,
    deprecated: !!r.deprecated
  };
}

module.exports = { maintainerRisk, securityPosture };
