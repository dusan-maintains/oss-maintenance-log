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

### Schema Contracts
- ✅ JSON Schema (draft-07) for all evidence output families: ecosystem-status, health-scores, manifest, action-queue
- ✅ Zero-dep Node.js validator (`scripts/validate-evidence.js`) — runs in CI, strips BOM, validates types/required/enum/ranges
- ✅ CI step `validate-evidence` in validate.yml workflow
- ✅ PowerShell single-item quirk documented in action-queue schema (object | array)

### Dashboard Freshness
- ✅ Freshness banner: pipeline status badge (success/partial/failed), relative time, step counts
- ✅ Stale data warning: orange banner when data >12h old with link to Actions
- ✅ Per-repo freshness dots on health cards (green = fresh, yellow = partial, red = failed)
- ✅ Trend arrows on health cards from health-trends.json (↑ improving, → stable, ↓ declining with 7d delta)
- ✅ manifest.json + health-trends.json fetched alongside existing data

## Next High-Impact Engineering Moves

## What Not To Prioritize

- cosmetic README changes that don't improve trust or reuse
- new features before schema contracts are in place
