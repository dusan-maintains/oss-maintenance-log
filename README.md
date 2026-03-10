# OSS Maintenance Log

> One maintainer. Five abandoned packages. **1,596,851 npm downloads/week** kept alive.

[![Evidence Daily Update](https://github.com/dusan-maintains/oss-maintenance-log/actions/workflows/evidence-daily.yml/badge.svg)](https://github.com/dusan-maintains/oss-maintenance-log/actions/workflows/evidence-daily.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Tracked Packages](https://img.shields.io/badge/packages%20tracked-7-blue.svg)](#currently-tracked-projects)
[![Weekly npm Downloads](https://img.shields.io/badge/npm%20downloads%2Fweek-1.6M%2B-brightgreen.svg)](#-live-data)
[![Open PRs](https://img.shields.io/badge/upstream%20PRs-7%20open-orange.svg)](#contributions)
[![Auto-Updates](https://img.shields.io/badge/auto--updates-every%206h-blueviolet.svg)](https://github.com/dusan-maintains/oss-maintenance-log/actions)

**This repository updates itself every 6 hours via GitHub Actions. No manual edits. Pure machine-readable evidence.**

Packages with no active maintainer still serve millions of developers. This repo tracks, patches, and publicly documents that work — forks, branches, commits, PRs, and SLA response times — all verifiable without private context.

---

[📊 Live Data](#-live-data) · [📦 Tracked Projects](#currently-tracked-projects) · [📋 Contributions](#contributions) · [🔧 Use as Template](#use-it-yourself) · [📁 Project Structure](#project-structure)

---

## Problem

Thousands of packages are effectively abandoned while still receiving hundreds of thousands of weekly downloads. Issue trackers fill up, security patches go unmerged, and downstream teams inherit silent risk. There is no standard way to track this drift or coordinate maintenance efforts.

## What This Does

A set of PowerShell scripts + GitHub Actions workflow that automatically:

- Polls GitHub API for repo metadata (stars, forks, open issues, last push date)
- Pulls npm download counts (weekly rolling window)
- Tracks PR states, mergeability, and diff stats for any contributions you submit
- Monitors review SLA — flags when maintainer feedback has gone unanswered past a configurable threshold
- Generates a prioritized action queue from all tracked repos
- Commits machine-readable JSON + human-readable Markdown snapshots every 6 hours
- Prunes old snapshots automatically (configurable retention)

All data is public, auditable, and requires zero manual updates after initial setup.

## Currently Tracked Projects

| Project | Stars | npm/week | Status | My PRs |
|---------|-------|----------|--------|--------|
| [grafana/grafana](https://github.com/grafana/grafana) | 72,000+ | — | 🟢 Open | [#119212](https://github.com/grafana/grafana/pull/119212) |
| [lingdojo/kana-dojo](https://github.com/lingdojo/kana-dojo) | 1,657 | — | ✅ **Merged** | [#6309](https://github.com/lingdojo/kana-dojo/pull/6309) |
| [kylefox/jquery-modal](https://github.com/kylefox/jquery-modal) | 2,614 | 24,399 | 🟡 Maintainers Wanted | [#315](https://github.com/kylefox/jquery-modal/pull/315), [#316](https://github.com/kylefox/jquery-modal/pull/316), [#317](https://github.com/kylefox/jquery-modal/pull/317) |
| [kylefox/jquery-tablesort](https://github.com/kylefox/jquery-tablesort) | 258 | 1,667 | 🟡 Maintainers Wanted | [#49](https://github.com/kylefox/jquery-tablesort/pull/49) |
| [extrabacon/python-shell](https://github.com/extrabacon/python-shell) | 2,163 | 194,847 | 🔴 Maintainer Gap | [#320](https://github.com/extrabacon/python-shell/pull/320) |
| [jkbrzt/rrule](https://github.com/jkbrzt/rrule) | 3,681 | 1,374,236 | 🔴 Open Backlog | [#664](https://github.com/jkbrzt/rrule/pull/664) |
| [Hellenic/react-hexgrid](https://github.com/Hellenic/react-hexgrid) | 350 | 1,702 | 🟡 Maintainer Needed | [#123](https://github.com/Hellenic/react-hexgrid/pull/123) |

**Combined footprint: 9,066 stars · 1,596,851 npm downloads/week**

## Contributions

### Merged

- **kana-dojo [#6309](https://github.com/lingdojo/kana-dojo/pull/6309)** — Content contribution. Merged 2026-02-27. Closed issue [#6305](https://github.com/lingdojo/kana-dojo/issues/6305).

### Open

- **grafana [#119212](https://github.com/grafana/grafana/pull/119212)** — Remove external Google Fonts loading and external logo URL from email templates; replace with inline SVG data URI. Privacy/security hardening for self-hosted Grafana instances.
- **jquery-modal #315** — Render `closeText` as plain text instead of HTML; modernize ESC-key handling
- **jquery-modal #316** — Scope AJAX callbacks to originating modal instance to prevent race conditions
- **jquery-modal #317** — Idempotent initialization guard for duplicate imports (issue #309)
- **jquery-tablesort #49** — Sync `tablesort.$th` with active sorted header (fixes #40, #45)
- **python-shell #320** — Fix `runString()` temp-path generation with regression test
- **rrule #664** — Fix `WeekdayStr[]` serialization for `BYDAY` output (issue #648)
- **react-hexgrid #123** — Add tests for `GridGenerator.ring()` and `GridGenerator.spiral()`

## Use It Yourself

This repo is a reusable template. To track your own set of packages:

1. Fork this repository
2. Edit the target list in `scripts/update-ecosystem-status.ps1`
3. Update PR numbers in `scripts/update-evidence.ps1` and `scripts/update-review-sla.ps1`
4. Push — the GitHub Actions workflow runs every 6 hours automatically
5. Your `evidence/` directory will populate with JSON + Markdown snapshots

```powershell
# Run locally
./scripts/update-evidence.ps1
./scripts/update-ecosystem-status.ps1
./scripts/update-review-sla.ps1
./scripts/update-action-queue.ps1
```

## 📊 Live Data

- [Ecosystem status (JSON)](./evidence/ecosystem-status.json)
- [Ecosystem status (Markdown)](./evidence/ecosystem-status.md)
- [Action queue](./evidence/action-queue.md)
- Per-repo SLA: [grafana](./evidence/review-sla-grafana.md) · [kana-dojo](./evidence/review-sla-kana-dojo.md) · [jquery-modal](./evidence/review-sla.md) · [tablesort](./evidence/review-sla-tablesort.md) · [python-shell](./evidence/review-sla-python-shell.md) · [rrule](./evidence/review-sla-rrule.md) · [react-hexgrid](./evidence/review-sla-react-hexgrid.md)

## Project Structure

```
scripts/
  update-evidence.ps1          # Per-repo PR tracking + npm stats
  update-ecosystem-status.ps1  # Multi-repo aggregated health snapshot
  update-review-sla.ps1        # Review response time monitoring
  update-action-queue.ps1      # Prioritized action queue from SLA data
evidence/
  *.json                       # Machine-readable snapshots
  *.md                         # Human-readable reports
.github/workflows/
  evidence-daily.yml           # Cron: every 6 hours
```

## License

MIT

---

*Auto-updated every 6 hours by [GitHub Actions](https://github.com/dusan-maintains/oss-maintenance-log/actions). Star the repo to follow live maintenance activity.*
