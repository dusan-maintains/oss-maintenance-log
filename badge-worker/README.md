# OSS Health badge — Cloudflare Worker

A tiny Worker that serves an **embeddable health badge** for any npm package, using the
[shields.io endpoint](https://shields.io/endpoint) protocol. Green badges get embedded by
proud maintainers; red ones get noticed.

## Deploy

```bash
npm i -g wrangler
cd badge-worker
wrangler deploy        # publishes to https://oss-health.<your-subdomain>.workers.dev
```

No secrets required — the badge runs on public npm metadata.

## Embed

```markdown
![OSS Health](https://img.shields.io/endpoint?url=https://oss-health.<your-subdomain>.workers.dev/badge/express)
```

Replace `express` with any package name (URL-encode scoped names, e.g. `%40babel%2Fcore`).

- 🟢 **brightgreen** ≥ 60 · 🟡 **yellow** 30–59 · 🔴 **red** < 30 · deprecated → **5/100**

## Scoring

The badge weights **maintenance recency** and **popularity** from public npm metadata and
hard-flags **deprecated** packages (→ 5/100, red). It is intentionally approximate and
npm-only. For the full 0–100 score with GitHub signals, blast radius, maintainer-risk, and
security posture, run the CLI:

```bash
npx oss-health-scan <pkg>
```
