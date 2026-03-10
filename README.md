# OSS Maintenance Log

> One maintainer. Five abandoned packages. **1,596,851 npm downloads/week** kept alive.

[![Evidence Daily Update](https://github.com/dusan-maintains/oss-maintenance-log/actions/workflows/evidence-daily.yml/badge.svg)](https://github.com/dusan-maintains/oss-maintenance-log/actions/workflows/evidence-daily.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Tracked Packages](https://img.shields.io/badge/packages%20tracked-5-blue.svg)](#-tracked-packages)
[![Weekly npm Downloads](https://img.shields.io/badge/npm%20downloads%2Fweek-1.6M%2B-brightgreen.svg)](#-live-dashboard)
[![Open PRs](https://img.shields.io/badge/upstream%20PRs-7%20open-orange.svg)](#-contribution-evidence)
[![Auto-Updates](https://img.shields.io/badge/auto--updates-every%206h-blueviolet.svg)](https://github.com/dusan-maintains/oss-maintenance-log/actions)

**This repository updates itself every 6 hours via GitHub Actions. No manual edits. Pure machine-readable evidence.**

Packages with no active maintainer still serve millions of developers. This repo tracks, patches, and publicly documents that work — forks, branches, commits, PRs, and SLA response times — all verifiable without private context.

---

[📊 Live Dashboard](#-live-dashboard) · [📦 Tracked Packages](#-tracked-packages) · [📋 Contribution Log](#-contribution-evidence) · [🔧 Use as Template](#-use-as-template) · [🎯 Priority Radar](#-priority-radar) · [📁 Repo Index](#-repo-index)

---

## 📊 Live Dashboard

*Auto-generated snapshot — last updated 2026-02-27 UTC*

| Metric | Value |
|---|---|
| Packages under active maintenance | **5** |
| Combined upstream stars | **9,066** |
| Combined npm weekly downloads | **1,596,851** |
| Open upstream PRs from this account | **7** |
| Merged PRs (external repos) | **1** (kana-dojo) |
| PR response SLA target | **< 24 hours** |
| Evidence update frequency | **Every 6 hours** |

Machine-readable snapshots:
- [`evidence/latest-status.json`](./evidence/latest-status.json) — repo health metrics
- [`evidence/ecosystem-status.json`](./evidence/ecosystem-status.json) — npm + GitHub combined
- [`evidence/action-queue.md`](./evidence/action-queue.md) — unattended response queue

---

## 📦 Tracked Packages

| Package | Stars | npm/week | Status | Fork | SLA Report |
|---|---|---|---|---|---|
| [`kylefox/jquery-modal`](https://github.com/kylefox/jquery-modal) | 2,614 | 24,399 | 🟡 Maintainers Wanted | [fork](https://github.com/dusan-maintains/jquery-modal) | [report](./evidence/review-sla.md) |
| [`kylefox/jquery-tablesort`](https://github.com/kylefox/jquery-tablesort) | 258 | 1,667 | 🟡 Maintainers Wanted | [fork](https://github.com/dusan-maintains/jquery-tablesort) | [report](./evidence/review-sla-tablesort.md) |
| [`extrabacon/python-shell`](https://github.com/extrabacon/python-shell) | 2,163 | 194,847 | 🔴 Maintainer Gap | [fork](https://github.com/dusan-maintains/python-shell) | [report](./evidence/review-sla-python-shell.md) |
| [`jkbrzt/rrule`](https://github.com/jkbrzt/rrule) | 3,681 | 1,374,236 | 🔴 Open Backlog | [fork](https://github.com/dusan-maintains/rrule) | [report](./evidence/review-sla-rrule.md) |
| [`Hellenic/react-hexgrid`](https://github.com/Hellenic/react-hexgrid) | 350 | 1,702 | 🟡 Maintainer Needed | [fork](https://github.com/dusan-maintains/react-hexgrid) | [report](./evidence/review-sla-react-hexgrid.md) |

Additional signal repos:
- [`lingdojo/kana-dojo`](https://github.com/lingdojo/kana-dojo) — [PR #6309](https://github.com/lingdojo/kana-dojo/pull/6309) merged 2026-02-27 · [SLA report](./evidence/review-sla-kana-dojo.md)
- [`grafana/grafana`](https://github.com/grafana/grafana) — [PR #119212](https://github.com/grafana/grafana/pull/119212) opened 2026-02-27 · [SLA report](./evidence/review-sla-grafana.md)

---

## 📋 Contribution Evidence

<details>
<summary><strong>Show full contribution log (25 entries)</strong></summary>

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
| 2026-02-27 | react-hexgrid | Commit | [cbfcc50](https://github.com/dusan-maintains/react-hexgrid/commit/cbfcc50f8be57495170a4908d19920f5ff5f87ca) | Published | Add ring/spiral regression coverage to stabilize generator behavior |
| 2026-02-27 | react-hexgrid | PR | [Hellenic/react-hexgrid#123](https://github.com/Hellenic/react-hexgrid/pull/123) | Open | Raises confidence for generator correctness before future compatibility fixes |

</details>

---

## 🔧 Use as Template

This repo is designed to be reused. Fork it and run your own automated maintenance evidence log in under 10 minutes.

1. **Fork** this repository (or click "Use this template" if enabled)
2. **Update tracked repos** in three scripts:
   - `scripts/update-evidence.ps1`
   - `scripts/update-ecosystem-status.ps1`
   - `scripts/update-review-sla.ps1`
3. **Run once locally** to generate your initial `evidence/*` snapshot
4. **Enable GitHub Actions** — `.github/workflows/evidence-daily.yml` handles all future updates unattended
5. **Share your evidence links** in maintainer applications, PR descriptions, or contributor profiles

MIT licensed. No attribution required.

---

## 🎯 Priority Radar

Next packages under evaluation for adoption:

| Project | Stars | Why | Next Action |
|---|---|---|---|
| [`gpodder/mygpo`](https://github.com/gpodder/mygpo) | 301 | Active 2025 updates, service dependency surface | Small reliability/docs patch |
| [`stefanjudis/grunt-phantomas`](https://github.com/stefanjudis/grunt-phantomas) | 282 | Legacy tooling, maintainer-gap profile | Toolchain/docs maintenance patch |
| [`0sir1ss/Carbon`](https://github.com/0sir1ss/Carbon) | 101 | Small Python codebase, fast turnaround | Python 3.12 compatibility + CLI polish |

---

## ⚙️ Operations

1. PR response SLA: **under 24 hours**
2. Changes: **scoped and backward-compatible only**
3. Fixes: **issue-linked with explicit test plan and compatibility notes**
4. Evidence: **machine-readable, updated every 6 hours automatically**

---

## 📁 Repo Index

| File | Purpose |
|---|---|
| [`evidence/latest-status.json`](./evidence/latest-status.json) | Machine-readable repo health snapshot |
| [`evidence/ecosystem-status.json`](./evidence/ecosystem-status.json) | npm + GitHub combined metrics |
| [`evidence/action-queue.md`](./evidence/action-queue.md) | Unattended response queue |
| [`scripts/update-evidence.ps1`](./scripts/update-evidence.ps1) | Evidence updater |
| [`scripts/update-ecosystem-status.ps1`](./scripts/update-ecosystem-status.ps1) | Ecosystem status updater |
| [`scripts/update-action-queue.ps1`](./scripts/update-action-queue.ps1) | Action queue updater |
| [`scripts/update-review-sla.ps1`](./scripts/update-review-sla.ps1) | SLA report generator |
| [`claude-for-oss-application.md`](./claude-for-oss-application.md) | Application draft |
| [`claude-for-oss-form-fill.md`](./claude-for-oss-form-fill.md) | Exact form-fill values |
| [`7-day-approval-plan.md`](./7-day-approval-plan.md) | 7-day approval plan |
| [`maintainer-reply-templates.md`](./maintainer-reply-templates.md) | Maintainer reply templates |
| [`post-submit-approval-checklist.md`](./post-submit-approval-checklist.md) | Post-submit checklist |
| [`target-repo-radar.md`](./target-repo-radar.md) | Target repo radar |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Contributing guide |
| [`LICENSE`](./LICENSE) | MIT license |
