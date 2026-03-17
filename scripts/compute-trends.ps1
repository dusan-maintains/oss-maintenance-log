param(
  [string]$OutDir = "evidence",
  [string]$ConfigPath = "config/tracked-repositories.json",
  [int]$MaxHistoryDays = 180
)

. (Join-Path $PSScriptRoot "common.ps1")
Ensure-Directory -Path $OutDir

$healthPath = Join-Path $OutDir "health-scores.json"
if (-not (Test-Path $healthPath)) {
  Write-Warning "health-scores.json not found. Run compute-health-scores.ps1 first."
  exit 1
}

$health = Get-Content $healthPath -Raw | ConvertFrom-Json
$historyPath = Join-Path $OutDir "health-history.json"

# Load existing history
$history = @()
if (Test-Path $historyPath) {
  $history = @(Get-Content $historyPath -Raw | ConvertFrom-Json)
}

# Append current snapshot
$entry = [PSCustomObject]@{
  timestamp = $health.generated_at_utc
  average = $health.summary.average_health_score
  scores = @($health.scores | ForEach-Object {
    [PSCustomObject]@{
      repo = "$($_.owner)/$($_.repo)"
      score = $_.health_score
      risk = $_.risk_level
    }
  })
}

$history += $entry

# Prune older than MaxHistoryDays
$cutoff = ([DateTimeOffset]::UtcNow).AddDays(-$MaxHistoryDays).UtcDateTime
$history = @($history | Where-Object {
  try {
    $ts = (Convert-StringToUtcDateTime -Value $_.timestamp)
    return $ts -ge $cutoff
  } catch {
    return $true
  }
})

# Compute trends (compare latest to 7-day-ago and 30-day-ago snapshots)
$now = ([DateTimeOffset]::UtcNow).UtcDateTime
$trends = @()

$repos = @($entry.scores | ForEach-Object { $_.repo }) | Sort-Object -Unique

foreach ($repo in $repos) {
  $currentScore = ($entry.scores | Where-Object { $_.repo -eq $repo } | Select-Object -First 1).score

  $score7d = $null
  $score30d = $null

  foreach ($h in ($history | Sort-Object { Convert-StringToUtcDateTime -Value $_.timestamp } -Descending)) {
    $ts = Convert-StringToUtcDateTime -Value $h.timestamp
    $daysAgo = ($now - $ts).TotalDays

    $repoEntry = $h.scores | Where-Object { $_.repo -eq $repo } | Select-Object -First 1
    if (-not $repoEntry) { continue }

    if ($null -eq $score7d -and $daysAgo -ge 6.5) {
      $score7d = $repoEntry.score
    }
    if ($null -eq $score30d -and $daysAgo -ge 29.5) {
      $score30d = $repoEntry.score
    }
  }

  $delta7d = if ($null -ne $score7d) { $currentScore - $score7d } else { $null }
  $delta30d = if ($null -ne $score30d) { $currentScore - $score30d } else { $null }

  $trendDir = "stable"
  if ($null -ne $delta7d) {
    if ($delta7d -gt 5) { $trendDir = "improving" }
    elseif ($delta7d -lt -5) { $trendDir = "declining" }
  }

  $trends += [PSCustomObject]@{
    repo = $repo
    current_score = $currentScore
    score_7d_ago = $score7d
    score_30d_ago = $score30d
    delta_7d = $delta7d
    delta_30d = $delta30d
    trend = $trendDir
  }
}

# Write history
Set-Content -Path $historyPath -Value ($history | ConvertTo-Json -Depth 10) -Encoding utf8

# Write trends
$trendOutput = [PSCustomObject]@{
  generated_at_utc = $now.ToString("yyyy-MM-ddTHH:mm:ssZ")
  data_points = $history.Count
  oldest_snapshot = if ($history.Count -gt 0) { $history[0].timestamp } else { $null }
  trends = $trends
}

$trendPath = Join-Path $OutDir "health-trends.json"
Set-Content -Path $trendPath -Value ($trendOutput | ConvertTo-Json -Depth 10) -Encoding utf8

# Write trend markdown
$lines = @()
$lines += "# Health Score Trends"
$lines += ""
$lines += "Generated: $($trendOutput.generated_at_utc)"
$lines += "Data points: $($trendOutput.data_points) (oldest: $($trendOutput.oldest_snapshot))"
$lines += ""
$lines += "| Package | Current | 7d ago | Δ 7d | 30d ago | Δ 30d | Trend |"
$lines += "|---|---|---|---|---|---|---|"

foreach ($t in ($trends | Sort-Object current_score)) {
  $icon = switch ($t.trend) {
    "improving" { "📈" }
    "declining" { "📉" }
    "stable"    { "➡️" }
  }
  $d7 = if ($null -ne $t.delta_7d) { "{0:+0.0;-0.0;0}" -f $t.delta_7d } else { "—" }
  $d30 = if ($null -ne $t.delta_30d) { "{0:+0.0;-0.0;0}" -f $t.delta_30d } else { "—" }
  $s7 = if ($null -ne $t.score_7d_ago) { $t.score_7d_ago } else { "—" }
  $s30 = if ($null -ne $t.score_30d_ago) { $t.score_30d_ago } else { "—" }
  $lines += "| $($t.repo) | **$($t.current_score)** | $s7 | $d7 | $s30 | $d30 | $icon $($t.trend) |"
}

$mdPath = Join-Path $OutDir "health-trends.md"
Set-Content -Path $mdPath -Value ($lines -join "`r`n") -Encoding utf8

Write-Host "Updated:"
Write-Host " - $historyPath ($($history.Count) data points)"
Write-Host " - $trendPath"
Write-Host " - $mdPath"
