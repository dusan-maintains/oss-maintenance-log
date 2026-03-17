'use strict';

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
  bgGreen: '\x1b[42m'
};

function nc(str) { return str; }

function fmt(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
  return String(n);
}

function pad(s, len) {
  s = String(s);
  return s.length >= len ? s : s + ' '.repeat(len - s.length);
}

function scoreBar(score, c) {
  const filled = Math.round(score / 100 * 20);
  const empty = 20 - filled;
  const color = score < 30 ? c.red : score < 60 ? c.yellow : c.green;
  return color + '█'.repeat(filled) + c.dim + '░'.repeat(empty) + c.reset;
}

function printReport(results, useColor) {
  const c = useColor ? C : new Proxy({}, { get: () => '' });

  const critical = results.filter(r => r.risk_level === 'critical');
  const warning = results.filter(r => r.risk_level === 'warning');
  const healthy = results.filter(r => r.risk_level === 'healthy');
  const errors = results.filter(r => r.error);

  const total = results.length;
  const avgScore = results.filter(r => r.health_score != null).reduce((s, r) => s + r.health_score, 0) / (total - errors.length || 1);

  // Header
  process.stdout.write('\n');
  process.stdout.write(`  ${c.bold}OSS Health Scan Results${c.reset}\n`);
  process.stdout.write(`  ${c.dim}${'─'.repeat(50)}${c.reset}\n`);
  process.stdout.write(`  Scanned: ${c.bold}${total}${c.reset} packages\n`);
  process.stdout.write(`  Average health: ${c.bold}${avgScore.toFixed(1)}/100${c.reset}\n`);
  process.stdout.write(`  ${c.red}● Critical: ${critical.length}${c.reset}  `);
  process.stdout.write(`${c.yellow}● Warning: ${warning.length}${c.reset}  `);
  process.stdout.write(`${c.green}● Healthy: ${healthy.length}${c.reset}\n`);

  if (errors.length > 0) {
    process.stdout.write(`  ${c.dim}● Errors: ${errors.length}${c.reset}\n`);
  }

  // Critical section
  if (critical.length > 0) {
    process.stdout.write(`\n  ${c.bgRed}${c.white}${c.bold} 🔴 CRITICAL ${c.reset}\n\n`);
    for (const r of critical.sort((a, b) => (a.health_score || 0) - (b.health_score || 0))) {
      const bar = scoreBar(r.health_score || 0, c);
      process.stdout.write(`  ${pad(r.name, 35)} ${bar} ${c.bold}${c.red}${pad(String(r.health_score || 0), 3)}/100${c.reset}`);
      if (r.reason) process.stdout.write(`  ${c.red}${r.reason}${c.reset}`);
      else if (r.daysSincePush) process.stdout.write(`  ${c.dim}last push ${r.daysSincePush}d ago${c.reset}`);
      if (r.downloads) process.stdout.write(`  ${c.dim}${fmt(r.downloads)}/wk${c.reset}`);
      process.stdout.write('\n');
    }
  }

  // Warning section
  if (warning.length > 0) {
    process.stdout.write(`\n  ${c.bgYellow}${c.bold} 🟡 WARNING ${c.reset}\n\n`);
    for (const r of warning.sort((a, b) => a.health_score - b.health_score)) {
      const bar = scoreBar(r.health_score, c);
      process.stdout.write(`  ${pad(r.name, 35)} ${bar} ${c.bold}${c.yellow}${pad(String(r.health_score), 3)}/100${c.reset}`);
      if (r.daysSincePush) process.stdout.write(`  ${c.dim}last push ${r.daysSincePush}d ago${c.reset}`);
      if (r.downloads) process.stdout.write(`  ${c.dim}${fmt(r.downloads)}/wk${c.reset}`);
      process.stdout.write('\n');
    }
  }

  // Healthy section (compact)
  if (healthy.length > 0) {
    process.stdout.write(`\n  ${c.bgGreen}${c.white}${c.bold} 🟢 HEALTHY ${c.reset}\n\n`);
    for (const r of healthy.sort((a, b) => b.health_score - a.health_score)) {
      process.stdout.write(`  ${pad(r.name, 35)} ${scoreBar(r.health_score, c)} ${c.green}${pad(String(r.health_score), 3)}/100${c.reset}`);
      if (r.downloads) process.stdout.write(`  ${c.dim}${fmt(r.downloads)}/wk${c.reset}`);
      process.stdout.write('\n');
    }
  }

  // Errors
  if (errors.length > 0) {
    process.stdout.write(`\n  ${c.dim}ERRORS${c.reset}\n`);
    for (const r of errors) {
      process.stdout.write(`  ${c.dim}${r.name}: ${r.error}${c.reset}\n`);
    }
  }

  process.stdout.write(`\n  ${c.dim}${'─'.repeat(50)}${c.reset}\n`);
  process.stdout.write(`  ${c.dim}Tip: set GITHUB_TOKEN env for higher API rate limits${c.reset}\n\n`);
}

module.exports = { printReport };
