'use strict';

// --paranoid: render a scan as a supply-chain risk report instead of a table.

const { whyItMatters, suggestedAction } = require('./blast');

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', yellow: '\x1b[33m', green: '\x1b[32m',
  cyan: '\x1b[36m', white: '\x1b[37m', magenta: '\x1b[35m', bgRed: '\x1b[41m'
};

function blastColor(level, c) {
  if (level === 'EXTREME') return c.red;
  if (level === 'HIGH') return c.yellow;
  if (level === 'MODERATE') return c.cyan;
  return c.dim;
}

function printEntry(r, c, w) {
  const sc = r.health_score;
  const scColor = sc < 30 ? c.red : sc < 60 ? c.yellow : c.green;
  const bl = r.blast || { level: 'LOW', score: 0 };
  w(`  ${c.bold}${r.name}${c.reset}  ${scColor}${sc}/100${c.reset}  ${c.dim}·${c.reset}  blast ${blastColor(bl.level, c)}${c.bold}${bl.level}${c.reset}\n`);
  for (const why of whyItMatters(r)) w(`      ${c.dim}•${c.reset} ${why}\n`);
  w(`      ${c.cyan}→ ${suggestedAction(r)}${c.reset}\n\n`);
}

function printParanoid(results, total, pkgName, flags) {
  const useColor = flags ? flags.color : true;
  const c = useColor ? C : new Proxy({}, { get: () => '' });
  const w = s => process.stdout.write(s);

  const valid = results.filter(r => r.health_score != null);
  const critical = valid.filter(r => r.risk_level === 'critical');
  const abandoned = valid.filter(r => r.deprecated || r.archived);
  const singleHigh = valid.filter(r => r.maintainerCount != null && r.maintainerCount <= 1 && (r.downloads || 0) >= 1e6);
  const stale2y = valid.filter(r => r.daysSincePublish != null && r.daysSincePublish > 730);
  const withScripts = valid.filter(r => r.hasInstallScripts);
  const withVulns = valid.filter(r => r.vulns && r.vulns.count > 0);
  const extreme = valid.filter(r => r.blast && r.blast.level === 'EXTREME');
  const high = valid.filter(r => r.blast && r.blast.level === 'HIGH');

  w('\n');
  w(`  ${c.bgRed}${c.white}${c.bold}  ⚠  SUPPLY CHAIN RISK REPORT  ${c.reset}\n\n`);
  w(`  ${c.dim}Project:${c.reset} ${c.bold}${pkgName || 'package list'}${c.reset}    ${c.dim}Scanned dependencies:${c.reset} ${c.bold}${total}${c.reset}\n\n`);

  const line = (label, n, color) => {
    const col = n > 0 ? (color || c.yellow) : c.dim;
    w(`    ${col}${String(n).padStart(3)}${c.reset}  ${c.dim}${label}${c.reset}\n`);
  };
  line('critical maintenance risks', critical.length, c.red);
  line('abandoned packages (deprecated / archived)', abandoned.length, c.red);
  line('single-maintainer, high-impact (>1M downloads)', singleHigh.length, c.yellow);
  line('no npm release in 2+ years', stale2y.length, c.yellow);
  line('packages that run install scripts', withScripts.length, c.magenta);
  if (flags && flags.vulns) line('packages with known advisories', withVulns.length, c.red);
  w(`    ${(extreme.length ? c.red : c.dim)}${String(extreme.length).padStart(3)}${c.reset}  ${c.dim}EXTREME blast radius   ${c.reset}${(high.length ? c.yellow : c.dim)}${high.length} HIGH${c.reset}\n`);

  // Worst dependency: highest blast, tie-break lowest health.
  const ranked = [...valid].sort((a, b) =>
    ((b.blast ? b.blast.score : 0) - (a.blast ? a.blast.score : 0)) ||
    ((a.health_score || 0) - (b.health_score || 0)));
  const worst = ranked[0];
  if (worst) {
    w(`\n  ${c.dim}──${c.reset} ${c.bold}Worst dependency${c.reset} ${c.dim}──────────────────${c.reset}\n\n`);
    printEntry(worst, c, w);
  }

  // Other flagged: health < 60 OR blast HIGH/EXTREME, excluding worst.
  const risky = ranked.filter(r => r !== worst &&
    ((r.health_score != null && r.health_score < 60) || (r.blast && (r.blast.level === 'EXTREME' || r.blast.level === 'HIGH'))));
  if (risky.length > 0) {
    w(`\n  ${c.dim}──${c.reset} ${c.bold}Other flagged dependencies${c.reset} ${c.dim}(${risky.length})${c.reset}\n\n`);
    for (const r of risky.slice(0, 25)) printEntry(r, c, w);
    if (risky.length > 25) w(`  ${c.dim}… and ${risky.length - 25} more${c.reset}\n\n`);
  } else if (worst && (!worst.blast || worst.blast.level === 'LOW') && worst.health_score >= 60) {
    w(`\n  ${c.green}✓ No significant supply-chain risk signals found.${c.reset}\n\n`);
  }

  w(`  ${c.dim}Suggested alternatives are recommendations, not automatic fixes.${c.reset}\n\n`);
}

module.exports = { printParanoid };
