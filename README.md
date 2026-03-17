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

**This repository updates itself every 6 hours via GitHub Actions. No manual edits. Pure machine-readable evidence.**

Packages with no active maintainer still serve millions of developers. This repo tracks, patches, and publicly documents that work — forks, branches, commits, PRs, and SLA response times — all verifiable without private context.

---

[📊 Live Data](#-live-data) · [📦 Tracked Projects](#currently-tracked-projects) · [📋 Contributions](#contributions) · [🔧 Use as Template](#use-it-yourself) · [📁 Project Structure](#project-structure)

---

## Problem

Thousands of packages are effectively abandoned while still receiving hundreds of thousands of weekly downloads. Issue trackers fill up, security patches go unmerged, and downstream teams inherit silent risk. There is no standard way to track this drift or coordinate maintenance efforts.

## What This Does

A config-driven set of PowerShell scripts + GitHub Actions that automatically:

- Polls GitHub API for repo metadata (stars, forks, open issues, last push date)
- Pulls npm download counts (weekly rolling window)
- Tracks PR states, mergeability, and diff stats for any contributions you submit
- Monitors review SLA — flags when maintainer feedback has gone unanswered past a configurable threshold
- **Computes weighted health scores (0–100)** per package with SVG badges
- Generates a prioritized action queue from all tracked repos
- Commits machine-readable JSON + human-readable Markdown snapshots every 6 hours
- Prunes old snapshots automatically (configurable retention)
- Renders an **interactive dark-mode dashboard** on GitHub Pages with Chart.js

All data is public, auditable, and requires zero manual updates after initial setup.

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

**Combined footprint: <!-- STATS:START -->9.1k stars · 1.4M npm downloads/week<!-- STATS:END -->**

## Contributions

### Merged

<!-- CONTRIBUTIONS_MERGED:START -->
- **kana-dojo [#6309](https://github.com/lingdojo/kana-dojo/pull/6309)** — Content contribution. Merged 2026-02-27. Closed issue [#6305](https://github.com/lingdojo/kana-dojo/issues/6305).
<!-- CONTRIBUTIONS_MERGED:END -->

### Open

<!-- CONTRIBUTIONS_OPEN:START -->
- **grafana [#119212](https://github.com/grafana/grafana/pull/119212)** — Remove external Google Fonts loading and external logo URL from email templates; replace with inline SVG data URI. Privacy/security hardening for self-hosted Grafana instances.
- **jquery-modal #315** — Render `closeText` as plain text instead of HTML; modernize ESC-key handling
- **jquery-modal #316** — Scope AJAX callbacks to originating modal instance to prevent race conditions
- **jquery-modal #317** — Idempotent initialization guard for duplicate imports (issue #309)
- **jquery-tablesort #49** — Sync `tablesort.$th` with active sorted header (fixes #40, #45)
- **python-shell #320** — Fix `runString()` temp-path generation with regression test
- **rrule #664** — Fix `WeekdayStr[]` serialization for `BYDAY` output (issue #648)
- **react-hexgrid #123** — Add tests for `GridGenerator.ring()` and `GridGenerator.spiral()`
<!-- CONTRIBUTIONS_OPEN:END -->

<details>
<summary><strong>Full contribution log with commits and branches (25 entries)</strong></summary>

| Date (UTC) | Project | Type | Link | Status | Impact |
|---|---|---|---|---|---|
| 2026-02-27 | jquery-modal | Fork | [dusan-maintains/jquery-modal](https://github.com/dusan-maintains/jquery-modal) | Active | Public maintenance fork created |
| 2026-02-27 | jquery-modal | Branch | [maintenance/first-patch](https://github.com/dusan-maintains/jquery-modal/tree/maintenance/first-patch) | Pushed | PR branch published |
| 2026-02-27 | jquery-modal | Commit | [8b3d55e](https://github.com/dusan-maintains/jquery-modal/commit/8b3d55eb3b3fdf13e962b8865e13c7234cf8ab3c) | Published | closeText safety, ESC handling, docs consistency |
| 2026-02-27 | jquery-modal | PR | [kylefox/jquery-modal#315](https://github.com/kylefox/jquery-modal/pull/315) | Open | Reliability + documentation correctness |
| 2026-02-27 | jquery-modal | Branch | [maintenance/ajax-instance-safety](https://github.com/dusan-maintains/jquery-modal/tree/maintenance/ajax-instance-safety) | Pushed | Independent second maintenance branch |
| 2026-02-27 | jquery-modal | Commit | [4e6fd0f](https://github.com/dusan-maintains/jquery-modal/commit/4e6fd0f85604b0dc71dfd59503a7b66a3fa2df42) | Published | AJAX callback instance safety (race paths) |
| 2026-02-27 | jquery-modal | PR | [kylefox/jquery-modal#316](https://github.com/kylefox/jquery-modal/pull/316) | Open | Concurrency and ownership hardening |
| 2026-02-27 | jquery-modal | Branch | [maintenance/no-double-init](https://github.com/dusan-maintains/jquery-modal/tree/maintenance/no-double-init) | Pushed | Third independent maintenance branch |
| 2026-02-27 | jquery-modal | Commit | [97f9643](https://github.com/dusan-maintains/jquery-modal/commit/97f9643361b2487328f5741b50a8fd5129ab7c9b) | Published | Idempotent init guard for duplicate imports |
| 2026-02-27 | jquery-modal | PR | [kylefox/jquery-modal#317](https://github.com/kylefox/jquery-modal/pull/317) | Open | Issue-driven fix for multiple imports (#309) |
| 2026-02-27 | jquery-tablesort | Fork | [dusan-maintains/jquery-tablesort](https://github.com/dusan-maintains/jquery-tablesort) | Active | Second maintainer-needed package adopted |
| 2026-02-27 | jquery-tablesort | Branch | [maintenance/update-sorted-column-ref](https://github.com/dusan-maintains/jquery-tablesort/tree/maintenance/update-sorted-column-ref) | Pushed | Issue-driven branch for stale state fix |
| 2026-02-27 | jquery-tablesort | Commit | [d5a5aae](https://github.com/dusan-maintains/jquery-tablesort/commit/d5a5aae333d5305a5dd372f9be2d202238ce1161) | Published | Keep `tablesort.$th` synced with active sorted header |
| 2026-02-27 | jquery-tablesort | PR | [kylefox/jquery-tablesort#49](https://github.com/kylefox/jquery-tablesort/pull/49) | Open | Fixes open issue reports (#40, #45) |
| 2026-02-27 | python-shell | Fork | [dusan-maintains/python-shell](https://github.com/dusan-maintains/python-shell) | Active | Third ecosystem package under active maintenance |
| 2026-02-27 | python-shell | Branch | [maintenance/fix-runstring-temp-path](https://github.com/dusan-maintains/python-shell/tree/maintenance/fix-runstring-temp-path) | Pushed | Focused reliability patch branch |
| 2026-02-27 | python-shell | Commit | [1520d01](https://github.com/dusan-maintains/python-shell/commit/1520d01cd15d9463022608e86b1919f95444116f) | Published | Fix `runString()` temp path + regression test |
| 2026-02-27 | python-shell | PR | [extrabacon/python-shell#320](https://github.com/extrabacon/python-shell/pull/320) | Open | Prevent invalid temp-file path generation in `runString()` |
| 2026-02-27 | rrule | Fork | [dusan-maintains/rrule](https://github.com/dusan-maintains/rrule) | Active | Fourth ecosystem package under active maintenance |
| 2026-02-27 | rrule | Branch | [maintenance/fix-weekdaystr-serialization](https://github.com/dusan-maintains/rrule/tree/maintenance/fix-weekdaystr-serialization) | Pushed | Issue-driven serialization reliability patch |
| 2026-02-27 | rrule | Commit | [c5ae606](https://github.com/dusan-maintains/rrule/commit/c5ae606afad4e5f7e44e4a17bd56dc01b14e6363) | Published | Fix `WeekdayStr[]` serialization for `BYDAY` output |
| 2026-02-27 | rrule | PR | [jkbrzt/rrule#664](https://github.com/jkbrzt/rrule/pull/664) | Open | Fixes `BYDAY=undefined` for string weekday arrays (#648) |
| 2026-02-27 | react-hexgrid | Fork | [dusan-maintains/react-hexgrid](https://github.com/dusan-maintains/react-hexgrid) | Active | Fifth ecosystem package under active maintenance |
| 2026-02-27 | react-hexgrid | Branch | [maintenance/add-ring-spiral-tests](https://github.com/dusan-maintains/react-hexgrid/tree/maintenance/add-ring-spiral-tests) | Pushed | Focused test coverage branch for geometry generators |
| 2026-02-27 | react-hexgrid | Commit | [cbfcc50](https://github.com/dusan-maintains/react-hexgrid/commit/cbfcc50f8be57495170a4908d19920f5ff5f87ca) | Published | Add ring/spiral regression coverage |
| 2026-02-27 | react-hexgrid | PR | [Hellenic/react-hexgrid#123](https://github.com/Hellenic/react-hexgrid/pull/123) | Open | Raises confidence for generator correctness |

</details>

## Use It Yourself

This repo is a reusable template. To track your own set of packages:

1. Fork this repository
2. Edit `config/tracked-repositories.json` — add your packages, PR numbers, SLA settings
3. Push — the GitHub Actions workflow runs every 6 hours automatically
4. Your `evidence/` directory will populate with JSON + Markdown snapshots
5. Health scores and SVG badges auto-generate in `evidence/badges/`

```json
// config/tracked-repositories.json — add your packages here
{
  "version": 1,
  "contributor": "your-github-username",
  "default_sla_hours": 24,
  "repositories": [
    {
      "owner": "org",
      "repo": "package-name",
      "package": "npm-package-name",
      "status_label": "Open",
      "maintainer_needed_signal": "Description of why this needs maintenance",
      "tracked_pr_numbers": [42],
      "review_sla_base_name": "review-sla-package-name"
    }
  ]
}
```

```powershell
# Run locally
./scripts/update-all-evidence.ps1
./scripts/compute-health-scores.ps1
```

<!-- LIVE_DATA:START -->
## 📊 Live Data

- [📊 Interactive Dashboard](https://dusan-maintains.github.io/oss-maintenance-log) — health scores, charts, action queue
- [Health Scores](./evidence/health-scores.md) — weighted 0-100 scores per package
- [Ecosystem status (JSON)](./evidence/ecosystem-status.json)
- [Ecosystem status (Markdown)](./evidence/ecosystem-status.md)
- [Action queue](./evidence/action-queue.md)
- Per-repo SLA: [grafana](./evidence/review-sla-grafana.md) · [kana-dojo](./evidence/review-sla-kana-dojo.md) · [jquery-modal](./evidence/review-sla.md) · [tablesort](./evidence/review-sla-tablesort.md) · [python-shell](./evidence/review-sla-python-shell.md) · [rrule](./evidence/review-sla-rrule.md) · [react-hexgrid](./evidence/review-sla-react-hexgrid.md)
<!-- LIVE_DATA:END -->

## Project Structure

```
config/
  tracked-repositories.json    # All configuration in one file
scripts/
  common.ps1                   # Shared functions (DRY module)
  update-all-evidence.ps1      # Orchestrator — runs everything
  update-evidence.ps1           # Per-repo PR tracking + npm stats
  update-ecosystem-status.ps1   # Multi-repo aggregated snapshot
  update-review-sla.ps1         # Review response time monitoring
  update-action-queue.ps1       # Prioritized action queue
  compute-health-scores.ps1     # Health scoring engine (0-100)
  validate-repo.ps1             # CI validation checks
evidence/
  *.json                        # Machine-readable snapshots
  *.md                          # Human-readable reports
  badges/*.svg                  # Health score badges
tests/
  common.Tests.ps1              # Pester tests for shared module
  health-score.Tests.ps1        # Pester tests for scoring logic
docs/
  ARCHITECTURE.md               # System design
  DATA_MODEL.md                 # JSON schema docs
  OPERATIONS.md                 # Operational runbook
  ROADMAP.md                    # Feature roadmap
.github/workflows/
  evidence-daily.yml            # Cron: every 6 hours
  validate.yml                  # CI: config + script validation
```

## License

MIT

---

*Auto-updated every 6 hours by [GitHub Actions](https://github.com/dusan-maintains/oss-maintenance-log/actions). Star the repo to follow live maintenance activity.*
