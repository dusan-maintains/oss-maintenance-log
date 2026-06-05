// OSS Health badge — Cloudflare Worker.
// Serves a shields.io endpoint badge for any npm package: /badge/<pkg>
// Embed: ![OSS Health](https://img.shields.io/endpoint?url=https://<worker>/badge/express)

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const m = url.pathname.match(/^\/badge\/(.+)$/);
    if (!m) return json({ schemaVersion: 1, label: 'oss health', message: 'usage: /badge/<pkg>', color: 'lightgrey' });
    const pkg = decodeURIComponent(m[1]);
    try {
      const score = await scorePackage(pkg);
      const color = score < 30 ? 'red' : score < 60 ? 'yellow' : 'brightgreen';
      return json({ schemaVersion: 1, label: 'oss health', message: `${score}/100`, color });
    } catch (e) {
      return json({ schemaVersion: 1, label: 'oss health', message: 'not found', color: 'lightgrey' });
    }
  }
};

async function scorePackage(pkg) {
  const enc = encodeURIComponent(pkg);
  const [latest, doc, dl] = await Promise.all([
    fetch(`https://registry.npmjs.org/${enc}/latest`).then(r => (r.ok ? r.json() : null)).catch(() => null),
    fetch(`https://registry.npmjs.org/${enc}`, { headers: { accept: 'application/vnd.npm.install-v1+json' } }).then(r => (r.ok ? r.json() : null)).catch(() => null),
    fetch(`https://api.npmjs.org/downloads/point/last-week/${enc}`).then(r => (r.ok ? r.json() : null)).catch(() => null)
  ]);
  if (!latest && !doc) throw new Error('not found');
  if (latest && latest.deprecated) return 5;

  const downloads = dl ? dl.downloads || 0 : 0;
  const modified = doc && doc.modified ? new Date(doc.modified).getTime() : null;
  const days = modified ? Math.round((Date.now() - modified) / 86400000) : null;

  // Maintenance recency (0-10) and popularity (0-10), weighted toward recency.
  const recency = days == null ? 6 : days > 1095 ? 2 : days > 365 ? 5 : days > 180 ? 7 : 9;
  const pop = downloads >= 1e7 ? 10 : downloads >= 1e6 ? 9 : downloads >= 1e5 ? 7 : downloads >= 1e4 ? 5 : downloads >= 1e3 ? 3 : 1;
  const score = Math.round(recency * 6 + pop * 4);
  return Math.max(5, Math.min(100, score));
}

function json(obj) {
  return new Response(JSON.stringify(obj), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=3600',
      'access-control-allow-origin': '*'
    }
  });
}
