# Roadmap

## Completed

### Rate-Limit Resilience
- ✅ 403 errors now fall through to Python fallback (bypasses proxy/rate-limit)
- ✅ CLI retry logic with exponential backoff for transient failures
- ✅ ETag caching with 1h TTL — 304 responses don't count toward rate limit (~60% fewer calls)
- ✅ GraphQL batching — 1 query for up to 50 repos instead of N REST calls (~97% reduction)
- Remaining: request-budget telemetry

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

### 1. Schema Contracts

Current gap: outputs are validated structurally by scripts and markers, but not by formal JSON schemas.

Best next steps:

- add JSON Schema for each output family (ecosystem-status, health-scores, manifest)
- validate generated evidence in CI before commit
- keep backward compatibility explicit with schema versioning

### 2. Dashboard Freshness

Current gap: dashboard consumes evidence JSON but doesn't surface staleness or partial-failure state.

Best next steps:

- consume manifest.json to show per-repo freshness status
- add visual indicators for stale data (>12h since last refresh)
- expose failing steps and link to manifest details

## What Not To Prioritize

- cosmetic README changes that don't improve trust or reuse
- new features before schema contracts are in place
