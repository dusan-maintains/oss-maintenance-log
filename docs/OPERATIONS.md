# Operations

## Local Commands

Validation:

```powershell
./scripts/validate-repo.ps1
```

Full refresh:

```powershell
./scripts/update-all-evidence.ps1
```

## Environment

- `GITHUB_TOKEN`
  Recommended for higher GitHub API rate limits.

## Runtime Constraints

- Unauthenticated or lightly authenticated local runs can hit GitHub API rate limits.
- The current refresh pipeline is polling-based and depends on public GitHub and npm APIs.
- Generated JSON files are written with UTF-8 BOM because they are produced by PowerShell `Set-Content -Encoding utf8`.
- `evidence/manifest.json` is the authoritative run-health file for success, partial success, and failure states.

## Change Workflow

1. Update `config/tracked-repositories.json` or the relevant script/docs files.
2. Run validation.
3. Run the full refresh if outputs or markers changed.
4. Review the generated evidence and README diff.
5. Commit focused changes.

## Do Not

- Do not hand-edit files in `evidence/`.
- Do not add tracked repositories by editing the workflow only.
- Do not claim data freshness that the generated timestamps do not support.
