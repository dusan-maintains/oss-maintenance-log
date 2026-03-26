# Contributing

## What This Repo Is

An automated health tracker for open-source packages that need maintenance. The scripts poll GitHub and npm APIs, generate machine-readable snapshots, and commit them on a schedule via GitHub Actions.

## How to Contribute

### Add a new tracked package

1. Add the repository definition to `config/tracked-repositories.json` — this is the single source of truth
2. Run `./scripts/validate-repo.ps1` to check the config
3. Run `./scripts/update-all-evidence.ps1` to generate evidence files
4. Submit a PR with the config change + generated evidence files

### Improve the scripts

- Keep outputs backward-compatible
- Maintain the Python fallback in `Get-JsonWithFallback`
- Keep PowerShell source ASCII-safe so scripts parse in Windows PowerShell 5.1
- Test on both Windows (PowerShell 5.1+) and Linux (pwsh 7+)

## Running Locally

```powershell
# Validate config and structure
./scripts/validate-repo.ps1

# Full refresh (runs all steps)
./scripts/update-all-evidence.ps1

# Health scores + trends (after evidence refresh)
./scripts/compute-health-scores.ps1
./scripts/compute-trends.ps1
```

Set `GITHUB_TOKEN` for higher API rate limits:

```powershell
$env:GITHUB_TOKEN = "ghp_..."
```

Install Pester 5 locally before running `tests/*.Tests.ps1`:

```powershell
Install-Module -Name Pester -MinimumVersion 5.0 -Force -Scope CurrentUser -SkipPublisherCheck
```

## PR Rules

- Small, focused diffs
- Don't edit `evidence/*.json` manually — regenerate via scripts
- Include links for any new tracked PRs or commits
