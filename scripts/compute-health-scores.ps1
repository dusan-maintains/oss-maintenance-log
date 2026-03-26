param(
  [string]$OutDir = "evidence",
  [string]$ConfigPath = "config/tracked-repositories.json"
)

. (Join-Path $PSScriptRoot "common.ps1")
Ensure-Directory -Path $OutDir

$redCircle = Get-UiGlyph -Name "red-circle"
$yellowCircle = Get-UiGlyph -Name "yellow-circle"
$greenCircle = Get-UiGlyph -Name "green-circle"

# -- Scoring weights ----------------------------------------------
$W_MAINTENANCE = 0.40
$W_COMMUNITY   = 0.25
$W_POPULARITY  = 0.20
$W_RISK        = 0.15

# -- Helper: log-scaled score 0-10 --------------------------------
function Get-LogScore {
  param([double]$Value, [double]$Scale = 1000)
  if ($Value -le 0) { return 0 }
  $raw = [Math]::Log10($Value + 1) / [Math]::Log10($Scale + 1) * 10
  return [Math]::Min([Math]::Round($raw, 2), 10)
}

# -- Helper: linear decay 0-10, higher is better ------------------
function Get-DecayScore {
  param([double]$DaysSinceEvent, [double]$HalfLifeDays = 180)
  if ($DaysSinceEvent -le 0) { return 10 }
  $score = 10 * [Math]::Exp(-0.693 * $DaysSinceEvent / $HalfLifeDays)
  return [Math]::Round([Math]::Max($score, 0), 2)
}

# -- Load ecosystem data ------------------------------------------
$ecoPath = Join-Path $OutDir "ecosystem-status.json"
if (-not (Test-Path $ecoPath)) {
  Write-Warning "ecosystem-status.json not found. Run update-ecosystem-status.ps1 first."
  exit 1
}
$eco = Get-Content $ecoPath -Raw | ConvertFrom-Json
$now = ([DateTimeOffset]::UtcNow).UtcDateTime

# -- Load SLA data ------------------------------------------------
$slaFiles = Get-ChildItem -Path $OutDir -Filter "review-sla*.json" -ErrorAction SilentlyContinue
$slaByRepo = @{}
foreach ($f in $slaFiles) {
  try {
    $sla = Get-Content $f.FullName -Raw | ConvertFrom-Json
    $slaByRepo[$sla.repository] = $sla
  } catch { continue }
}

# -- Compute per-project scores -----------------------------------
$scores = @()
foreach ($p in $eco.projects) {
  $repoKey = "$($p.owner)/$($p.repo)"

  # -- MAINTENANCE (40%) -----------------------------------------
  $daysSincePush = 9999
  if ($p.pushed_at) {
    try {
      $pushDate = Convert-StringToUtcDateTime -Value $p.pushed_at
      $daysSincePush = ($now - $pushDate).TotalDays
    } catch { }
  }
  $pushRecency = Get-DecayScore -DaysSinceEvent $daysSincePush -HalfLifeDays 180

  $openIssues = [int]($p.open_issues)
  $issueRatio = if ($openIssues -gt 0) {
    $raw = 10 - [Math]::Min($openIssues / 20.0 * 10, 10)
    [Math]::Round([Math]::Max($raw, 0), 2)
  } else { 10 }

  $prResponseScore = 10
  $sla = $slaByRepo[$repoKey]
  if ($sla -and $sla.items) {
    $totalPrs = @($sla.items).Count
    $overduePrs = @($sla.items | Where-Object { $_.overdue_sla -eq $true }).Count
    if ($totalPrs -gt 0) {
      $prResponseScore = [Math]::Round((1 - $overduePrs / $totalPrs) * 10, 2)
    }
  }

  $maintenanceScore = ($pushRecency + $issueRatio + $prResponseScore) / 3

  # -- COMMUNITY (25%) -------------------------------------------
  $starsScore = Get-LogScore -Value ([int]$p.stars) -Scale 10000
  $forksScore = Get-LogScore -Value ([int]$p.forks) -Scale 2000
  $communityScore = ($starsScore + $forksScore) / 2

  # -- POPULARITY (20%) ------------------------------------------
  $downloads = [int]($p.npm_downloads_last_week)
  $downloadScore = Get-LogScore -Value $downloads -Scale 1000000
  $popularityScore = $downloadScore

  # -- RISK (15%) - penalty-based --------------------------------
  $riskBase = 10

  # Penalize long inactivity
  if ($daysSincePush -gt 365) { $riskBase -= 4 }
  elseif ($daysSincePush -gt 180) { $riskBase -= 2 }

  # Penalize high open issue count
  if ($openIssues -gt 100) { $riskBase -= 3 }
  elseif ($openIssues -gt 50) { $riskBase -= 1.5 }

  # Penalize unmerged community PRs
  $openTrackedPrs = [int]($p.tracked_prs_open)
  if ($openTrackedPrs -gt 3) { $riskBase -= 2 }
  elseif ($openTrackedPrs -gt 0) { $riskBase -= 0.5 }

  $riskScore = [Math]::Max($riskBase, 0)

  # -- FINAL WEIGHTED SCORE --------------------------------------
  $raw = ($maintenanceScore * $W_MAINTENANCE +
          $communityScore   * $W_COMMUNITY +
          $popularityScore  * $W_POPULARITY +
          $riskScore        * $W_RISK) * 10

  $healthScore = [Math]::Round([Math]::Min([Math]::Max($raw, 0), 100), 1)

  $riskLevel = if ($healthScore -lt 30) { "critical" }
               elseif ($healthScore -lt 60) { "warning" }
               else { "healthy" }

  $scores += [PSCustomObject]@{
    owner = $p.owner
    repo = $p.repo
    repo_url = $p.repo_url
    package = $p.package
    health_score = $healthScore
    risk_level = $riskLevel
    breakdown = [PSCustomObject]@{
      maintenance = [PSCustomObject]@{
        weight = $W_MAINTENANCE
        score = [Math]::Round($maintenanceScore, 2)
        push_recency = $pushRecency
        issue_ratio = $issueRatio
        pr_response = $prResponseScore
      }
      community = [PSCustomObject]@{
        weight = $W_COMMUNITY
        score = [Math]::Round($communityScore, 2)
        stars_score = $starsScore
        forks_score = $forksScore
      }
      popularity = [PSCustomObject]@{
        weight = $W_POPULARITY
        score = [Math]::Round($popularityScore, 2)
        download_score = $downloadScore
        downloads_last_week = $downloads
      }
      risk = [PSCustomObject]@{
        weight = $W_RISK
        score = [Math]::Round($riskScore, 2)
        days_since_push = [Math]::Round($daysSincePush, 0)
        open_issues = $openIssues
        open_tracked_prs = $openTrackedPrs
      }
    }
    stars = [int]$p.stars
    npm_downloads_last_week = $downloads
    status_label = $p.status_label
  }
}

