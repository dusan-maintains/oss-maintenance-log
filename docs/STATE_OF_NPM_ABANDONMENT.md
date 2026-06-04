# State of npm Abandonment 2026

*How much of the JavaScript ecosystem runs on packages nobody maintains anymore.*

**Generated:** 2026-06-04 · **Tool:** [`oss-health-scan`](https://www.npmjs.com/package/oss-health-scan) · **Sample:** 123 of the most-depended-on npm packages · **Reproduce:** [`scripts/abandonment-study.js`](../scripts/abandonment-study.js)

`npm audit` tells you which dependencies carry a *CVE*. It says nothing about the quieter risk: dependencies that are **deprecated, archived, or simply unmaintained** — the ones that become tomorrow's supply-chain incident (`event-stream`, `colors`, `node-ipc` all started as "abandoned but trusted"). We ran `oss-health-scan` across 123 of the packages the ecosystem leans on hardest — the household names *and* the invisible micro-utility layer underneath them.

## Headline

**20 of the 123 are formally deprecated or archived — and still pull a combined ~297M downloads every week.**
Another **21 are "cold"** — no upstream push in 1 to 7+ years — while moving hundreds of millions more.

This isn't the long tail. It's the foundation.

## The Living Dead — flagged deprecated/archived, still shipping to the world

| Package | Downloads/wk | Flag | Last npm publish | Last GitHub push | Health |
|---|--:|---|--:|--:|--:|
| `path-is-absolute` | 86.2M | deprecated + archived | 2.9 yr | 5.4 yr | 5/100 |
| `inflight` | 85.5M | deprecated + archived | 2.0 yr | 2.0 yr | 5/100 |
| `gauge` | 24.2M | deprecated + archived | 1 mo | 2.1 yr | 5/100 |
| `npmlog` | 24.0M | deprecated + archived | 1 mo | 2.1 yr | 5/100 |
| `are-we-there-yet` | 24.0M | deprecated + archived | 1 mo | 2.1 yr | 5/100 |
| `request` | 14.6M | deprecated | 8 mo | 1.8 yr | 5/100 |
| `har-validator` | 14.2M | deprecated | 4.0 yr | 17 d | 5/100 |
| `q` | 13.1M | deprecated + archived | 8 mo | 2.6 yr | 5/100 |
| `tslint` | 2.1M | deprecated + archived | 3.0 yr | 5.2 yr | 5/100 |
| `request-promise` | 1.5M | deprecated | 1.9 yr | 2.3 yr | 5/100 |
| `left-pad` | 1.2M | deprecated + archived | 2.1 yr | 7.1 yr | 5/100 |
| `coffee-script` | 1.1M | deprecated | 2.8 yr | 2.2 yr | 5/100 |
| `istanbul` | 983k | deprecated + archived | 3 mo | 1.5 yr | 5/100 |
| `gulp-util` | 968k | deprecated + archived | 2.0 yr | 5.6 yr | 5/100 |
| `node-uuid` | 955k | deprecated + archived | 3.1 yr | 6.4 yr | 5/100 |
| `node-sass` | 931k | deprecated + archived | 1.9 yr | 1.9 yr | 5/100 |
| `is-odd` | 728k | archived | 2 mo | 7.1 yr | 8/100 |
| `protractor` | 652k | deprecated + archived | 3.3 yr | 3.0 yr | 5/100 |
| `jade` | 495k | deprecated | 4.0 yr | 3 mo | 5/100 |
| `phantomjs` | 64k | deprecated + archived | 4.0 yr | 6.9 yr | 5/100 |

Two packages alone — `path-is-absolute` and `inflight` — carry **~172M downloads/week** between them. `path-is-absolute` is a four-line wrapper made obsolete by `path.isAbsolute()`; `inflight` is a known memory-leak that npm itself deprecated. The trio `gauge` / `npmlog` / `are-we-there-yet` are npm's *own* deprecated internals, still pulling 24M/week each through the dependency graph.

## What `npm audit` sees: almost nothing

A spot-check against [OSV.dev](https://osv.dev) shows how little of this a CVE tool catches: `request` carries a known advisory (**GHSA-p8p7-x288-28g6**, high) — most of the rest carry **none**. Deprecation and abandonment simply aren't CVEs (`event-stream` had a clean `npm audit` right up until it didn't). A CVE-only scanner waves all of this straight through.

## Cold, not yet dead — the backbone, cooling

Not flagged deprecated, but no upstream push in 1–7+ years while downloads stay enormous:

| Package | Downloads/wk | Last GitHub push | Health |
|---|--:|--:|--:|
| `readable-stream` | 303.1M | 1.4 yr | 64/100 |
| `escape-string-regexp` | 298.2M | 1.1 yr | 59/100 |
| `safe-buffer` | 260.3M | 3.0 yr | 52/100 |
| `cross-spawn` | 214.7M | 1.5 yr | 61/100 |
| `function-bind` | 173.4M | 2.6 yr | 52/100 |
| `mkdirp` | 138.9M | 2.7 yr | 68/100 |
| `object-assign` | 136.4M | 2.6 yr | 63/100 |
| `util-deprecate` | 135.9M | **7.6 yr** | 46/100 |
| `wrappy` | 122.3M | 2.3 yr | 39/100 |
| `kind-of` | 120.2M | 2.0 yr | 51/100 |
| `process-nextick-args` | 80.6M | **7.0 yr** | 42/100 |
| `bluebird` | 46.9M | 1.6 yr | 72/100 |

…and `is-buffer` (46.7M, 4.8 yr), `moment` (33.8M, 1.8 yr), `colors` (26.1M, 3.0 yr — sabotaged by its own author in 2022), `has-unicode` / `console-control-strings` (≈19M each, 5.5 yr). `util-deprecate` has not had a commit in **seven and a half years** and is imported 135 million times a week.

## Why the score is deliberately conservative

`oss-health-scan` weights **Maintenance 40% / Community 25% / Popularity 20% / Risk 15%**, with two hard overrides: **deprecated → 5/100, archived → 8/100.**

Popularity deliberately keeps a stale-but-massive package out of the red until there's a real signal — the scanner doesn't cry wolf on something the whole ecosystem still leans on. That's why `safe-buffer` (260M/wk, 3 years cold) sits at 52 rather than 5. So when it *does* return **5/100**, that isn't a heuristic guess — it's a maintainer telling you, in the package's own metadata, to stop depending on it.

## Reproduce it

The whole census regenerates from public APIs:

```bash
GITHUB_TOKEN=ghp_... node scripts/abandonment-study.js
# writes docs/data/abandonment-study.{json,md}
```

(Without a token it still runs — npm data is complete; GitHub push-age / archived / cold need the token.)

Scan your own tree:

```bash
npx oss-health-scan        # scans ./package.json
```

## Method & limitations

- Data pulled live from the npm registry and GitHub on **2026-06-04** via `oss-health-scan@1.6.0`, driven by `scripts/abandonment-study.js` (authenticated run). Deprecation/archive flags come straight from npm/GitHub metadata — not inference. Raw results: [`docs/data/abandonment-study.json`](data/abandonment-study.json).
- The generator scans **sequentially with throttling**: npm download counts resolved for **123/123**, GitHub fields for **120/123**.
- The 123 are a curated set of household names plus the most-depended-on micro-utility layer — a deliberately representative slice, **not** a live statistical top-N by dependents. The script's package list is the one knob to turn for a wider census.

---

*Generated by [`oss-health-scan`](https://github.com/dusan-maintains/oss-maintenance-log) — the dependency-health scanner that flags abandonment, not just CVEs.*
