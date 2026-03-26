param(
  [string]$EcoJson = "evidence/ecosystem-status.json",
  [string]$HealthJson = "evidence/health-scores.json",
  [string]$ManifestJson = "evidence/manifest.json",
  [string]$ConfigPath = "config/tracked-repositories.json",
  [string]$ReadmePath = "README.md",
  [string]$EvidencePathPrefix = "evidence"
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "common.ps1")

if ([string]::IsNullOrWhiteSpace($EvidencePathPrefix)) {
  $EvidencePathPrefix = "evidence"
}

$EvidencePathPrefix = ($EvidencePathPrefix -replace '\\', '/').Trim().TrimEnd('/')
$EcoJson = Resolve-RepoPath -Path $EcoJson
$HealthJson = Resolve-RepoPath -Path $HealthJson
$ManifestJson = Resolve-RepoPath -Path $ManifestJson
$ReadmePath = Resolve-RepoPath -Path $ReadmePath

if (!(Test-Path $EcoJson)) {
  Write-Host "ecosystem-status.json not found, skipping README update."
  exit 0
}

if (!(Test-Path $ReadmePath)) {
  Write-Host ("{0} not found, skipping README update." -f $ReadmePath)
  exit 0
}

$eco = Get-Content $EcoJson -Raw | ConvertFrom-Json
$s = $eco.summary
$config = Get-TrackedConfig -ConfigPath $ConfigPath
$emDash = Get-UiGlyph -Name "emdash"
$middleDot = Get-UiGlyph -Name "middot"
$check = Get-UiGlyph -Name "check"
$greenCircle = Get-UiGlyph -Name "green-circle"
$yellowCircle = Get-UiGlyph -Name "yellow-circle"
$redCircle = Get-UiGlyph -Name "red-circle"
$chart = Get-UiGlyph -Name "chart"

# Optional data - script works without these on first run
$health = $null
if (Test-Path $HealthJson) {
  $health = Get-Content $HealthJson -Raw | ConvertFrom-Json
}
$manifest = $null
if (Test-Path $ManifestJson) {
  $manifest = Get-Content $ManifestJson -Raw | ConvertFrom-Json
}

# -- Helpers ------------------------------------------------------

function Format-Num([int64]$n) {
  if ($n -ge 1000000) { return "$([math]::Round($n/1000000,1))M" }
  if ($n -ge 1000)    { return "$([math]::Round($n/1000,1))k" }
  return "$n"
}

function Set-InlineMarker([string]$Text, [string]$Marker, [string]$Content) {
  return $Text -replace "(?<=<!-- ${Marker}:START -->).*?(?=<!-- ${Marker}:END -->)", $Content
}

function Set-BlockMarker([string]$Text, [string]$Marker, [string]$Content) {
  $escaped = $Content.Replace('$', '$$')
  $pattern = "(?s)(<!-- ${Marker}:START -->\r?\n).*?(\r?\n<!-- ${Marker}:END -->)"
  return $Text -replace $pattern, "`${1}$escaped`${2}"
}

$stars     = Format-Num $s.total_stars
$downloads = Format-Num $s.total_npm_downloads_last_week
$packages  = $s.tracked_projects
$openPrs   = $s.tracked_prs_open

$readme = [System.IO.File]::ReadAllText($ReadmePath, [System.Text.Encoding]::UTF8)

# -- TAGLINE ------------------------------------------------------

