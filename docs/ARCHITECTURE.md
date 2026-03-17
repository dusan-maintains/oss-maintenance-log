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

1. Load tracked repositories from the config.
2. Generate `evidence/ecosystem-status.json` and `.md`.
3. Generate per-repository detailed snapshots.
4. Generate per-repository review SLA reports.
5. Generate the cross-repo action queue.
6. Write a refresh manifest with global and per-repository status.
7. Regenerate marker-based sections in `README.md`.

## Automation

- `.github/workflows/evidence-daily.yml`
  Scheduled refresh every 6 hours.
- `.github/workflows/validate.yml`
  Validation on push and pull request.
- `action.yml`
  Composite action for reuse in other repositories.

## Design Principles

- One source of truth for tracked repositories.
- Regenerate, do not hand-edit, evidence outputs.
- Fail early on structural drift.
- Make freshness and partial-failure behavior explicit.
- Keep root docs short; put durable detail in `docs/`.
