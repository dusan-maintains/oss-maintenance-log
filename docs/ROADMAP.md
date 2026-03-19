# Roadmap

## Completed

### Rate-Limit Resilience (partial)
- ✅ 403 errors now fall through to Python fallback (bypasses proxy/rate-limit)
- ✅ CLI retry logic with exponential backoff for transient failures
- Remaining: ETag caching, request-budget telemetry, GraphQL batching

### Freshness UX (partial)
- ✅ README STATS line includes last refresh date from manifest
- ✅ Manifest tracks all pipeline steps including health scores, trends, alerts
- Remaining: per-repo freshness badges, stale-data warnings on dashboard

### Pipeline Consolidation
- ✅ Full pipeline in single orchestrator (ecosystem → snapshots → SLA → health scores → trends → alerts → manifest → README)
- ✅ All steps tracked in manifest with success/failed/skipped status
- ✅ README fully auto-generated from data (TRACKED_PROJECTS, CONTRIBUTIONS_MERGED, CONTRIBUTIONS_OPEN)
- ✅ Workflow simplified to single orchestrator call + commit

### CI Improvements
- ✅ Pester tests added to validate workflow
- ✅ CLI unit tests and smoke test in CI
- ✅ Structural validation (config, markers, scripts, docs)

## Next High-Impact Engineering Moves

### 1. ETag Caching and Request Efficiency

Current bottleneck: every refresh makes ~30 GitHub API calls (7 repos × 4 endpoints + PR details). Most data doesn't change between runs.

Best next steps:

- store ETags from GitHub API responses alongside evidence files
- send `If-None-Match` headers to skip unchanged data (304 responses don't count toward rate limit)
- reduce API calls by ~60% for stable repositories

### 2. Schema Contracts

Current gap: outputs are validated structurally by scripts and markers, but not by formal JSON schemas.

Best next steps:

- add JSON Schema for each output family (ecosystem-status, health-scores, manifest)
- validate generated evidence in CI before commit
- keep backward compatibility explicit with schema versioning

### 3. Dashboard Freshness

Current gap: dashboard consumes evidence JSON but doesn't surface staleness or partial-failure state.

Best next steps:

- consume manifest.json to show per-repo freshness status
- add visual indicators for stale data (>12h since last refresh)
- expose failing steps and link to manifest details

### 4. GraphQL Migration

Current state: all GitHub API calls use REST v3. Each PR requires a separate API call.

Best next steps:

- batch repository metadata + PR details in a single GraphQL query per repo
- reduce total API calls from ~30 to ~7 (one per repo)
- materially improve rate-limit headroom

## What Not To Prioritize

- more tracked repositories before request-efficiency work (each repo adds ~4 API calls)
- cosmetic README changes that don't improve trust or reuse
- new features before the existing pipeline has ETag caching
