# CLAUDE.md

This file is for Claude Code and other agents that read repo-local instructions automatically.

See @README.md for the product overview.
See @docs/ARCHITECTURE.md for the system layout and control flow.
See @docs/DATA_MODEL.md for config and evidence output contracts.
See @docs/OPERATIONS.md for local commands, workflows, and runtime constraints.
See @docs/ROADMAP.md for the next major engineering priorities.

## Working Style

- Treat `config/tracked-repositories.json` as the single source of truth.
- Run `./scripts/validate-repo.ps1` before proposing completion.
- If outputs change, regenerate them through `./scripts/update-all-evidence.ps1`.
- Do not hand-edit generated files in `evidence/`.
- Preserve README marker blocks and keep generated sections data-derived.
- Prefer reliability, auditability, and truthful status reporting over marketing language.
- If GitHub API rate limits or partial refresh failures occur, surface them explicitly instead of masking them.
