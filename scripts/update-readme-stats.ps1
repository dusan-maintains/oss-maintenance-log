param(
  [string]$EcoJson = "evidence/ecosystem-status.json",
  [string]$ReadmePath = "README.md"
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $EcoJson)) {
  Write-Host "ecosystem-status.json not found, skipping README update."
  exit 0
}

$eco = Get-Content $EcoJson -Raw | ConvertFrom-Json
$s = $eco.summary

# Format numbers
function Format-Num([int]$n) {
  if ($n -ge 1000000) { return "$([math]::Round($n/1000000,1))M" }
  if ($n -ge 1000)    { return "$([math]::Round($n/1000,1))k" }
  return "$n"
}

$stars     = Format-Num $s.total_stars
$downloads = Format-Num $s.total_npm_downloads_last_week
$packages  = $s.tracked_projects
$openPrs   = $s.tracked_prs_open
$date      = ([string]$eco.generated_at_utc).Substring(0,10)

$readme = Get-Content $ReadmePath -Raw

# Update tagline
$readme = $readme -replace '(?<=<!-- TAGLINE:START -->).*?(?=<!-- TAGLINE:END -->)',
  "One maintainer. $packages packages. **$downloads npm downloads/week** kept alive."

# Update stats line
$readme = $readme -replace '(?<=<!-- STATS:START -->).*?(?=<!-- STATS:END -->)',
  "$stars stars · $downloads npm downloads/week"

# Update badge URLs (shields.io dynamic badges)
$readme = $readme -replace 'packages%20tracked-\d+-blue', "packages%20tracked-$packages-blue"
$readme = $readme -replace 'upstream%20PRs-\d+%20open-orange', "upstream%20PRs-$openPrs%20open-orange"

# Update the tracked projects table header date note
$readme = $readme -replace '\*Auto-generated snapshot — last updated \d{4}-\d{2}-\d{2} UTC\*',
  "*Auto-generated snapshot — last updated $date UTC*"

Set-Content -Path $ReadmePath -Value $readme -Encoding utf8 -NoNewline
Write-Host "README stats updated: $packages packages, $stars stars, $downloads npm/week, $openPrs open PRs"
