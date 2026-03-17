# oss-health-scan

Scan your `package.json` for abandoned, unmaintained, or unhealthy npm dependencies. Get a health score (0–100) for every dependency — no signup, no config, zero external dependencies.

## Quick Start

```bash
# Scan current project
npx oss-health-scan

# Scan specific packages
npx oss-health-scan lodash moment request express

# Only show unhealthy packages (score < 60)
npx oss-health-scan --threshold 60

# Include devDependencies
npx oss-health-scan --dev

# JSON output for CI pipelines
npx oss-health-scan --json
```

## What It Checks

Each package gets a **weighted health score (0–100)** based on:

| Factor | Weight | Metrics |
|--------|--------|---------|
| **Maintenance** | 40% | Last push recency, last npm publish, open issues ratio |
| **Community** | 25% | GitHub stars (log-scaled), forks |
| **Popularity** | 20% | npm downloads/week (log-scaled) |
| **Risk** | 15% | Inactivity penalty, issue backlog, stale publish |

### Instant Flags
- **DEPRECATED** packages → automatic score of 5/100
- **ARCHIVED** repos → automatic score of 8/100

## Output

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
```

## CI Integration

```yaml
# .github/workflows/health-check.yml
name: Dependency Health Check
on:
  schedule:
    - cron: "0 9 * * 1"  # Every Monday 9am
  pull_request:

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npx oss-health-scan --threshold 30
        # Exits with code 1 if any critical packages found
```

## Environment

Set `GITHUB_TOKEN` for higher API rate limits (5000/hr vs 60/hr):

```bash
GITHUB_TOKEN=ghp_xxx npx oss-health-scan
```

## Zero Dependencies

This tool has **zero npm dependencies**. It uses only Node.js built-in modules (`https`, `fs`, `path`). This is intentional — a dependency health scanner should not itself be a supply chain risk.

## Part of OSS Maintenance Log

This CLI is part of the [oss-maintenance-log](https://github.com/dusan-maintains/oss-maintenance-log) project — an automated OSS health monitoring system with dashboards, trend tracking, and GitHub Actions integration.

## License

MIT
