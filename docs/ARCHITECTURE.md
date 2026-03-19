# Architecture

## Purpose

OSS Maintenance Log is a public evidence system for open-source maintenance work. It tracks repository health, upstream pull requests, review-response SLA, and a prioritized action queue.

## Control Plane

- `config/tracked-repositories.json`
  Single source of truth for tracked repositories, npm packages, PR numbers, labels, and SLA output names.
- `scripts/common.ps1`
  Shared HTTP, path, config, and time helpers.
- `scripts/update-all-evidence.ps1`
  Primary orchestration entrypoint.
- `scripts/validate-repo.ps1`
  Structural validation for scripts, config, markers, and workflow entrypoints.

## Refresh Flow

Single orchestrator (`update-all-evidence.ps1`) runs the full pipeline:

1. Load tracked repositories from the config.
2. Generate `evidence/ecosystem-status.json` and `.md`.
3. Generate per-repository detailed snapshots.
4. Generate per-repository review SLA reports.
5. Generate the cross-repo action queue.
6. Compute health scores (0–100) with SVG badges.
7. Compute 180-day trends (7d/30d deltas).
8. Check alert thresholds and auto-create GitHub Issues.
9. Write preliminary manifest (so README generator can read freshness data).
10. Regenerate ALL marker-based sections in `README.md`:
    - `TAGLINE` and `STATS` (inline) from ecosystem summary + manifest freshness.
    - `TRACKED_PROJECTS` table from config + ecosystem + health data.
    - `CONTRIBUTIONS_MERGED` from ecosystem PR details (merged_at).
    - `CONTRIBUTIONS_OPEN` from ecosystem PR details (state = open).
    - Badge URLs (tracked packages count, open PRs, ecosystem downloads).
11. Write final manifest including all step results.

Every step is wrapped in `Invoke-RefreshStep` — failures are caught, logged, and tracked in the manifest. Downstream steps check for required inputs and skip gracefully if dependencies failed.

## Automation

- `.github/workflows/evidence-daily.yml`
  Scheduled refresh every 6 hours. Single orchestrator call + commit.
- `.github/workflows/validate.yml`
  Validation on push and PR: config validation, Pester tests, CLI unit tests.
- `.github/workflows/publish-cli.yml`
  Publish CLI to npm on release.
- `action.yml`
  Composite action for reuse in other repositories.

## Design Principles

- One source of truth for tracked repositories.
- Regenerate, do not hand-edit, evidence outputs.
- Fail early on structural drift.
- Make freshness and partial-failure behavior explicit.
- Keep root docs short; put durable detail in `docs/`.
