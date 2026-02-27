# OSS Maintenance Log

Public, verifiable record of open-source maintenance activity.

[![Evidence Daily Update](https://github.com/dusan-maintains/oss-maintenance-log/actions/workflows/evidence-daily.yml/badge.svg)](https://github.com/dusan-maintains/oss-maintenance-log/actions/workflows/evidence-daily.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

## What This Repository Does
- Stores public evidence of maintenance work (forks, branches, commits, PRs, review response speed).
- Tracks maintainer-needed OSS packages where small fixes reduce downstream break risk.
- Provides machine-readable snapshots that can be audited without private context.

## How Others Can Use This Repo
This repository is intentionally reusable as a template for maintainers.

1. Fork this repository.
2. Update tracked repositories and PR numbers in:
   - `scripts/update-evidence.ps1`
   - `scripts/update-ecosystem-status.ps1`
   - `scripts/update-review-sla.ps1`
3. Run scripts locally once to generate your initial `evidence/*` snapshot.
4. Keep `.github/workflows/evidence-daily.yml` enabled for unattended updates.
5. Share your public `README.md` + `evidence/*` links in applications or maintainer outreach.

The license is MIT, so teams can freely reuse and adapt the workflow.

## Current Scope
- Track A: [`kylefox/jquery-modal`](https://github.com/kylefox/jquery-modal) (`Maintainers Wanted` in README)
- Track B: [`kylefox/jquery-tablesort`](https://github.com/kylefox/jquery-tablesort) (`Maintainers Wanted` in README)
- Track C: [`extrabacon/python-shell`](https://github.com/extrabacon/python-shell) (maintainer-gap signal in issues)
- Track D: [`jkbrzt/rrule`](https://github.com/jkbrzt/rrule) (high-impact package with open maintenance backlog)
- Track E: [`Hellenic/react-hexgrid`](https://github.com/Hellenic/react-hexgrid) (maintainer-needed signal in issues)
- Active forks:
  - [`dusan-maintains/jquery-modal`](https://github.com/dusan-maintains/jquery-modal)
  - [`dusan-maintains/jquery-tablesort`](https://github.com/dusan-maintains/jquery-tablesort)
  - [`dusan-maintains/python-shell`](https://github.com/dusan-maintains/python-shell)
  - [`dusan-maintains/rrule`](https://github.com/dusan-maintains/rrule)
  - [`dusan-maintains/react-hexgrid`](https://github.com/dusan-maintains/react-hexgrid)

## Live Snapshot (2026-02-27 UTC)
- `jquery-modal`: 2,614 stars, 24,399 npm weekly downloads
- `jquery-tablesort`: 258 stars, 1,667 npm weekly downloads
- `python-shell`: 2,163 stars, 194,847 npm weekly downloads
- `rrule`: 3,681 stars, 1,374,236 npm weekly downloads
- `react-hexgrid`: 350 stars, 1,702 npm weekly downloads
- Combined footprint under active maintenance: 9,066 stars, 1,596,851 npm weekly downloads
- Open upstream PRs from this account: 7 (`#315`, `#316`, `#317`, `#49`, `#320`, `#664`, `#123`)
- Latest machine-readable status: [`evidence/latest-status.json`](./evidence/latest-status.json)
- Latest ecosystem status: [`evidence/ecosystem-status.json`](./evidence/ecosystem-status.json)
- Latest SLA reports:
  - [`evidence/review-sla.md`](./evidence/review-sla.md) (`jquery-modal`)
  - [`evidence/review-sla-tablesort.md`](./evidence/review-sla-tablesort.md) (`jquery-tablesort`)
  - [`evidence/review-sla-python-shell.md`](./evidence/review-sla-python-shell.md) (`python-shell`)
  - [`evidence/review-sla-rrule.md`](./evidence/review-sla-rrule.md) (`rrule`)
  - [`evidence/review-sla-react-hexgrid.md`](./evidence/review-sla-react-hexgrid.md) (`react-hexgrid`)
- Latest unattended response queue: [`evidence/action-queue.md`](./evidence/action-queue.md)

## Contribution Evidence
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

## Priority Radar (Researched 2026-02-27)
| Project | Signals | Why It Is Strong | Next Patch Type |
|---|---|---|---|
| [`gpodder/mygpo`](https://github.com/gpodder/mygpo) | 301 stars, active 2025 updates | Maintained service dependency surface | Small reliability/docs patch |
| [`stefanjudis/grunt-phantomas`](https://github.com/stefanjudis/grunt-phantomas) | 282 stars, legacy tooling use | Maintainer-gap profile package | Toolchain/docs maintenance patch |
| [`0sir1ss/Carbon`](https://github.com/0sir1ss/Carbon) | 101 stars, small Python codebase | Fast turnaround for compatibility maintenance | Python 3.12 compatibility + CLI polish |

## Operations
1. Keep PR response SLA under 24 hours.
2. Keep changes scoped and backward-compatible.
3. Prefer issue-linked fixes with explicit test plan and compatibility notes.
4. Keep evidence machine-readable and updated daily.

## Repo Index
- [Claude application draft](./claude-for-oss-application.md)
- [Exact form-fill values](./claude-for-oss-form-fill.md)
- [7-day approval plan](./7-day-approval-plan.md)
- [Maintainer reply templates](./maintainer-reply-templates.md)
- [Post-submit checklist](./post-submit-approval-checklist.md)
- [Target repo radar](./target-repo-radar.md)
- [Contributing guide](./CONTRIBUTING.md)
- [MIT license](./LICENSE)
- [Evidence updater](./scripts/update-evidence.ps1)
- [Ecosystem status updater](./scripts/update-ecosystem-status.ps1)
- [Action queue updater](./scripts/update-action-queue.ps1)
