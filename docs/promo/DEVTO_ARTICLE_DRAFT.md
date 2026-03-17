---
title: "npm audit catches CVEs. Nothing catches abandoned packages. So I built a scanner."
published: false
description: "A zero-dependency CLI that scans package.json and scores every dependency 0-100 for maintenance health. Plus the full automated monitoring system behind it."
tags: opensource, javascript, node, npm
cover_image:
---

## The problem nobody talks about

Thousands of npm packages are effectively abandoned while serving millions of downloads per week. Maintainers disappear. Issues pile up. Security patches sit unmerged. And `npm audit` won't tell you.

I maintain 7 of these packages — combined 1.4M npm downloads/week. After getting burned by unmaintained transitive dependencies in my own projects, I built a scanner.

## One command

```bash
npx github:dusan-maintains/oss-maintenance-log express lodash moment request
```

```
  OSS Health Scan Results
  ──────────────────────────────────────────────────
  Scanned: 3 packages
  Average health: 40.8/100
  ● Critical: 0  ● Warning: 3  ● Healthy: 0

   🟡 WARNING

  react-hexgrid     ███████░░░░░░░░░░░░░ 35.1/100  last push 594d ago
  jquery-modal      ████████░░░░░░░░░░░░ 40.5/100  last push 699d ago
  rrule             █████████░░░░░░░░░░░ 46.8/100  last push 628d ago
```

## How the scoring works

Each package gets a weighted health score (0–100):

| Dimension | Weight | What it measures |
|-----------|--------|-----------------|
| **Maintenance** | 40% | Last push (exponential decay, 180-day half-life), last npm publish (365-day half-life), open issues ratio |
| **Community** | 25% | Stars and forks (log₁₀ scaled — 100 stars matters more than the difference between 10k and 11k) |
| **Popularity** | 20% | npm weekly downloads (log₁₀ scaled) |
| **Risk** | 15% | Penalty-based: >365 days since push (-4), >100 open issues (-3), >2 years since publish (-2) |

Instant flags: `DEPRECATED` → 5/100, `ARCHIVED` → 8/100.

The algorithm handles edge cases:
- High-download packages with no maintainer score high on Popularity but get crushed on Maintenance and Risk
- Boutique packages with active maintainers score high on Maintenance despite low download counts
- Mega-repos like Grafana score moderately because their massive issue counts penalize the ratio

## Zero dependencies — on purpose

The tool uses only Node.js built-ins (`https`, `fs`, `path`). A dependency health scanner that itself depends on abandoned packages would be... ironic.

## CI integration

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
      - run: npx github:dusan-maintains/oss-maintenance-log --threshold 30
```

Exits with code 1 if any critical packages found — works as a PR gate.

## The full monitoring system

The CLI is part of a bigger project. I also built:

- **Health trend engine** — 180-day rolling history with 7-day and 30-day deltas. Detects packages that are improving or declining.
- **Alert system** — Auto-creates GitHub Issues when packages drop below critical threshold.
- **Review SLA tracker** — Flags when maintainer feedback has gone stale on your PRs.
- **Interactive dashboard** — Dark-mode Chart.js dashboard with health gauges, radar charts, download distributions.

![Dashboard](https://raw.githubusercontent.com/dusan-maintains/oss-maintenance-log/main/docs/dashboard-preview.png)

Everything runs on GitHub Actions every 6 hours. Config-driven — just edit one JSON file with your packages.

**Repo:** [github.com/dusan-maintains/oss-maintenance-log](https://github.com/dusan-maintains/oss-maintenance-log)
**Live dashboard:** [dusan-maintains.github.io/oss-maintenance-log](https://dusan-maintains.github.io/oss-maintenance-log)

---

What tools do you use to monitor dependency health? I'm curious about existing solutions I might have missed.
