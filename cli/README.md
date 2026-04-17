# oss-health-scan

[![npm](https://img.shields.io/npm/v/oss-health-scan?color=cb3837&label=npm)](https://www.npmjs.com/package/oss-health-scan)
[![node](https://img.shields.io/node/v/oss-health-scan.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-blueviolet.svg)](#zero-dependencies)

> Scan your `package.json` for abandoned, unmaintained, or unhealthy npm dependencies. Health score 0–100 per package. Outdated-version (libyear) tracking. CVE lookup via OSV.dev. Zero runtime dependencies.

`npm audit` finds CVEs. **`oss-health-scan` finds abandoned packages, outdated versions, known CVEs, and unused dependencies — in one command.**

---

## Install / Run

```bash
# Run without installing
npx oss-health-scan

# Global install
npm install -g oss-health-scan
oss-health-scan

# Project dev-dependency
npm install --save-dev oss-health-scan
npx oss-health-scan
```

Requires **Node.js 18+**.

---

## Quick Examples

```bash
# Scan your project's package.json (production dependencies)
npx oss-health-scan

# Include devDependencies
npx oss-health-scan --dev

# Scan specific packages without a package.json
npx oss-health-scan lodash moment request express

# Only show unhealthy packages (score < 60)
npx oss-health-scan --threshold 60

# Show outdated versions with libyear drift metric
npx oss-health-scan --outdated

# Check known CVEs via OSV.dev
npx oss-health-scan --vulns

# Detect unused dependencies (static import analysis)
npx oss-health-scan --unused

# Machine-readable JSON output
npx oss-health-scan --json

# SARIF 2.1.0 output for GitHub Code Scanning
npx oss-health-scan --sarif > health.sarif

# Markdown table for PR comments
npx oss-health-scan --markdown

# Sort by risk, name, downloads, or score
npx oss-health-scan --sort risk
```

---

## Output

```
  OSS Health Scan Results
  ──────────────────────────────────────────────────
  Scanned: 4 packages
  Average health: 72.5/100
  ● Critical: 0  ● Warning: 1  ● Healthy: 3

   🟡 WARNING
  moment                              ██████████░░░░░░░░░░ 50.8/100  last push 582d ago  25.8M/wk

   🟢 HEALTHY
  react                               ████████████████░░░░ 80.9/100  81.0M/wk
  lodash                              ████████████████░░░░ 79.6/100  102.7M/wk
  express                             ████████████████░░░░ 78.8/100  71.7M/wk
```

Exit codes:

| Code | Meaning |
|------|---------|
| `0` | All packages passed the threshold |
| `1` | At least one package is below the threshold (critical finding) |
| `2` | Scan failed to complete — config error or unrecoverable API failure |

---

## What It Scores

Each package gets a **weighted health score (0–100)**:

| Dimension | Weight | Signals |
|-----------|--------|---------|
| **Maintenance** | 40% | Last push recency (exponential decay), last npm publish, open-issues-to-resolution ratio |
| **Community** | 25% | GitHub stars (log-scaled), fork count |
| **Popularity** | 20% | npm downloads per week (log-scaled) |
| **Risk** | 15% | Inactivity penalty, issue backlog, stale publish cadence, license risk (GPL/UNLICENSED/missing) |

### Instant flags

- **DEPRECATED** packages → automatic score of `5/100` regardless of other signals
- **ARCHIVED** repositories → automatic score of `8/100` regardless of other signals
- **No public repository** → flagged separately, not scored

### Risk-level bucketing

| Score range | Level | Meaning |
|-------------|-------|---------|
| 0–29 | 🔴 Critical | Deprecated, archived, or severely neglected. Replacement strongly recommended. |
| 30–59 | 🟡 Warning | Maintenance gap. Fine for now, flag for review. |
| 60–79 | 🟢 Healthy | Normal maintenance cadence. No action. |
| 80–100 | 🟢 Excellent | Active, popular, well-maintained. No action. |

---

## Flag Reference

### `--outdated`

Reads your `package-lock.json` (both v6 and v7+ formats), compares installed versions to latest published, and emits a **libyear** metric per package — a floating-point number representing the cumulative "years of drift" across your dependency tree. Lower is better.

```
express   installed: 4.18.2   latest: 5.1.0   drift: major   libyear: 0.8
lodash    installed: 4.17.21  latest: 4.17.21 drift: —        libyear: 0.0
```

### `--vulns`

Queries the [OSV.dev](https://osv.dev) vulnerability database for each package. Zero-dependency HTTPS client. Reports CVE count, CVSS 3.1 severity distribution (critical / high / medium / low), and summaries.

```
react-hexgrid   CVEs: 0
rrule           CVEs: 1 medium
```

### `--unused`

Static analysis of `require()`, `import`, and `import()` statements across `.js / .ts / .jsx / .tsx / .mjs / .cjs / .vue / .svelte` files. Reports dependencies declared in `package.json` but not imported anywhere in source. Respects a built-in allowlist of config-only deps (`eslint`, `babel`, `jest`, `vitest`, `prettier`, etc.) to suppress false positives.

### `--sarif`

Emits SARIF 2.1.0 formatted output suitable for direct upload to GitHub Code Scanning via the `github/codeql-action/upload-sarif` action. Critical/warning findings show in the repository's **Security** tab with per-file annotations.

### `--markdown`

Markdown table output — paste into PR comments, Slack summaries, or status docs. Includes conditional columns (installed-vs-latest only shown when `--outdated` is set; CVE column only shown when `--vulns` is set).

### `--threshold <n>`

Exit with code `1` if any package scores below `n`. Default threshold varies per mode:

| Mode | Default threshold | Rationale |
|------|-------------------|-----------|
| Interactive terminal | — | No filtering, show everything |
| `--json` / `--sarif` | 30 | Fail CI on critical only |
| `--dev` | 30 | devDependencies less critical |

### `--sort <field>`

Sort the output by: `score` (default: ascending — unhealthiest first), `name`, `downloads`, or `risk`.

---

## Programmatic API

```javascript
const {
  scanPackages,
  scanPackageJson,
  getPackageInfo
} = require('oss-health-scan');

// Scan specific packages
const { results, summary } = await scanPackages(['react', 'lodash', 'moment'], {
  vulns: true,
  outdated: true
});

for (const r of results) {
  console.log(`${r.name}: ${r.health_score}/100 [${r.risk_level}]`);
  if (r.vulnerabilities?.length) {
    console.log(`  ${r.vulnerabilities.length} known CVEs`);
  }
}

console.log(`Average health: ${summary.avgScore}`);
console.log(`Critical: ${summary.criticalCount}`);

// Scan a project's package.json
const { results: projectResults } = await scanPackageJson('/path/to/project', {
  dev: true,
  unused: true
});
```

Submodule exports for specific engines:

```javascript
const { computeHealthScore } = require('oss-health-scan/scoring');
const { buildSarif } = require('oss-health-scan/sarif');
const { checkOutdated } = require('oss-health-scan/outdated');
const { queryOsv } = require('oss-health-scan/osv');
const { findUnused } = require('oss-health-scan/unused');
```

---

## Config File

Ship per-project defaults in `package.json` or `.oss-health-scanrc.json`:

```json
{
  "oss-health-scan": {
    "threshold": 40,
    "exclude": ["moment", "left-pad"],
    "dev": true,
    "vulns": true,
    "outdated": true,
    "sort": "risk"
  }
}
```

CLI flags always override config-file values.

---

## CI Integration

### Basic dependency health check

```yaml
# .github/workflows/health-check.yml
name: Dependency Health Check
on:
  schedule:
    - cron: "0 9 * * 1"  # Every Monday 9am UTC
  pull_request:

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npx oss-health-scan --threshold 30
```

### With GitHub Code Scanning (SARIF upload)

```yaml
jobs:
  sarif:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npx oss-health-scan --sarif --vulns --outdated > health.sarif
      - uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: health.sarif
```

### Post-scan PR comment

```yaml
- name: Scan
  run: npx oss-health-scan --markdown > scan.md
- uses: actions/github-script@v7
  with:
    script: |
      const fs = require('fs');
      const body = fs.readFileSync('scan.md', 'utf8');
      await github.rest.issues.createComment({
        ...context.repo,
        issue_number: context.issue.number,
        body: `## Dependency Health\n\n${body}`
      });
```

### Fail fast on critical CVEs

```yaml
- run: npx oss-health-scan --vulns --threshold 30 --json > scan.json
- run: |
    CRITICAL=$(jq '[.results[] | select(.vulnerabilities[]?.severity == "CRITICAL")] | length' scan.json)
    if [ "$CRITICAL" -gt 0 ]; then
      echo "::error::Found $CRITICAL critical CVE(s)"
      exit 1
    fi
```

---

## Environment

| Variable | Purpose |
|----------|---------|
| `GITHUB_TOKEN` | Raises GitHub API rate limit from 60/hr to 5000/hr. Recommended even for local runs. |
| `OSV_API_URL` | Override OSV.dev endpoint (for testing / on-prem mirrors). |
| `NPM_REGISTRY_URL` | Override npm registry endpoint (e.g. private registry). |
| `NO_COLOR` | Disable ANSI colors in terminal output. |

---

## Performance

| Package count | No token | With `GITHUB_TOKEN` |
|---------------|----------|---------------------|
| 8 packages | ~12s | **~3s** (GraphQL batching) |
| 30 packages | ~45s | **~5s** |
| 100 packages | ~2m30s | **~15s** |

- **GraphQL batching**: With a token, all GitHub repo metadata fetches in a single GraphQL query (up to 50 repos per query)
- **ETag caching**: Repeated scans of the same packages use conditional requests — 304 responses don't count toward rate limits (~60% fewer calls on re-scans)
- **Concurrent fetching**: npm metadata fetched in parallel batches with retry + 429 handling
- **Early exit**: `--threshold` with an exit-on-first-critical flag is in the roadmap

---

## Zero Dependencies

This tool has **zero runtime npm dependencies**. It uses only Node.js built-in modules:

- `https`, `http` — API clients
- `fs`, `path` — file operations
- `os` — platform detection for temp files, etag cache
- `url` — URL parsing for config overrides

This is intentional. A dependency health scanner that ships 40 transitive dependencies cannot credibly audit its own tree. The scanner must hold itself to the standard it applies to everyone else.

Dev dependencies (test harness only) are managed under Dependabot and not shipped to npm consumers.

---

## Tests

```bash
cd cli
npm test
```

71+ unit and integration tests covering:

- Scoring algorithm (fresh, stale, deprecated, archived cases)
- libyear drift metric across lockfile v6 and v7+
- SARIF 2.1.0 output structure
- OSV.dev response parsing and CVSS severity extraction
- Unused-dependency detection with config-only allowlist
- GraphQL query builder and response merging
- Fetcher retry / 429 handling / ETag cache behavior
- CLI argument parsing and flag interaction
- JSON + Markdown output formatting

---

## Part of OSS Maintenance Log

This CLI is part of the [oss-maintenance-log](https://github.com/dusan-maintains/oss-maintenance-log) project — an automated OSS health monitoring system that applies the same scoring engine to a curated set of abandoned-but-critical npm packages and publishes 6-hour-cadence evidence snapshots. See the [live dashboard](https://dusan-maintains.github.io/oss-maintenance-log) for the real-world output.

---

## License

MIT — see `LICENSE` at the repository root.

## Contributing

PRs welcome. See `CONTRIBUTING.md` and `SECURITY.md` at the repository root. Priorities:

- Keep runtime dependencies at zero
- Preserve backward compatibility for the programmatic API
- Maintain test coverage on any new code paths
- Document new flags and config fields in this README

## Disclaimer

Health scores are heuristic signals, not authoritative judgments. A package with a low score may still be safe for your use case; a package with a high score may still harbor undiscovered issues. Use this tool as one input to your dependency decisions, not the only one.
