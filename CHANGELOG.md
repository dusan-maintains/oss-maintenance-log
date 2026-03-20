# Changelog

All notable changes to this project will be documented here.

## [1.5.0] — 2026-03-20

### Added
- **GitHub GraphQL batching**: All GitHub API calls now use a single GraphQL query instead of N individual REST calls. Scanning 30 packages makes 1 GitHub request instead of 30. Massive rate-limit savings.
- **`lib/github-graphql.js`**: New module — builds aliased GraphQL queries, fetches stargazers, forks, issues, push date, archive status, and license in one round-trip. Batches up to 50 repos per query.
- **Smart concurrency**: With `GITHUB_TOKEN`, default concurrency increases from 2 to 5 (npm fetches are the bottleneck now, not GitHub).
- Tests: 71 passing (up from 68) — new suite for GraphQL module with unit + integration tests

### Changed
- `api.js`: Refactored into 3-phase architecture — Phase 1 (npm metadata, parallel batches) → Phase 2 (GitHub GraphQL batch) → Phase 3 (score + enrich). Falls back to REST if no token.
- `getNpmInfo()` extracted from `getPackageInfo()` for npm-only fetches when GraphQL handles GitHub data
- `mergeGithubData()` extracted as shared merge function for both REST and GraphQL paths
- User-Agent bumped to `oss-health-scan/1.4` in GraphQL client

### Performance
- 8 packages: 3 seconds with GraphQL (was ~12s with REST)
- 30 packages: 1 GitHub API call (was 30)
- Rate limit usage: ~97% reduction for GitHub API

## [1.4.0] — 2026-03-20

### Added
- **`--unused` flag**: Detect dependencies not imported in any source file. Scans `.js/.ts/.jsx/.tsx/.mjs/.cjs/.vue/.svelte` files recursively. Knows about config-only deps (eslint, babel, jest, etc.) to avoid false positives.
- **ETag caching**: GitHub API responses are cached with ETags. Second scan of the same packages uses conditional requests (304 Not Modified) — doesn't count toward rate limit. ~60% fewer API calls on repeated scans.
- **Unused deps module** (`lib/unused.js`): Static analysis of `require()`/`import`/`import()` across all source files
- **New export**: `require('oss-health-scan/unused')`
- Tests: 68 passing (up from 55)
- GitHub Topics: 20 topics for discoverability

### Changed
- `fetcher.js`: ETag cache with 1h TTL, disk persistence in `os.tmpdir()`
- User-Agent bumped to `oss-health-scan/1.3`

## [1.3.0] — 2026-03-20

### Added
- **`--outdated` flag**: Shows installed vs latest versions with libyear metric and drift classification (major/minor/patch)
- **`--vulns` flag**: Checks OSV.dev for known vulnerabilities (CVEs) per package — zero dependencies
- **OSV.dev integration** (`lib/osv.js`): POST to `api.osv.dev/v1/query`, CVSS v3 severity parsing, vulnerability summarization
- **Libyear metric** (`lib/outdated.js`): Reads `package-lock.json` (v6 + v7+), parses semver, estimates version age
- **Enhanced terminal report**: Per-package drift info, vulnerability counts with severity breakdown
- **Enhanced Markdown output**: Conditional Installed/Latest/Drift columns, CVE column with severity counts
- **New exports**: `require('oss-health-scan/outdated')`, `require('oss-health-scan/osv')`
- Tests: 55 passing (up from 31) — new suites for outdated, OSV, severity parsing

### Changed
- `scanPackages()` API accepts `outdated`, `vulns`, `dir` options
- JSON output includes `outdatedSummary` when `--outdated` is used
- Terminal report shows outdated/vulnerability summary in header
- Description updated to reflect CVE + outdated capabilities

## [1.2.0] — 2026-03-20

### Added
- **Programmatic API**: `scanPackages()` and `scanPackageJson()` — import and use in custom tools, dashboards, Slack bots
- **SARIF output**: `--sarif` flag generates SARIF 2.1.0 for GitHub Code Scanning / Advanced Security
- **Config file support**: `.oss-health-scanrc.json` or `package.json` `"oss-health-scan"` field for persistent options
- **License risk scoring**: GPL/UNLICENSED/missing license penalized in risk dimension
- **Action outputs**: `action.yml` now exports `health-json`, `manifest-json`, `critical-count`, `avg-health`
- Tests: 31 passing (up from 15) — new suites for API module, SARIF output, license scoring

### Changed
- Scoring: stricter issue ratio curve (20 issues now penalizes significantly, was ignored before)
- Scoring: license risk factor added to risk dimension (15% weight)
- Action: consolidated to single step with PowerShell outputs instead of 4 separate steps
- CLI refactored: `getPackageInfo` extracted to `api.js` for reuse

### Fixed
- **429 rate limiting**: `fetcher.js` now retries on HTTP 429 with `Retry-After` header support
- Package version synced to 1.2.0

## [1.1.0] — 2026-03-17

### Added
- CLI: retry logic with exponential backoff for transient HTTP failures
- CLI: comprehensive unit tests for scoring algorithm (15 test cases)
- CI: CLI unit tests and smoke test in validate workflow
- GitHub Action (`action.yml`) as composite reusable action for other repos

### Fixed
- CLI: correct rate-limit header extraction from GitHub API responses
- CLI: handle missing/null fields gracefully in score computation

### Changed
- Bumped `actions/checkout` from v4 to v6 in all workflows
- README reframed for honest contribution scope (removed inflated aggregate claims)
- CONTRIBUTING.md updated to reference config-driven workflow

## [1.0.0] — 2026-02-27

### Added
- Automated health tracking for 7 OSS packages across the tracked ecosystem
- GitHub Actions workflow running every 6 hours — zero manual updates required
- Machine-readable JSON evidence snapshots in `evidence/`
- Human-readable Markdown SLA reports per tracked repo
- PR SLA monitoring: flags when maintainer feedback exceeds configurable threshold
- Prioritized action queue (`evidence/action-queue.md`) generated from SLA data
- Auto-updating README stats (stars, downloads, open PRs) from live evidence data
- Live dashboard at https://dusan-maintains.github.io/oss-maintenance-log
- GitHub Pages site with real-time data from evidence JSON
- Open Graph + Twitter card meta tags for rich link previews
- Reusable as a template repo — fork and update 3 scripts to track your own packages
- Issue templates: suggest-package, pr-status-update
- GitHub Discussions enabled
- SECURITY.md
- action.yml for GitHub Actions Marketplace

### Tracked packages at launch
- `kylefox/jquery-modal` — 3 open PRs (#315, #316, #317)
- `kylefox/jquery-tablesort` — 1 open PR (#49)
- `extrabacon/python-shell` — 1 open PR (#320)
- `jkbrzt/rrule` — 1 open PR (#664)
- `Hellenic/react-hexgrid` — 1 open PR (#123)
- `lingdojo/kana-dojo` — 1 merged PR (#6309)
- `grafana/grafana` — 1 open PR (#119212)
