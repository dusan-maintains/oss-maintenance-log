param(
  [string]$OutDir = "evidence"
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $OutDir)) {
  New-Item -ItemType Directory -Path $OutDir | Out-Null
}

$slaReports = Get-ChildItem -Path $OutDir -Filter "review-sla*.json" -ErrorAction SilentlyContinue
$now = (Get-Date).ToUniversalTime()
$items = @()

foreach ($reportFile in $slaReports) {
  try {
    $report = Get-Content $reportFile.FullName -Raw | ConvertFrom-Json
  } catch {
    continue
  }

  foreach ($it in $report.items) {
    if ($it.pr_state -ne "open") { continue }
    if (-not $it.needs_response) { continue }

    $priority = if ($it.overdue_sla) { "urgent" } else { "normal" }
    $items += [PSCustomObject]@{
      repository = $report.repository
      pr_number = $it.pr_number
      pr_title = $it.pr_title
      pr_url = $it.pr_url
      last_external_author = $it.last_external_author
      last_external_at = $it.last_external_at
      hours_since_last_external = $it.hours_since_last_external
      overdue_sla = $it.overdue_sla
      priority = $priority
      source_report = $reportFile.Name
    }
  }
}

$ordered = $items | Sort-Object @{ Expression = { if ($_.priority -eq "urgent") { 0 } else { 1 } } }, @{ Expression = { [double]($_.hours_since_last_external) }; Descending = $true }

$queue = [PSCustomObject]@{
  generated_at_utc = $now.ToString("yyyy-MM-ddTHH:mm:ssZ")
  open_actions = ($ordered | Measure-Object).Count
  urgent_actions = (($ordered | Where-Object { $_.priority -eq "urgent" } | Measure-Object).Count)
  items = $ordered
}

$jsonPath = Join-Path $OutDir "action-queue.json"
$mdPath = Join-Path $OutDir "action-queue.md"

Set-Content -Path $jsonPath -Value ($queue | ConvertTo-Json -Depth 8) -Encoding utf8

$lines = @()
$lines += "# Action Queue"
$lines += ""
$lines += "Generated: $($queue.generated_at_utc)"
$lines += "- Open actions: $($queue.open_actions)"
$lines += "- Urgent actions: $($queue.urgent_actions)"
$lines += ""

if ($queue.open_actions -eq 0) {
  $lines += "No maintainer replies pending."
} else {
  $lines += "| Priority | Repository | PR | Hours since external feedback | Last author | Last feedback at | Link |"
  $lines += "|---|---|---|---|---|---|---|"

  foreach ($it in $ordered) {
    $hours = if ($null -ne $it.hours_since_last_external) { $it.hours_since_last_external } else { "-" }
    $author = if ($it.last_external_author) { $it.last_external_author } else { "-" }
    $at = if ($it.last_external_at) { $it.last_external_at } else { "-" }
    $lines += "| $($it.priority) | ``$($it.repository)`` | #$($it.pr_number) | $hours | $author | $at | [link]($($it.pr_url)) |"
  }

  $lines += ""
  $lines += "Suggested quick reply template:"
  $lines += ""
  $lines += "> Thanks for the feedback. I reviewed your points and will push a focused update shortly."
}

Set-Content -Path $mdPath -Value ($lines -join "`r`n") -Encoding utf8

Write-Host "Updated:"
Write-Host " - $jsonPath"
Write-Host " - $mdPath"
