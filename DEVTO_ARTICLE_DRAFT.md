---
title: "I built an automated public log to prove I'm actively maintaining OSS packages"
published: false
description: "How I track 1.6M npm downloads/week across 7 abandoned packages using GitHub Actions, machine-readable evidence snapshots, and zero manual updates."
tags: opensource, github, automation, devops
cover_image:
---

There's a problem nobody talks about: thousands of npm packages are effectively abandoned while still serving millions of downloads per week. Maintainers disappear. Issues pile up. Security patches sit unmerged. And downstream teams have no way to know.

I maintain 5 of these packages. The challenge: how do you *prove* ongoing maintenance work to upstream maintainers, grant committees, or employers — without private context?

So I built this: **[oss-maintenance-log](https://github.com/dusan-maintains/oss-maintenance-log)**

## What it does

Every 6 hours, a GitHub Actions workflow:

1. Polls the GitHub API for repo metadata (stars, forks, open issues, last push date)
2. Pulls npm download counts (weekly rolling window)
3. Tracks PR states, mergeability, and diff stats
4. Monitors review SLA — flags when maintainer feedback has gone unanswered
5. Generates a prioritized action queue
6. Commits machine-readable JSON + human-readable Markdown snapshots
7. Auto-updates README stats from the fresh data

Zero manual updates. Everything is public and auditable.

## The packages

Right now I'm tracking:

| Package | npm/week | Why it needs help |
|---|---|---|
| `rrule` | 1,374,236 | 210 open issues, last push 2024 |
| `python-shell` | 194,847 | Maintainer publicly looking for help |
| `jquery-modal` | 24,399 | "Maintainers Wanted" in README |
| `jquery-tablesort` | 1,667 | "Maintainers Wanted" in README |
| `react-hexgrid` | 1,702 | Maintainer-needed signal in issues |

Combined: **1,596,851 npm downloads/week** across packages that would otherwise have no active maintenance.

## Why public?

Accountability. Anyone can verify the work without trusting me. The evidence files are auditable JSON — no private context required.

It also creates a paper trail. When I open a PR to a package with 200 open issues, I can link to the evidence log to show I'm not a drive-by contributor.

## The architecture

```
scripts/
  update-evidence.ps1          # Per-repo PR tracking + npm stats
  update-ecosystem-status.ps1  # Multi-repo aggregated health snapshot
  update-review-sla.ps1        # Review response time monitoring
  update-action-queue.ps1      # Prioritized action queue from SLA data
  update-readme-stats.ps1      # Patches README with fresh numbers
evidence/
  *.json                       # Machine-readable snapshots
  *.md                         # Human-readable reports
.github/workflows/
  evidence-daily.yml           # Cron: every 6 hours
```

PowerShell + GitHub Actions. Runs on both Windows and Linux (pwsh). No external dependencies beyond the GitHub and npm APIs.

## Use it yourself

The repo is marked as a template. Fork it, update the package list in 3 scripts, push — done. MIT licensed.

```powershell
# Run locally
./scripts/update-evidence.ps1
./scripts/update-ecosystem-status.ps1
./scripts/update-review-sla.ps1
./scripts/update-action-queue.ps1
```

Live dashboard: https://dusan-maintains.github.io/oss-maintenance-log

---

Curious if others have built similar systems. Is there prior art I missed? And if you maintain packages that need help — open an issue, I'm actively looking for the next ones to adopt.
