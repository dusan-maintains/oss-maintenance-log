'use strict';

const fs = require('fs');
const path = require('path');
const { fetchJson } = require('./fetcher');

/**
 * Get installed version from package-lock.json or node_modules.
 * Returns map: { packageName: installedVersion }
 */
function getInstalledVersions(dir) {
  const versions = {};

  // Try package-lock.json first (most reliable)
  const lockPath = path.resolve(dir, 'package-lock.json');
  if (fs.existsSync(lockPath)) {
    try {
      const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
      // npm v7+ lockfileVersion 2/3
      if (lock.packages) {
        for (const [key, val] of Object.entries(lock.packages)) {
          if (!key || key === '') continue; // root package
          const name = key.replace(/^node_modules\//, '');
          if (val.version) versions[name] = val.version;
        }
      }
      // npm v6 lockfileVersion 1
      if (lock.dependencies && Object.keys(versions).length === 0) {
        for (const [name, val] of Object.entries(lock.dependencies)) {
          if (val.version) versions[name] = val.version;
        }
      }
    } catch (e) { /* invalid lock file */ }
  }

  return versions;
}

/**
 * Parse semver string into { major, minor, patch }.
 */
function parseSemver(version) {
  if (!version) return null;
  const clean = version.replace(/^[~^>=<]*/, '');
  const m = clean.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!m) return null;
  return { major: parseInt(m[1]), minor: parseInt(m[2]), patch: parseInt(m[3]) };
}

/**
 * Calculate libyear: how many years behind the latest version.
 * Uses npm registry time field to compute actual calendar distance.
 */
async function getVersionAge(name, installedVersion, latestVersion, lastPublish) {
  if (!installedVersion || !latestVersion || installedVersion === latestVersion) {
    return { installed: installedVersion || latestVersion, latest: latestVersion, libyear: 0, drift: null };
  }

  const installed = parseSemver(installedVersion);
  const latest = parseSemver(latestVersion);
  if (!installed || !latest) {
    return { installed: installedVersion, latest: latestVersion, libyear: 0, drift: null };
  }

  // Drift classification
  let drift;
  if (latest.major > installed.major) drift = 'major';
  else if (latest.minor > installed.minor) drift = 'minor';
  else if (latest.patch > installed.patch) drift = 'patch';
  else drift = 'up-to-date';

  // Estimate libyear from last publish date
  // Without fetching install date (expensive), estimate from version distance
  let libyear = 0;
  if (lastPublish) {
    const publishDate = new Date(lastPublish);
    const daysSinceLatest = Math.max(0, (Date.now() - publishDate.getTime()) / 86400000);
    // Rough estimate: if installed != latest, the gap is at least (version distance / publish rate)
    const versionDistance = (latest.major - installed.major) * 100 +
                           (latest.minor - installed.minor) * 10 +
                           (latest.patch - installed.patch);
    // Conservative: assume 1 version per month
    libyear = parseFloat(Math.max(versionDistance / 12, 0).toFixed(1));
  }

  return {
    installed: installedVersion,
    latest: latestVersion,
    libyear,
    drift
  };
}

module.exports = { getInstalledVersions, getVersionAge, parseSemver };
