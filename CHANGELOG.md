# Changelog

All notable changes to this project will be documented here.

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
