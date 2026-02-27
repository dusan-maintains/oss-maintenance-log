# OSS Maintenance Log

Public, verifiable record of open-source maintenance activity.

## Current Scope
- Primary project: [`kylefox/jquery-modal`](https://github.com/kylefox/jquery-modal)
- Maintainer context: README includes **Maintainers Wanted**
- Active fork: [`dusan-maintains/jquery-modal`](https://github.com/dusan-maintains/jquery-modal)
- Public evidence source of truth: this repository

## Live Snapshot (2026-02-27 UTC)
- Project metrics: 2,614 stars, 655 forks
- npm weekly downloads (`jquery-modal`): 25,327 (2026-02-19 to 2026-02-25)
- Open PRs from this account to upstream: 3 (`#315`, `#316`, `#317`)
- Latest machine-readable status: [`evidence/latest-status.json`](./evidence/latest-status.json)

## Contribution Evidence
| Date (UTC) | Project | Type | Link | Status | Impact |
|---|---|---|---|---|---|
| 2026-02-27 | jquery-modal | Fork | [dusan-maintains/jquery-modal](https://github.com/dusan-maintains/jquery-modal) | Active | Public maintenance fork created |
| 2026-02-27 | jquery-modal | Branch | [maintenance/first-patch](https://github.com/dusan-maintains/jquery-modal/tree/maintenance/first-patch) | Pushed | PR branch published |
| 2026-02-27 | jquery-modal | Commit | [8b3d55e](https://github.com/dusan-maintains/jquery-modal/commit/8b3d55eb3b3fdf13e962b8865e13c7234cf8ab3c) | Published | closeText safety, ESC handling, docs consistency |
| 2026-02-27 | jquery-modal | PR | [kylefox/jquery-modal#315](https://github.com/kylefox/jquery-modal/pull/315) | Open | Reliability + documentation correctness |
| 2026-02-27 | jquery-modal | Branch | [maintenance/ajax-instance-safety](https://github.com/dusan-maintains/jquery-modal/tree/maintenance/ajax-instance-safety) | Pushed | Independent second maintenance branch |
| 2026-02-27 | jquery-modal | Commit | [4e6fd0f](https://github.com/dusan-maintains/jquery-modal/commit/4e6fd0f85604b0dc71dfd59503a7b66a3fa2df42) | Published | AJAX callback instance safety (race paths) |
| 2026-02-27 | jquery-modal | PR | [kylefox/jquery-modal#316](https://github.com/kylefox/jquery-modal/pull/316) | Open | Concurrency/ownership hardening |
| 2026-02-27 | jquery-modal | Branch | [maintenance/no-double-init](https://github.com/dusan-maintains/jquery-modal/tree/maintenance/no-double-init) | Pushed | Third independent maintenance branch |
| 2026-02-27 | jquery-modal | Commit | [97f9643](https://github.com/dusan-maintains/jquery-modal/commit/97f9643361b2487328f5741b50a8fd5129ab7c9b) | Published | Idempotent init guard for duplicate imports |
| 2026-02-27 | jquery-modal | PR | [kylefox/jquery-modal#317](https://github.com/kylefox/jquery-modal/pull/317) | Open | Issue-driven fix for multiple imports (#309) |

## Operations
1. Keep PR response SLA under 24 hours.
2. Keep changes scoped and backward-compatible.
3. Prefer issue-linked fixes with explicit test plan and compatibility notes.

## Repo Index
- [Claude application draft](./claude-for-oss-application.md)
- [Exact form-fill values](./claude-for-oss-form-fill.md)
- [7-day approval plan](./7-day-approval-plan.md)
- [Maintainer reply templates](./maintainer-reply-templates.md)
- [Post-submit checklist](./post-submit-approval-checklist.md)
- [Automation script](./scripts/update-evidence.ps1)