$readme = Set-InlineMarker $readme "TAGLINE" `
  "Contributing to $packages open-source packages $emDash **$downloads npm downloads/week** across tracked ecosystem."

# -- STATS (with freshness from manifest) -------------------------

$statsContent = "$stars stars $middleDot $downloads downloads/week across tracked projects"
if ($manifest -and $manifest.run_completed_at_utc) {
  $refreshDate = Format-InvariantDate -Value (Convert-StringToUtcDateTime -Value ([string]$manifest.run_completed_at_utc))
  $statsContent += " $middleDot refreshed $refreshDate"
}
$readme = Set-InlineMarker $readme "STATS" $statsContent

# -- Badge URLs ---------------------------------------------------

$readme = $readme -replace 'packages%20tracked-\d+-blue', "packages%20tracked-$packages-blue"
$readme = $readme -replace 'upstream%20PRs-\d+%20open-orange', "upstream%20PRs-$openPrs%20open-orange"
$readme = $readme -replace 'tracked%20ecosystem-[^-]+-brightgreen', "tracked%20ecosystem-$downloads%2B-brightgreen"

# -- Auto-snapshot date -------------------------------------------

$date = ([string]$eco.generated_at_utc).Substring(0,10)
$readme = $readme -replace '\*Auto-generated snapshot .* last updated \d{4}-\d{2}-\d{2} UTC\*',
  "*Auto-generated snapshot $emDash last updated $date UTC*"

# -- TRACKED_PROJECTS table ---------------------------------------

$tableLines = @()
$tableLines += "| Project | Stars | npm/week | Status | Health | My PRs |"
$tableLines += "|---------|-------|----------|--------|--------|--------|"

foreach ($repo in $config.repositories) {
  $project = $eco.projects | Where-Object { $_.owner -eq $repo.owner -and $_.repo -eq $repo.repo } | Select-Object -First 1

  $starsFmt = if ($project) { Format-Num ([int64]$project.stars) } else { $emDash }
  $npmFmt = if ($project -and [int64]$project.npm_downloads_last_week -gt 0) {
    Format-Num ([int64]$project.npm_downloads_last_week)
  } else { $emDash }

  $statusText = switch ($repo.status_label) {
    "Merged"              { "$check **Merged**" }
    "Open"                { "$greenCircle Open" }
    "Maintainers Wanted"  { "$yellowCircle Maintainers Wanted" }
    "Maintainer Gap"      { "$redCircle Maintainer Gap" }
    "Open Backlog"        { "$redCircle Open Backlog" }
    "Maintainer Needed"   { "$yellowCircle Maintainer Needed" }
    default               { $repo.status_label }
  }

  $healthBadge = "![health]($EvidencePathPrefix/badges/health-$($repo.repo).svg)"

  $prLinks = @($repo.tracked_pr_numbers | ForEach-Object {
    "[#$_](https://github.com/$($repo.owner)/$($repo.repo)/pull/$_)"
  }) -join ", "

  $repoLink = "[$($repo.owner)/$($repo.repo)](https://github.com/$($repo.owner)/$($repo.repo))"

  $tableLines += "| $repoLink | $starsFmt | $npmFmt | $statusText | $healthBadge | $prLinks |"
}

$readme = Set-BlockMarker $readme "TRACKED_PROJECTS" ($tableLines -join "`n")

# -- CONTRIBUTIONS_MERGED -----------------------------------------

$mergedLines = @()
foreach ($repo in $config.repositories) {
  $project = $eco.projects | Where-Object { $_.owner -eq $repo.owner -and $_.repo -eq $repo.repo } | Select-Object -First 1
  if (-not $project -or -not $project.tracked_pr_details) { continue }

  foreach ($pr in @($project.tracked_pr_details)) {
    $isMerged = ($pr.state -eq "closed" -and $pr.merged_at)
    if (-not $isMerged) { continue }
    $mergeDate = Format-InvariantDate -Value (Convert-StringToUtcDateTime -Value ([string]$pr.merged_at))
    $mergedLines += "- **$($repo.repo) [#$($pr.number)]($($pr.html_url))** $emDash $($pr.title). Merged $mergeDate."
  }
}

if ($mergedLines.Count -eq 0) {
  $mergedLines += "*No merged contributions yet.*"
}

$readme = Set-BlockMarker $readme "CONTRIBUTIONS_MERGED" ($mergedLines -join "`n")

# -- CONTRIBUTIONS_OPEN -------------------------------------------

$openLines = @()
foreach ($repo in $config.repositories) {
  $project = $eco.projects | Where-Object { $_.owner -eq $repo.owner -and $_.repo -eq $repo.repo } | Select-Object -First 1
  if (-not $project -or -not $project.tracked_pr_details) { continue }

  foreach ($pr in @($project.tracked_pr_details)) {
    if ($pr.state -ne "open") { continue }
    $openLines += "- **$($repo.repo) [#$($pr.number)]($($pr.html_url))** $emDash $($pr.title)"
  }
}

if ($openLines.Count -eq 0) {
  $openLines += "*No open contributions.*"
}

$readme = Set-BlockMarker $readme "CONTRIBUTIONS_OPEN" ($openLines -join "`n")

# -- LIVE_DATA ----------------------------------------------------

$liveDataLines = @()
$liveDataLines += "## $chart Live Data"
$liveDataLines += ""
$liveDataLines += "- [$chart Interactive Dashboard](https://dusan-maintains.github.io/oss-maintenance-log) $emDash health scores, charts, action queue"
$liveDataLines += "- [Health Scores](./$EvidencePathPrefix/health-scores.md) $emDash weighted 0-100 per package"
$liveDataLines += "- [Ecosystem Status](./$EvidencePathPrefix/ecosystem-status.md) $emDash aggregated snapshot"
$liveDataLines += "- [Action Queue](./$EvidencePathPrefix/action-queue.md) $emDash prioritized tasks"
$liveDataLines += "- Per-repo SLA: " + (@($config.repositories | ForEach-Object {
  "[{0}](./{1}/{2}.md)" -f $_.repo, $EvidencePathPrefix, $_.review_sla_base_name
}) -join (" {0} " -f $middleDot))

$readme = Set-BlockMarker $readme "LIVE_DATA" ($liveDataLines -join "`n")

# -- Write --------------------------------------------------------

[System.IO.File]::WriteAllText($ReadmePath, $readme, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "README fully regenerated: $packages packages, $stars stars, $downloads npm/week, $openPrs open PRs"
