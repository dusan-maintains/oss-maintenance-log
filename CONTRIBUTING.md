# Contributing

## What This Repo Is

An automated health tracker for open-source packages that need maintenance. The scripts poll GitHub and npm APIs, generate machine-readable snapshots, and commit them on a schedule via GitHub Actions.

## How to Contribute

### Add a new tracked package

1. Add the target definition in `scripts/update-ecosystem-status.ps1`
2. Add a corresponding `update-review-sla.ps1` call in `.github/workflows/evidence-daily.yml`
3. Run all scripts locally to verify output
4. Submit a PR with the script changes + generated evidence files

### Improve the scripts

- Keep outputs backward-compatible
- Maintain the Python fallback in `Get-JsonWithFallback`
- Test on both Windows (PowerShell 5.1+) and Linux (pwsh 7+)

## Running Locally

```powershell
./scripts/update-evidence.ps1
./scripts/update-ecosystem-status.ps1
./scripts/update-review-sla.ps1
./scripts/update-action-queue.ps1
```

Set `GITHUB_TOKEN` for higher API rate limits:

```powershell
$env:GITHUB_TOKEN = "ghp_..."
```

## PR Rules

- Small, focused diffs
- Don't edit `evidence/*.json` manually — regenerate via scripts
- Include links for any new tracked PRs or commits