# -- Aggregate ----------------------------------------------------
$avgScore = if ($scores.Count -gt 0) {
  [Math]::Round(($scores | ForEach-Object { $_.health_score } | Measure-Object -Average).Average, 1)
} else { 0 }

$criticalCount = @($scores | Where-Object { $_.risk_level -eq "critical" }).Count
$warningCount = @($scores | Where-Object { $_.risk_level -eq "warning" }).Count
$healthyCount = @($scores | Where-Object { $_.risk_level -eq "healthy" }).Count

$output = [PSCustomObject]@{
  generated_at_utc = $now.ToString("yyyy-MM-ddTHH:mm:ssZ")
  summary = [PSCustomObject]@{
    total_projects = $scores.Count
    average_health_score = $avgScore
    critical = $criticalCount
    warning = $warningCount
    healthy = $healthyCount
  }
  scores = ($scores | Sort-Object health_score)
}

# -- Write JSON ---------------------------------------------------
$jsonPath = Join-Path $OutDir "health-scores.json"
Set-Content -Path $jsonPath -Value ($output | ConvertTo-Json -Depth 10) -Encoding utf8

# -- Write Markdown -----------------------------------------------
$lines = @()
$lines += "# Package Health Scores"
$lines += ""
$lines += "Generated: $($output.generated_at_utc)"
$lines += ""
$lines += "## Summary"
$lines += "- Average health score: **$avgScore / 100**"
$lines += "- Critical: $criticalCount"
$lines += "- Warning: $warningCount"
$lines += "- Healthy: $healthyCount"
$lines += ""
$lines += "## Scores"
$lines += "| Package | Health Score | Risk | Maintenance | Community | Popularity | Downloads/wk | Stars |"
$lines += "|---|---|---|---|---|---|---|---|"

foreach ($s in ($scores | Sort-Object health_score)) {
  $icon = switch ($s.risk_level) {
    "critical" { $redCircle }
    "warning"  { $yellowCircle }
    "healthy"  { $greenCircle }
  }
  $lines += "| [$($s.owner)/$($s.repo)]($($s.repo_url)) | $icon **$($s.health_score)** | $($s.risk_level) | $($s.breakdown.maintenance.score) | $($s.breakdown.community.score) | $($s.breakdown.popularity.score) | $($s.npm_downloads_last_week) | $($s.stars) |"
}

$lines += ""
$lines += "### Scoring Methodology"
$lines += "| Category | Weight | What it measures |"
$lines += "|---|---|---|"
$lines += "| Maintenance | 40% | Push recency, issue-to-resolution ratio, PR review response |"
$lines += "| Community | 25% | Stars (log-scaled), forks |"
$lines += "| Popularity | 20% | npm downloads/week (log-scaled) |"
$lines += "| Risk | 15% | Inactivity penalties, issue backlog, unmerged PRs |"

$mdPath = Join-Path $OutDir "health-scores.md"
Set-Content -Path $mdPath -Value ($lines -join "`r`n") -Encoding utf8

# -- Write SVG badges ---------------------------------------------
$badgeDir = Join-Path $OutDir "badges"
Ensure-Directory -Path $badgeDir

foreach ($s in $scores) {
  $color = switch ($s.risk_level) {
    "critical" { "#e05d44" }
    "warning"  { "#dfb317" }
    "healthy"  { "#44cc11" }
  }
  $label = "$($s.repo)"
  $value = "$($s.health_score)/100"
  $labelWidth = [Math]::Max($label.Length * 6.5 + 10, 50)
  $valueWidth = [Math]::Max($value.Length * 7 + 10, 40)
  $totalWidth = $labelWidth + $valueWidth

  $svg = @"
<svg xmlns="http://www.w3.org/2000/svg" width="$totalWidth" height="20" role="img" aria-label="$label`: $value">
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <clipPath id="r"><rect width="$totalWidth" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="$labelWidth" height="20" fill="#555"/>
    <rect x="$labelWidth" width="$valueWidth" height="20" fill="$color"/>
    <rect width="$totalWidth" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="$([Math]::Round($labelWidth/2))" y="14">$label</text>
    <text x="$([Math]::Round($labelWidth + $valueWidth/2))" y="14">$value</text>
  </g>
</svg>
"@
  $badgePath = Join-Path $badgeDir "health-$($s.repo).svg"
  Set-Content -Path $badgePath -Value $svg -Encoding utf8
}

Write-Host "Updated:"
Write-Host " - $jsonPath"
Write-Host " - $mdPath"
Write-Host " - $badgeDir/ ($(($scores | Measure-Object).Count) badges)"
