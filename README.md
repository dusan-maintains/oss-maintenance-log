# oss-maintenance-log

Automated health tracker for open-source packages that need maintenance attention.

[![Evidence Daily Update](https://github.com/dusan-maintains/oss-maintenance-log/actions/workflows/evidence-daily.yml/badge.svg)](https://github.com/dusan-maintains/oss-maintenance-log/actions/workflows/evidence-daily.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

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

| Project | Stars | Status | My PRs |
|---------|-------|--------|--------|
| [grafana/grafana](https://github.com/grafana/grafana) | 72,000+ | Open | [#119212](https://github.com/grafana/grafana/pull/119212) — remove external font/image loading from email templates |
| [kana-dojo](https://github.com/lingdojo/kana-dojo) | 1,657 | **Merged** | [#6309](https://github.com/lingdojo/kana-dojo/pull/6309) |
| [jquery-modal](https://github.com/kylefox/jquery-modal) | 2,614 | Open | [#315](https://github.com/kylefox/jquery-modal/pull/315), [#316](https://github.com/kylefox/jquery-modal/pull/316), [#317](https://github.com/kylefox/jquery-modal/pull/317) |
| [jquery-tablesort](https://github.com/kylefox/jquery-tablesort) | 258 | Open | [#49](https://github.com/kylefox/jquery-tablesort/pull/49) |
| [python-shell](https://github.com/extrabacon/python-shell) | 2,163 | Open | [#320](https://github.com/extrabacon/python-shell/pull/320) |
| [rrule](https://github.com/jkbrzt/rrule) | 3,681 | Open | [#664](https://github.com/jkbrzt/rrule/pull/664) |
| [react-hexgrid](https://github.com/Hellenic/react-hexgrid) | 350 | Open | [#123](https://github.com/Hellenic/react-hexgrid/pull/123) |

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

## Live Data

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
