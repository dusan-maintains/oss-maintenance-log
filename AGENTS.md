# OSS Maintenance Log Agent Guide

## Mission

Keep this repository trustworthy as a public evidence system for OSS maintenance work.

## Start Here

- Read [README.md](README.md) for the product overview.
- Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the system layout.
- Read [docs/DATA_MODEL.md](docs/DATA_MODEL.md) before changing JSON outputs.
- Read [docs/OPERATIONS.md](docs/OPERATIONS.md) before changing workflows or refresh commands.
- Read [docs/ROADMAP.md](docs/ROADMAP.md) before proposing large architectural changes.

## Source Of Truth

- Repository targets live in [config/tracked-repositories.json](config/tracked-repositories.json).
- Shared PowerShell helpers live in [scripts/common.ps1](scripts/common.ps1).
- The canonical refresh entrypoint is [scripts/update-all-evidence.ps1](scripts/update-all-evidence.ps1).
- Validation is enforced by [scripts/validate-repo.ps1](scripts/validate-repo.ps1).

## Rules

- Do not add tracked repositories by editing workflows and scripts in parallel. Update the config instead.
- Do not hand-edit `evidence/*.json` or `evidence/*.md`; regenerate them.
- Preserve README marker sections and keep generated content machine-derived.
- Keep root guidance short. Put durable detail in `docs/`.
- Prefer focused diffs that improve correctness, reproducibility, or operator trust.
