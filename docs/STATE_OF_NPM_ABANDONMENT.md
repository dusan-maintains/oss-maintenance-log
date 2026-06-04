# State of npm Abandonment 2026

*How much of the JavaScript ecosystem runs on packages nobody maintains anymore.*

**Generated:** 2026-06-04 · **Tool:** [`oss-health-scan`](https://www.npmjs.com/package/oss-health-scan) · **Sample:** 58 widely-used / most-depended-on packages · **Reproduce:** [`scripts/abandonment-study.js`](../scripts/abandonment-study.js)

`npm audit` tells you which dependencies carry a *CVE*. It says nothing about the quieter risk: dependencies that are **deprecated, archived, or simply unmaintained** — the ones that become tomorrow's supply-chain incident (`event-stream`, `colors`, `node-ipc` all started as "abandoned but trusted"). We pointed `oss-health-scan` at 58 household-name npm packages to see how many are already dead on their feet.

## Headline

**14 of the 58 are formally deprecated — and still pull a combined ~52.7M downloads every week (≈225M/month).**

These aren't obscure. They sit in millions of `package.json` files right now.

## The Living Dead — flagged deprecated, still shipping to millions

| Package | Downloads/wk | Last npm publish | Health |
|---|--:|--:|--:|
| `request` | 14.6M | ~8 mo | 5/100 |
| `har-validator` | 14.2M | ~4.0 yr | 5/100 |
| `q` | 13.1M | ~8 mo | 5/100 |
| `tslint` | 2.1M | ~3.0 yr | 5/100 |
| `request-promise` | 1.5M | ~1.9 yr | 5/100 |
| `left-pad` | 1.2M | ~2.1 yr | 5/100 |
| `coffee-script` | 1.1M | ~2.8 yr | 5/100 |
| `istanbul` | 983k | ~3 mo | 5/100 |
| `gulp-util` | 968k | ~2.0 yr | 5/100 |
| `node-uuid` | 955k | ~3.1 yr | 5/100 |
| `node-sass` | 931k | ~1.9 yr | 5/100 |
| `protractor` | 652k | ~3.3 yr | 5/100 |
| `jade` | 495k | ~4.0 yr | 5/100 |
| `phantomjs` | 64k | ~4.0 yr | 5/100 |

`request` — deprecated since 2020 — still moves **14.6M downloads a week**. `har-validator`, a transitive dependency most developers have never typed by hand, rides shotgun at **14.2M**. `left-pad`, the one-line package that once broke the internet, is deprecated, archived, and still pulls **1.2M/week**. `tslint` was sunset for ESLint years ago and still does **2.1M**.

## What `npm audit` sees: almost nothing

Cross-checking the long-deprecated set against [OSV.dev](https://osv.dev), only **one** carries a known security advisory:

- `request` → **GHSA-p8p7-x288-28g6** (high severity) — deprecated *and* vulnerable, still 14.6M downloads/week.

The rest trip **zero** CVEs. That is the entire point: abandonment is not a vulnerability a CVE scanner can see — until the day it becomes one (`event-stream` had a clean `npm audit` right up until it didn't). A CVE-only tool waves them straight through.

## Cold, not yet dead — enormous, but the lights are dimming

Not flagged deprecated, but no meaningful upstream activity in a long time while downloads stay huge (GitHub push age, same-day snapshot):

| Package | Downloads/wk | Last GitHub push | Why it's cold |
|---|--:|--:|---|
| `bluebird` | 46.9M | ~1.6 yr | obsoleted by native Promises |
| `moment` | 33.8M | ~1.8 yr | self-declared maintenance mode |
| `colors` | 26.1M | ~3.0 yr | sabotaged by its own author in 2022 |

All three are load-bearing and cooling. None of them trip `npm audit`.

## Why the score is deliberately conservative

`oss-health-scan` weights **Maintenance 40% / Community 25% / Popularity 20% / Risk 15%**, with two hard overrides: **deprecated → 5/100, archived → 8/100.**

Popularity deliberately keeps a stale-but-massive package out of the red until there's a real signal — the scanner doesn't cry wolf on something the whole ecosystem still leans on. So when it returns **5/100**, that isn't a heuristic guess. It's a maintainer telling you, in the package's own metadata, to stop depending on it.

## Reproduce it

The whole study regenerates from public APIs:

```bash
node scripts/abandonment-study.js            # writes docs/data/abandonment-study.{json,md}
GITHUB_TOKEN=ghp_... node scripts/abandonment-study.js   # adds push-age, archived flags, full cold analysis
```

The exact deprecated set, with a CVE cross-check:

```bash
npx oss-health-scan request har-validator q tslint request-promise left-pad coffee-script istanbul gulp-util node-uuid node-sass protractor jade phantomjs --vulns
```

Scan your own tree:

```bash
npx oss-health-scan        # scans ./package.json
```

## Method & limitations

- Data pulled live from the npm registry and GitHub on **2026-06-04** via `oss-health-scan@1.6.0`, driven by `scripts/abandonment-study.js`. Deprecation/archive flags come straight from npm/GitHub metadata — not inference. Raw results: [`docs/data/abandonment-study.json`](data/abandonment-study.json).
- The generator scans **sequentially with throttling**, so npm download counts resolve reliably (56/58 this run; the 2 misses are excluded from totals rather than counted as zero).
- This was an **unauthenticated** run. Deprecation, downloads, and last-publish come from npm and are complete; GitHub-derived fields (push age, archived flag, the cold-package analysis) require a `GITHUB_TOKEN` and were taken from the same-day authenticated snapshot. Re-run the script with a token to populate them at full scale.
- The sample is a curated set of well-known packages, **not** a statistical top-N by dependents — treat this as a probe, not a census. A token lifts the list to a real census; that's the next step.

---

*Generated by [`oss-health-scan`](https://github.com/dusan-maintains/oss-maintenance-log) — the dependency-health scanner that flags abandonment, not just CVEs.*
