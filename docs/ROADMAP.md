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

### Security audit cadence per tracked package
Scheduled Opus-assisted security audits on each of the 5 abandoned-but-critical packages every 90 days. Output: published audit report in `evidence/audits/` with CVE scan, static analysis findings, and remediation PRs drafted against upstream. This converts the current reactive posture (PRs when a specific bug surfaces) into proactive coverage for the full 1.9M weekly-download surface area.

### Downstream dependency graph
Reverse-dependency analysis: for each tracked package, compute and publish the top 100 npm packages that depend on it, weighted by their own download counts. This makes blast radius of abandonment concrete and quantifiable, rather than handwaving "critical infrastructure". New evidence file: `evidence/downstream-impact.json`.

### Supply-chain provenance on evidence snapshots
Sign evidence-commit bundles with Sigstore `cosign` keyless signing on every 6-hour refresh. Publish verification instructions. The evidence log becomes cryptographically attestable rather than "trust the bot". This matters for downstream consumers who want to cite maintenance status in their own compliance reports.

### Per-package automated PR drafter
When a tracked package crosses a health threshold or receives a new CVE match, auto-draft a remediation PR against the upstream repo. The drafter uses the existing GraphQL batching to find affected modules, generates a minimal diff, and files the PR with full disclosure of automation involvement. Gated on maintainer review before auto-submit.

### Public "adopt this package" opt-in endpoint
A simple JSON endpoint other maintainers can POST to in order to add their package to community tracking. Rate-limited, validated against the schema contract, and published on the dashboard with an "adopted on" timestamp. Lowers the contribution barrier from "fork the repo and edit config" to "one API call".

### OpenSSF Scorecard cross-reference
For each tracked package, pull the corresponding OpenSSF Scorecard score and publish side-by-side with the native health score. When the two diverge significantly, surface the specific signal driving the gap in a per-package diagnostic report. Helps distinguish "abandoned but safe" from "abandoned and risky".

### Request-budget telemetry
Finish the rate-limit resilience work: emit per-run telemetry on GitHub API calls consumed, remaining budget, and fallback paths exercised. Surface in `evidence/manifest.json` so operators can detect budget exhaustion before pipeline failures cascade.

### Per-repo freshness badges in README
Extend the manifest-driven freshness dots from the dashboard into the `TRACKED_PROJECTS` README table. A stale repo should visibly mark itself stale in the repo's own README without waiting for dashboard rendering.

### Contributor onboarding playbook
Document the end-to-end flow for a new maintainer to adopt an abandoned package through this tracker: tracking config addition, SLA baseline, first remediation PR, handoff criteria. Lowers the barrier for community contributors to use this as a template for their own maintenance work rather than just watching the dashboard.

### Dashboard: historical health chart per package
Line-chart view over the 180-day health history already stored in `evidence/health-history.json`. Currently the trend delta is surfaced as an arrow; visible history would let a viewer see whether a package is slowly degrading, stable, or recovering.

## What Not To Prioritize

- cosmetic README changes that don't improve trust or reuse
- new features before schema contracts are in place
- integrations with AI models or proprietary APIs in the core refresh pipeline — keep the evidence log deterministic and reproducible from public data sources only
- marketing outreach, sponsorship badges, or "stars please" campaigns — evidence quality is the growth strategy
