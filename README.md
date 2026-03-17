# OSS Maintenance Log

> <!-- TAGLINE:START -->One maintainer. 7 packages. **1.4M npm downloads/week** kept alive.<!-- TAGLINE:END -->

<!-- RUN_STATUS:START -->
[![Evidence Daily Update](https://github.com/dusan-maintains/oss-maintenance-log/actions/workflows/evidence-daily.yml/badge.svg)](https://github.com/dusan-maintains/oss-maintenance-log/actions/workflows/evidence-daily.yml)
[![Validate](https://github.com/dusan-maintains/oss-maintenance-log/actions/workflows/validate.yml/badge.svg)](https://github.com/dusan-maintains/oss-maintenance-log/actions/workflows/validate.yml)
<!-- RUN_STATUS:END -->
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Tracked Packages](https://img.shields.io/badge/packages%20tracked-7-blue.svg)](#currently-tracked-projects)
[![Weekly npm Downloads](https://img.shields.io/badge/npm%20downloads%2Fweek-1.4M%2B-brightgreen.svg)](#-live-data)
[![Open PRs](https://img.shields.io/badge/upstream%20PRs-8%20open-orange.svg)](#contributions)
[![Auto-Updates](https://img.shields.io/badge/auto--updates-every%206h-blueviolet.svg)](https://github.com/dusan-maintains/oss-maintenance-log/actions)

---

## 🔬 Scan Your Dependencies — In One Command

```bash
npx oss-health-scan lodash moment request express
```

```
  OSS Health Scan Results
  ──────────────────────────────────────────────────
  Scanned: 3 packages
  Average health: 40.8/100
  ● Critical: 0  ● Warning: 3  ● Healthy: 0

   🟡 WARNING

  react-hexgrid                       ███████░░░░░░░░░░░░░ 35.1/100  last push 594d ago  1.5k/wk
  jquery-modal                        ████████░░░░░░░░░░░░ 40.5/100  last push 699d ago  21.1k/wk
  rrule                               █████████░░░░░░░░░░░ 46.8/100  last push 628d ago  1.2M/wk

  ──────────────────────────────────────────────────
  Tip: set GITHUB_TOKEN env for higher API rate limits
```

**Zero dependencies.** Scans any package, scores 0–100, exits with code 1 on critical findings (CI-friendly).

<details>
<summary><strong>CLI flags</strong></summary>

```bash
npx oss-health-scan            # Scan ./package.json
npx oss-health-scan pkg1 pkg2   # Scan specific packages
npx oss-health-scan --dev       # Include devDependencies
npx oss-health-scan --json      # JSON output for CI
npx oss-health-scan --threshold 40  # Only unhealthy
```
</details>

---

## 📊 Interactive Dashboard

[**➜ Open Live Dashboard**](https://dusan-maintains.github.io/oss-maintenance-log)

<img src="docs/dashboard-preview.png" alt="Health score cards with circular gauges, npm download chart" width="100%">
<img src="docs/dashboard-charts.png" alt="Radar chart comparing packages, action queue" width="100%">

Dark-mode dashboard with Chart.js — health score gauges, npm download distribution, radar breakdown, action queue. Auto-updates every 6 hours with fresh data.

---

## Problem

Thousands of packages are effectively abandoned while still receiving hundreds of thousands of weekly downloads. Issue trackers fill up, security patches go unmerged, and downstream teams inherit silent risk. `npm audit` catches CVEs — but **not abandoned packages**.

## What This Does

Config-driven PowerShell + GitHub Actions that automatically:

- **Polls GitHub API** — stars, forks, issues, last push date per repo
- **Pulls npm downloads** — weekly rolling window
- **Tracks PRs** — state, mergeability, diff stats for your contributions
- **Monitors review SLA** — flags when maintainer feedback goes stale
- **Computes health scores (0–100)** — weighted engine with SVG badges
- **Detects trends** — 180-day history, 7-day and 30-day deltas
- **Fires alerts** — auto-creates GitHub Issues when packages drop below critical threshold
- **Generates action queue** — prioritized by urgency
- **Commits snapshots** — machine-readable JSON + human-readable Markdown every 6 hours
- Renders **interactive dark-mode dashboard** on GitHub Pages

## Currently Tracked Projects

<!-- TRACKED_PROJECTS:START -->
| Project | Stars | npm/week | Status | Health | My PRs |
|---------|-------|----------|--------|--------|--------|
| [grafana/grafana](https://github.com/grafana/grafana) | 72,000+ | — | 🟢 Open | ![health](evidence/badges/health-grafana.svg) | [#119212](https://github.com/grafana/grafana/pull/119212) |
| [lingdojo/kana-dojo](https://github.com/lingdojo/kana-dojo) | 1,657 | — | ✅ **Merged** | ![health](evidence/badges/health-kana-dojo.svg) | [#6309](https://github.com/lingdojo/kana-dojo/pull/6309) |
| [kylefox/jquery-modal](https://github.com/kylefox/jquery-modal) | 2,614 | 24,399 | 🟡 Maintainers Wanted | ![health](evidence/badges/health-jquery-modal.svg) | [#315](https://github.com/kylefox/jquery-modal/pull/315), [#316](https://github.com/kylefox/jquery-modal/pull/316), [#317](https://github.com/kylefox/jquery-modal/pull/317) |
| [kylefox/jquery-tablesort](https://github.com/kylefox/jquery-tablesort) | 258 | 1,667 | 🟡 Maintainers Wanted | ![health](evidence/badges/health-jquery-tablesort.svg) | [#49](https://github.com/kylefox/jquery-tablesort/pull/49) |
| [extrabacon/python-shell](https://github.com/extrabacon/python-shell) | 2,163 | 194,847 | 🔴 Maintainer Gap | ![health](evidence/badges/health-python-shell.svg) | [#320](https://github.com/extrabacon/python-shell/pull/320) |
| [jkbrzt/rrule](https://github.com/jkbrzt/rrule) | 3,681 | 1,374,236 | 🔴 Open Backlog | ![health](evidence/badges/health-rrule.svg) | [#664](https://github.com/jkbrzt/rrule/pull/664) |
| [Hellenic/react-hexgrid](https://github.com/Hellenic/react-hexgrid) | 350 | 1,702 | 🟡 Maintainer Needed | ![health](evidence/badges/health-react-hexgrid.svg) | [#123](https://github.com/Hellenic/react-hexgrid/pull/123) |
<!-- TRACKED_PROJECTS:END -->

**Combined: <!-- STATS:START -->9.1k stars · 1.4M npm downloads/week<!-- STATS:END -->**

## Health Scoring

Each package gets a **weighted health score (0–100)**:

| Dimension | Weight | Metrics |
|-----------|--------|---------|
| **Maintenance** | 40% | Last push recency (exponential decay), last npm publish, open issues ratio |
| **Community** | 25% | GitHub stars (log-scaled), forks |
| **Popularity** | 20% | npm downloads/week (log-scaled) |
| **Risk** | 15% | Inactivity penalty, issue backlog, stale publish |

**Instant flags:** DEPRECATED → 5/100, ARCHIVED → 8/100.

## Contributions

### Merged

<!-- CONTRIBUTIONS_MERGED:START -->
- **kana-dojo [#6309](https://github.com/lingdojo/kana-dojo/pull/6309)** — Content contribution. Merged 2026-02-27.
<!-- CONTRIBUTIONS_MERGED:END -->

### Open

<!-- CONTRIBUTIONS_OPEN:START -->
- **grafana [#119212](https://github.com/grafana/grafana/pull/119212)** — Remove external Google Fonts + logo URL from email templates; inline SVG data URI
- **jquery-modal #315** — Render `closeText` as plain text; modernize ESC-key handling
- **jquery-modal #316** — Scope AJAX callbacks to originating modal instance
- **jquery-modal #317** — Idempotent initialization guard for duplicate imports
- **jquery-tablesort #49** — Sync `tablesort.$th` with active sorted header
- **python-shell #320** — Fix `runString()` temp-path generation with regression test
- **rrule #664** — Fix `WeekdayStr[]` serialization for `BYDAY` output
- **react-hexgrid #123** — Add tests for `GridGenerator.ring()` and `GridGenerator.spiral()`
<!-- CONTRIBUTIONS_OPEN:END -->

<details>
<summary><strong>Full contribution log (25 entries)</strong></summary>

| Date (UTC) | Project | Type | Link | Status |
|---|---|---|---|---|
| 2026-02-27 | jquery-modal | Fork | [dusan-maintains/jquery-modal](https://github.com/dusan-maintains/jquery-modal) | Active |
| 2026-02-27 | jquery-modal | PR | [#315](https://github.com/kylefox/jquery-modal/pull/315) | Open |
| 2026-02-27 | jquery-modal | PR | [#316](https://github.com/kylefox/jquery-modal/pull/316) | Open |
| 2026-02-27 | jquery-modal | PR | [#317](https://github.com/kylefox/jquery-modal/pull/317) | Open |
| 2026-02-27 | jquery-tablesort | Fork | [dusan-maintains/jquery-tablesort](https://github.com/dusan-maintains/jquery-tablesort) | Active |
| 2026-02-27 | jquery-tablesort | PR | [#49](https://github.com/kylefox/jquery-tablesort/pull/49) | Open |
| 2026-02-27 | python-shell | Fork | [dusan-maintains/python-shell](https://github.com/dusan-maintains/python-shell) | Active |
| 2026-02-27 | python-shell | PR | [#320](https://github.com/extrabacon/python-shell/pull/320) | Open |
| 2026-02-27 | rrule | Fork | [dusan-maintains/rrule](https://github.com/dusan-maintains/rrule) | Active |
| 2026-02-27 | rrule | PR | [#664](https://github.com/jkbrzt/rrule/pull/664) | Open |
| 2026-02-27 | react-hexgrid | Fork | [dusan-maintains/react-hexgrid](https://github.com/dusan-maintains/react-hexgrid) | Active |
| 2026-02-27 | react-hexgrid | PR | [#123](https://github.com/Hellenic/react-hexgrid/pull/123) | Open |

</details>

## Use It Yourself

### Quick Scan (no install)

```bash
npx oss-health-scan express lodash moment
```

### Full Monitoring Setup

1. Fork this repository
2. Edit `config/tracked-repositories.json` — your packages, PRs, SLA settings
3. Push — GitHub Actions runs every 6 hours
4. `evidence/` fills with JSON + Markdown snapshots
5. Health scores + SVG badges auto-generate

```json
{
  "version": 1,
  "contributor": "your-github-username",
  "default_sla_hours": 24,
  "repositories": [
    {
      "owner": "org",
      "repo": "package-name",
      "package": "npm-package-name",
      "tracked_pr_numbers": [42]
    }
  ]
}
```

### CI Integration

```yaml
# .github/workflows/health-check.yml
name: Dependency Health Check
on:
  schedule:
    - cron: "0 9 * * 1"
  pull_request:

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npx oss-health-scan --threshold 30
```

<!-- LIVE_DATA:START -->
## 📊 Live Data

- [📊 Interactive Dashboard](https://dusan-maintains.github.io/oss-maintenance-log) — health scores, charts, action queue
- [Health Scores](./evidence/health-scores.md) — weighted 0-100 per package
- [Ecosystem Status](./evidence/ecosystem-status.md) — aggregated snapshot
- [Action Queue](./evidence/action-queue.md) — prioritized tasks
- Per-repo SLA: [grafana](./evidence/review-sla-grafana.md) · [kana-dojo](./evidence/review-sla-kana-dojo.md) · [jquery-modal](./evidence/review-sla.md) · [tablesort](./evidence/review-sla-tablesort.md) · [python-shell](./evidence/review-sla-python-shell.md) · [rrule](./evidence/review-sla-rrule.md) · [react-hexgrid](./evidence/review-sla-react-hexgrid.md)
<!-- LIVE_DATA:END -->

## Project Structure

```
config/tracked-repositories.json     ← All configuration
scripts/
  common.ps1                        ← Shared functions (DRY)
  update-all-evidence.ps1            ← Orchestrator
  compute-health-scores.ps1          ← Health scoring (0-100)
  compute-trends.ps1                 ← 180-day trend engine
  check-alerts.ps1                   ← Auto GitHub Issues
cli/
  bin/scan.js                        ← CLI entry point
  lib/scoring.js                     ← JS health algorithm
  lib/reporter.js                    ← Colored terminal output
evidence/
  *.json, *.md                       ← Machine + human snapshots
  badges/*.svg                       ← Health badges
tests/
  common.Tests.ps1                   ← Pester tests (21 passing)
  health-score.Tests.ps1
.github/workflows/
  evidence-daily.yml                 ← Cron: every 6 hours
  validate.yml                       ← CI: config validation
  publish-cli.yml                    ← Auto-publish on release
```

## License

MIT

---

*Auto-updated every 6 hours by [GitHub Actions](https://github.com/dusan-maintains/oss-maintenance-log/actions).*
