'use strict';

// Port of compute-health-scores.ps1 algorithm to JavaScript
// Weights: Maintenance 40%, Community 25%, Popularity 20%, Risk 15%

const W_MAINTENANCE = 0.40;
const W_COMMUNITY   = 0.25;
const W_POPULARITY  = 0.20;
const W_RISK        = 0.15;

function logScore(value, scale) {
  if (value <= 0) return 0;
  const raw = Math.log10(value + 1) / Math.log10((scale || 1000) + 1) * 10;
  return Math.min(parseFloat(raw.toFixed(2)), 10);
}

function decayScore(daysSince, halfLife) {
  if (daysSince <= 0) return 10;
  const score = 10 * Math.exp(-0.693 * daysSince / (halfLife || 180));
  return Math.max(parseFloat(score.toFixed(2)), 0);
}

function computeScore(info) {
  // Instant flags
  if (info.deprecated) {
    return { health_score: 5, risk_level: 'critical', reason: 'DEPRECATED' + (info.deprecatedMsg ? ': ' + info.deprecatedMsg : '') };
  }
  if (info.archived) {
    return { health_score: 8, risk_level: 'critical', reason: 'ARCHIVED on GitHub' };
  }

  // Maintenance (40%)
  const daysSincePush = info.daysSincePush != null ? info.daysSincePush : (info.daysSincePublish || 9999);
  const pushRecency = decayScore(daysSincePush, 180);

  const openIssues = info.openIssues || 0;
  const stars = info.stars || 0;
  // Ratio-based: issues relative to community size (stars).
  // React (200 issues / 230k stars = 0.0009 ratio) = healthy.
  // Small lib (200 issues / 50 stars = 4.0 ratio) = abandoned.
  // Ratio > 0.1 starts penalizing, > 1.0 = zero score.
  let issueRatio;
  if (openIssues === 0) {
    issueRatio = 10;
  } else if (stars > 0) {
    const ratio = openIssues / stars;
    issueRatio = Math.max(parseFloat((10 - Math.min(ratio / 0.1 * 10, 10)).toFixed(2)), 0);
  } else {
    // No stars data — fall back to absolute count (lenient curve)
    issueRatio = Math.max(parseFloat((10 - Math.min(openIssues / 10, 10)).toFixed(2)), 0);
  }

  const publishRecency = decayScore(info.daysSincePublish || 9999, 365);

  const maintenanceScore = (pushRecency + issueRatio + publishRecency) / 3;

  // Community (25%)
  const starsScore = logScore(info.stars || 0, 10000);
  const forksScore = logScore(info.forks || 0, 2000);
  const communityScore = (starsScore + forksScore) / 2;

  // Popularity (20%)
  const downloadScore = logScore(info.downloads || 0, 1000000);
  const popularityScore = downloadScore;

  // Risk (15%) — penalty-based
  let riskBase = 10;
  if (daysSincePush > 365) riskBase -= 4;
  else if (daysSincePush > 180) riskBase -= 2;

  // Issue backlog risk: ratio-based (issues / max(stars, 1))
  const issueBacklogRatio = openIssues / Math.max(stars, 1);
  if (issueBacklogRatio > 1.0) riskBase -= 3;
  else if (issueBacklogRatio > 0.5) riskBase -= 1.5;

  if (info.daysSincePublish > 730) riskBase -= 2;
  else if (info.daysSincePublish > 365) riskBase -= 1;

  // License risk: no license or restrictive licenses
  if (info.license) {
    const lic = String(info.license).toUpperCase();
    if (lic.includes('GPL') && !lic.includes('LGPL')) riskBase -= 1;
    if (lic === 'UNLICENSED' || lic === 'PROPRIETARY') riskBase -= 2;
  } else {
    riskBase -= 1.5; // no license = legal uncertainty
  }

  const riskScore = Math.max(riskBase, 0);

  // Final weighted score
  const raw = (maintenanceScore * W_MAINTENANCE +
               communityScore * W_COMMUNITY +
               popularityScore * W_POPULARITY +
               riskScore * W_RISK) * 10;

  const healthScore = Math.min(Math.max(parseFloat(raw.toFixed(1)), 0), 100);

  const riskLevel = healthScore < 30 ? 'critical' : healthScore < 60 ? 'warning' : 'healthy';

  return {
    health_score: healthScore,
    risk_level: riskLevel,
    breakdown: {
      maintenance: parseFloat(maintenanceScore.toFixed(2)),
      community: parseFloat(communityScore.toFixed(2)),
      popularity: parseFloat(popularityScore.toFixed(2)),
      risk: parseFloat(riskScore.toFixed(2))
    }
  };
}

module.exports = { computeScore, logScore, decayScore };
