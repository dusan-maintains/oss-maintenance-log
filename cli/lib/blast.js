'use strict';

// Blast radius — "if this package were compromised, how much pain?"
// Combines reach (downloads), attack surface (install scripts), and
// likelihood of compromise (single maintainer, abandonment, known CVEs).
// All inputs come from public npm + GitHub metadata already fetched.

function fmtM(n) {
  n = n || 0;
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return Math.round(n / 1e3) + 'k';
  return String(n);
}

function computeBlastRadius(info) {
  const reasons = [];
  let pts = 0;

  const dl = info.downloads || 0;
  if (dl >= 50e6) { pts += 40; reasons.push(fmtM(dl) + ' downloads/week'); }
  else if (dl >= 10e6) { pts += 32; reasons.push(fmtM(dl) + ' downloads/week'); }
  else if (dl >= 1e6) { pts += 24; reasons.push(fmtM(dl) + ' downloads/week'); }
  else if (dl >= 1e5) { pts += 14; }
  else if (dl >= 1e4) { pts += 6; }
  else { pts += 2; }

  if (info.hasInstallScripts) { pts += 18; reasons.push('runs install scripts (code executes on npm install)'); }
  if (info.maintainerCount != null && info.maintainerCount <= 1) { pts += 14; reasons.push('single maintainer (one account-takeover away)'); }

  const abandoned = info.deprecated || info.archived ||
    (info.daysSincePush != null && info.daysSincePush > 365);
  if (abandoned) {
    pts += 14;
    reasons.push(info.deprecated ? 'deprecated' : info.archived ? 'archived' : 'no upstream push in 1y+');
  }

  if (info.vulns && info.vulns.count > 0) { pts += 10; reasons.push(info.vulns.count + ' known advisory(ies)'); }

  const score = Math.min(pts, 100);
  const level = score >= 70 ? 'EXTREME' : score >= 45 ? 'HIGH' : score >= 25 ? 'MODERATE' : 'LOW';
  return { score, level, reasons };
}

// Curated alternatives for well-known deprecated / heavy packages.
// Labelled "suggested alternatives", never automatic fixes.
const REPLACEMENTS = {
  moment: ['dayjs', 'date-fns', 'luxon'],
  request: ['undici', 'got', 'axios'],
  'request-promise': ['undici', 'got', 'axios'],
  'request-promise-native': ['undici', 'got', 'axios'],
  'coffee-script': ['typescript', 'babel'],
  jade: ['pug'],
  'node-sass': ['sass', 'sass-embedded'],
  'node-uuid': ['uuid'],
  tslint: ['eslint', 'typescript-eslint'],
  bluebird: ['native Promises'],
  q: ['native Promises'],
  underscore: ['lodash-es', 'native ES methods'],
  bower: ['npm', 'pnpm', 'yarn'],
  gulp: ['npm scripts', 'vite'],
  'gulp-util': ['fancy-log', 'plugin-error'],
  grunt: ['npm scripts', 'vite'],
  optimist: ['yargs', 'commander'],
  phantomjs: ['puppeteer', 'playwright'],
  'phantomjs-prebuilt': ['puppeteer', 'playwright'],
  istanbul: ['nyc', 'c8'],
  'left-pad': ['String.prototype.padStart() (native)'],
  'is-odd': ['n % 2 === 1 (native)'],
  'is-even': ['n % 2 === 0 (native)'],
  protractor: ['playwright', 'cypress', 'webdriverio'],
  jquery: ['native DOM APIs'],
  colors: ['chalk', 'picocolors'],
  'babel-core': ['@babel/core'],
  'har-validator': ['ajv'],
  mkdirp: ['fs.mkdir({ recursive: true }) (native)'],
  rimraf: ['fs.rm({ recursive: true }) (native)'],
};

function whyItMatters(r) {
  const out = [];
  if (r.deprecated) out.push('Deprecated by its own maintainer');
  if (r.archived) out.push('Source repository is archived (read-only)');
  const dl = r.downloads || 0;
  if (dl >= 1e6) out.push('Extremely popular — ' + fmtM(dl) + ' downloads/week');
  else if (dl >= 1e5) out.push('Widely used — ' + fmtM(dl) + ' downloads/week');
  if (r.maintainerCount != null && r.maintainerCount <= 1) out.push('Single maintainer — bus-factor / account-takeover risk');
  if (r.hasInstallScripts) out.push('Runs install scripts — arbitrary code on `npm install`');
  if (r.daysSincePublish != null && r.daysSincePublish > 730) out.push('No npm release in ' + (r.daysSincePublish / 365).toFixed(1) + ' years');
  else if (r.daysSincePush != null && r.daysSincePush > 365) out.push('No upstream commit in ' + (r.daysSincePush / 365).toFixed(1) + ' years');
  if (r.vulns && r.vulns.count > 0) out.push(r.vulns.count + ' known security advisory(ies)');
  if (out.length === 0) out.push('Actively maintained — no major risk signals');
  return out;
}

function suggestedAction(r) {
  const repl = REPLACEMENTS[r.name];
  if (r.deprecated || r.archived) {
    return repl ? 'Remove — migrate to ' + repl.join(', ') : 'Plan migration off this package';
  }
  if (r.risk_level === 'critical') return repl ? 'Replace with ' + repl.join(', ') : 'Find a maintained alternative';
  if (r.risk_level === 'warning') return repl ? 'Monitor; consider ' + repl.join(', ') : 'Pin version, enable Dependabot, monitor advisories';
  return 'Keep pinned; monitor advisories';
}

module.exports = { computeBlastRadius, REPLACEMENTS, whyItMatters, suggestedAction, fmtM };
