# Claude for OSS — Application Notes

## Who I Am

Dusan Hunter. I contribute maintenance patches to open-source projects and build tooling to track ecosystem health for packages that need attention.

## What I Do

1. **Direct contributions** — submitting security, reliability, and compatibility patches to projects across the ecosystem
2. **Maintenance tooling** — I built [oss-maintenance-log](https://github.com/dusan-maintains/oss-maintenance-log), an open-source toolkit that automates health monitoring for tracked packages (GitHub API + npm stats + review SLA tracking + GitHub Actions)

## Track Record

### Active PR in major project

- **[grafana/grafana#119212](https://github.com/grafana/grafana/pull/119212)** (72,000+ stars) — Remove external Google Fonts loading and external logo URL from email templates; replace with inline SVG data URI. Privacy/security hardening for self-hosted Grafana instances.

### Merged contributions

- **[lingdojo/kana-dojo#6309](https://github.com/lingdojo/kana-dojo/pull/6309)** (1,657 stars, 846 forks) — Merged 2026-02-27. Closed linked issue #6305.

### Open upstream PRs (awaiting maintainer review)

| Project | Stars | PR | Fix |
|---------|-------|----|-----|
| jquery-modal | 2,614 | [#315](https://github.com/kylefox/jquery-modal/pull/315) | XSS vector in closeText + ESC handling |
| jquery-modal | 2,614 | [#316](https://github.com/kylefox/jquery-modal/pull/316) | AJAX race condition in multi-modal pages |
| jquery-modal | 2,614 | [#317](https://github.com/kylefox/jquery-modal/pull/317) | Idempotent init guard (issue #309) |
| jquery-tablesort | 258 | [#49](https://github.com/kylefox/jquery-tablesort/pull/49) | Stale sorted-column state (issues #40, #45) |
| python-shell | 2,163 | [#320](https://github.com/extrabacon/python-shell/pull/320) | runString() temp-path fix + regression test |
| rrule | 3,681 | [#664](https://github.com/jkbrzt/rrule/pull/664) | WeekdayStr[] serialization for BYDAY (issue #648) |
| react-hexgrid | 350 | [#123](https://github.com/Hellenic/react-hexgrid/pull/123) | Ring/spiral generator test coverage |

## What I Built

[oss-maintenance-log](https://github.com/dusan-maintains/oss-maintenance-log) — MIT-licensed toolkit:

- PowerShell scripts polling GitHub + npm APIs for automated health snapshots
- Review SLA tracker (configurable response time threshold)
- Prioritized action queue aggregated across all tracked repos
- GitHub Actions cron job committing snapshots every 6 hours
- Reusable template — fork, change targets, push

## Why I Am Applying

I don't own a package with 5,000+ stars. I am applying under the exception clause.

I contribute maintenance patches to packages the ecosystem depends on — including grafana (72K+ stars), rrule (3.7K stars, 1.37M weekly npm downloads), python-shell (2.2K stars, 195K weekly downloads), and jquery-modal (2.6K stars). Combined downstream footprint of packages I actively patch: ~1.6M weekly npm downloads, ~82,000 GitHub stars.

Claude Max would directly improve my throughput for regression analysis, issue triage, and producing reviewable patches across unfamiliar codebases.

## Links

- GitHub: [dusan-maintains](https://github.com/dusan-maintains)
- Grafana PR: [grafana#119212](https://github.com/grafana/grafana/pull/119212)
- Merged PR: [kana-dojo#6309](https://github.com/lingdojo/kana-dojo/pull/6309)
- Toolkit: [oss-maintenance-log](https://github.com/dusan-maintains/oss-maintenance-log)
