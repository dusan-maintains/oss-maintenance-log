# Roadmap

## Next High-Impact Engineering Moves

### 1. Rate-Limit Resilience

Current bottleneck: GitHub API polling can hit `403 rate limit exceeded` during local refreshes.

Best next steps:

- add request-budget telemetry
- cache responses with ETags where practical
- reduce duplicate REST calls
- move hot paths to batched GraphQL where it materially cuts request count

### 2. Freshness And Staleness UX

Current state: the repo now writes a run manifest, but the consumer surfaces still only expose a thin layer of freshness state.

Best next steps:

- mark stale and partial data more aggressively in the dashboard
- expose per-repository freshness badges
- link directly from surfaced warnings to failing steps and files

### 3. Schema Contracts

Current gap: outputs are validated structurally by scripts and markers, but not by formal JSON schemas.

Best next steps:

- add JSON Schema for each output family
- validate generated evidence in CI
- keep backward compatibility explicit

### 4. Dashboard and Consumer API

Current gap: dashboard is simple and useful, but not yet a strong consumer surface for downstream tooling.

Best next steps:

- consume a manifest instead of assuming all files are fresh
- add explicit freshness and error badges
- expose per-repo detail pages or drill-down links

## What Not To Prioritize

- more marketing copy before reliability hardening
- new tracked repositories before request-efficiency work
- cosmetic README churn that does not improve trust or reuse
