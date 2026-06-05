'use strict';

// Self-contained HTML report (no external assets, no JS) for --html.

const { whyItMatters, suggestedAction } = require('./blast');

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
function fmt(n) {
  if (n == null) return '—';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return Math.round(n / 1e3) + 'k';
  return String(n);
}
function scoreColor(s) { return s < 30 ? '#ef4444' : s < 60 ? '#eab308' : '#22c55e'; }
function blastColor(l) { return l === 'EXTREME' ? '#ef4444' : l === 'HIGH' ? '#f97316' : l === 'MODERATE' ? '#06b6d4' : '#64748b'; }

function toHtml(results, opts) {
  opts = opts || {};
  const valid = results.filter(r => r.health_score != null);
  const crit = valid.filter(r => r.risk_level === 'critical');
  const warn = valid.filter(r => r.risk_level === 'warning');
  const healthy = valid.filter(r => r.risk_level === 'healthy');
  const avg = valid.length ? valid.reduce((s, r) => s + r.health_score, 0) / valid.length : 0;
  const ranked = [...valid].sort((a, b) =>
    ((b.blast ? b.blast.score : 0) - (a.blast ? a.blast.score : 0)) || (a.health_score - b.health_score));
  const risky = ranked.filter(r => r.health_score < 60 || (r.blast && (r.blast.level === 'EXTREME' || r.blast.level === 'HIGH')));

  const riskyCards = risky.map(r => `
      <div class="card">
        <div class="card-h">
          <span class="pkg">${esc(r.name)}</span>
          <span>
            <span class="score" style="color:${scoreColor(r.health_score)}">${r.health_score}/100</span>
            <span class="blast" style="background:${blastColor(r.blast ? r.blast.level : 'LOW')}22;color:${blastColor(r.blast ? r.blast.level : 'LOW')}">blast ${esc(r.blast ? r.blast.level : 'LOW')}</span>
          </span>
        </div>
        <ul class="why">${whyItMatters(r).map(w => `<li>${esc(w)}</li>`).join('')}</ul>
        <div class="action">→ ${esc(suggestedAction(r))}</div>
      </div>`).join('');

  const allRows = ranked.map(r => `
        <tr>
          <td class="mono">${esc(r.name)}</td>
          <td style="text-align:right"><b style="color:${scoreColor(r.health_score)}">${r.health_score}</b></td>
          <td>${esc(r.risk_level)}</td>
          <td style="text-align:right" class="mono">${fmt(r.downloads)}</td>
          <td>${esc(r.blast ? r.blast.level : '—')}</td>
          <td class="mono">${r.daysSincePush != null ? r.daysSincePush + 'd' : '—'}</td>
        </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>OSS Health Report${opts.project ? ' — ' + esc(opts.project) : ''}</title>
<style>
  :root{--bg:#0a0e17;--card:#141b27;--bd:#1e2d3d;--tx:#e2e8f0;--mu:#64748b}
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--bg);color:var(--tx);font:15px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:32px;max-width:980px;margin:0 auto}
  h1{font-size:1.6rem;letter-spacing:-.02em}.mu{color:var(--mu)}
  .mono{font-family:ui-monospace,Menlo,monospace;font-size:.86em}
  .strip{display:flex;gap:12px;flex-wrap:wrap;margin:20px 0}
  .stat{background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:14px 20px;flex:1;min-width:120px}
  .stat .n{font-size:1.7rem;font-weight:800}.stat .l{color:var(--mu);font-size:.78rem;text-transform:uppercase;letter-spacing:.05em}
  h2{font-size:.8rem;text-transform:uppercase;letter-spacing:.08em;color:var(--mu);margin:28px 0 12px}
  .card{background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:16px 18px;margin-bottom:12px}
  .card-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
  .pkg{font-weight:700}.score{font-weight:800;margin-right:10px}
  .blast{font-size:.72rem;padding:2px 8px;border-radius:10px;font-weight:600}
  .why{margin:6px 0 8px 18px;color:var(--mu);font-size:.9rem}.action{color:#06b6d4;font-size:.9rem}
  table{width:100%;border-collapse:collapse;font-size:.88rem;background:var(--card);border:1px solid var(--bd);border-radius:12px;overflow:hidden}
  th{text-align:left;color:var(--mu);font-size:.72rem;text-transform:uppercase;padding:10px 14px;border-bottom:1px solid var(--bd)}
  td{padding:9px 14px;border-bottom:1px solid var(--bd)}tr:last-child td{border-bottom:none}
  footer{color:var(--mu);font-size:.78rem;margin-top:28px;text-align:center}
</style></head>
<body>
  <h1>OSS Health Report${opts.project ? ' <span class="mu">— ' + esc(opts.project) + '</span>' : ''}</h1>
  <div class="mu">${esc(opts.scanned || valid.length)} dependencies scanned${opts.generated ? ' · ' + esc(opts.generated) : ''}</div>
  <div class="strip">
    <div class="stat"><div class="n" style="color:${scoreColor(avg)}">${avg.toFixed(0)}/100</div><div class="l">avg health</div></div>
    <div class="stat"><div class="n" style="color:#ef4444">${crit.length}</div><div class="l">critical</div></div>
    <div class="stat"><div class="n" style="color:#eab308">${warn.length}</div><div class="l">warning</div></div>
    <div class="stat"><div class="n" style="color:#22c55e">${healthy.length}</div><div class="l">healthy</div></div>
  </div>
  ${risky.length ? `<h2>⚠ Risk findings (${risky.length})</h2>${riskyCards}` : `<h2>✓ No major risk findings</h2>`}
  <h2>All dependencies</h2>
  <table><thead><tr><th>Package</th><th style="text-align:right">Score</th><th>Risk</th><th style="text-align:right">Downloads/wk</th><th>Blast</th><th>Last push</th></tr></thead>
  <tbody>${allRows}</tbody></table>
  <footer>Generated by oss-health-scan · suggested alternatives are recommendations, not automatic fixes</footer>
</body></html>`;
}

module.exports = { toHtml };
