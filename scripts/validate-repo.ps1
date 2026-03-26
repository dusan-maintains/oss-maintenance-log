param(
  [string]$ConfigPath = "config/tracked-repositories.json",
  [string]$ReadmePath = "README.md"
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "common.ps1")

$config = Get-TrackedConfig -ConfigPath $ConfigPath
$repositories = @($config.repositories)

if ($repositories.Count -eq 0) {
  throw "tracked-repositories.json must contain at least one repository."
}

$requiredMarkers = @(
  "TAGLINE",
  "RUN_STATUS",
  "STATS",
  "TRACKED_PROJECTS",
  "CONTRIBUTIONS_MERGED",
  "CONTRIBUTIONS_OPEN",
  "LIVE_DATA"
)

$requiredDocs = @(
  "AGENTS.md",
  "CLAUDE.md",
  "docs/ARCHITECTURE.md",
  "docs/DATA_MODEL.md",
  "docs/OPERATIONS.md",
  "docs/ROADMAP.md"
)

$portabilityFailures = @()
Get-ChildItem $PSScriptRoot -Filter "*.ps1" | ForEach-Object {
  $lineNumber = 0
  foreach ($line in (Get-Content $_.FullName)) {
    $lineNumber++
    if ($line -match '[^\x00-\x7F]') {
      $portabilityFailures += "{0}:{1}: contains non-ASCII source text; keep PowerShell scripts ASCII-safe for Windows PowerShell 5.1 compatibility." -f $_.FullName, $lineNumber
    }
  }
}

if ($portabilityFailures.Count -gt 0) {
  throw ("PowerShell portability validation failed:`n{0}" -f ($portabilityFailures -join "`n"))
}

$parseFailures = @()
Get-ChildItem $PSScriptRoot -Filter "*.ps1" | ForEach-Object {
  $parseErrors = $null
  [void][System.Management.Automation.Language.Parser]::ParseFile($_.FullName, [ref]$null, [ref]$parseErrors)
  if ($parseErrors) {
    $parseFailures += $parseErrors | ForEach-Object { "{0}: {1}" -f $_.Extent.File, $_.Message }
  }
}

if ($parseFailures.Count -gt 0) {
  throw ("PowerShell parser validation failed:`n{0}" -f ($parseFailures -join "`n"))
}

$duplicateRepos = $repositories |
  Group-Object { "{0}/{1}" -f $_.owner, $_.repo } |
  Where-Object { $_.Count -gt 1 }
if ($duplicateRepos) {
  throw ("Duplicate repository entries found: {0}" -f (($duplicateRepos | ForEach-Object { $_.Name }) -join ", "))
}

$duplicateSlaNames = $repositories |
  Group-Object review_sla_base_name |
  Where-Object { $_.Count -gt 1 }
if ($duplicateSlaNames) {
  throw ("Duplicate review_sla_base_name entries found: {0}" -f (($duplicateSlaNames | ForEach-Object { $_.Name }) -join ", "))
}

foreach ($repository in $repositories) {
  foreach ($field in @("owner", "repo", "status_label", "review_sla_base_name")) {
    if ([string]::IsNullOrWhiteSpace([string]$repository.$field)) {
      throw ("Missing required field '{0}' for repository entry {1}" -f $field, ($repository | ConvertTo-Json -Compress))
    }
  }

  if (@($repository.tracked_pr_numbers).Count -eq 0) {
    throw ("Repository {0}/{1} must define at least one tracked_pr_number." -f $repository.owner, $repository.repo)
  }
}

$readme = Get-Content (Resolve-RepoPath -Path $ReadmePath) -Raw
foreach ($marker in $requiredMarkers) {
  if ($readme -notmatch [regex]::Escape("<!-- $marker`:START -->") -or $readme -notmatch [regex]::Escape("<!-- $marker`:END -->")) {
    throw ("README marker '{0}' is missing." -f $marker)
  }
}

foreach ($docPath in $requiredDocs) {
  $resolved = Resolve-RepoPath -Path $docPath
  if (-not (Test-Path $resolved)) {
    throw ("Required documentation file is missing: {0}" -f $docPath)
  }
}

$workflowPath = Resolve-RepoPath -Path ".github/workflows/evidence-daily.yml"
$workflowText = Get-Content $workflowPath -Raw
if ($workflowText -notmatch "update-all-evidence\.ps1") {
  throw "evidence-daily.yml must call update-all-evidence.ps1."
}

$actionPath = Resolve-RepoPath -Path "action.yml"
$actionText = Get-Content $actionPath -Raw
if ($actionText -notmatch "update-all-evidence\.ps1") {
  throw "action.yml must call update-all-evidence.ps1."
}
if ($actionText -notmatch "github\.action_path") {
  throw "action.yml must resolve the orchestrator via github.action_path so the reusable action works from consumer repositories."
}
if ($actionText -match "health\.packages") {
  throw "action.yml must not read health.packages; health-scores.json exposes the scores array."
}
if ($actionText -notmatch "health\.scores") {
  throw "action.yml must derive outputs from health.scores."
}
if ($actionText -notmatch "OSS_MAINTENANCE_LOG_WORKSPACE_ROOT") {
  throw "action.yml must set OSS_MAINTENANCE_LOG_WORKSPACE_ROOT for consumer-relative config and README resolution."
}

$validateWorkflowPath = Resolve-RepoPath -Path ".github/workflows/validate.yml"
$validateWorkflowText = Get-Content $validateWorkflowPath -Raw
if ($validateWorkflowText -notmatch "windows-latest") {
  throw "validate.yml must include a windows-latest lane for PowerShell portability checks."
}

Write-Host ("Validated {0} repository definitions." -f $repositories.Count)
Write-Host "PowerShell scripts are ASCII-safe for Windows PowerShell 5.1."
Write-Host "All PowerShell scripts parsed successfully."
Write-Host "README markers, workflow entrypoints, and required docs are aligned."
