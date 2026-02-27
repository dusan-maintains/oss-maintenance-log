# Contributing

Thanks for improving this OSS maintenance log.

## What Contributions Are Useful

- Improve evidence scripts (`scripts/*.ps1`) while keeping outputs stable.
- Fix documentation clarity and broken links.
- Add small, verifiable improvements to automation or reporting.

## Local Validation

Run from repository root:

```powershell
./scripts/update-evidence.ps1
./scripts/update-ecosystem-status.ps1
./scripts/update-review-sla.ps1
./scripts/update-action-queue.ps1
```

If your environment has a broken proxy/TLS setup, clear proxy variables for the session before running scripts.

## Pull Request Rules

- Keep diffs small and focused.
- Do not edit evidence metrics manually; regenerate via scripts.
- Include exact links for any new tracked PRs or commits.
- Preserve machine-readable outputs in `evidence/*.json`.

## Reuse

This repository is MIT-licensed. You can fork it and adapt targets for your own OSS maintenance tracking workflow.
