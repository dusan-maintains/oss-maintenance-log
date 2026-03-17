param(
  [string]$OutDir = "evidence",
  [string]$ConfigPath = "config/tracked-repositories.json"
)

. (Join-Path $PSScriptRoot "common.ps1")
Ensure-Directory -Path $OutDir

$config = Get-TrackedConfig -ConfigPath $ConfigPath
$targets = $config.repositories

$projects = @()
$trackedPrs = @()
$totalStars = 0
$totalForks = 0
$totalDownloads = 0

foreach ($t in $targets) {
  $repoMeta = Get-GitHubJson -Uri "https://api.github.com/repos/$($t.owner)/$($t.repo)"

  $npmMeta = $null
  $downloads = 0
  if (-not [string]::IsNullOrWhiteSpace($t.package)) {
    $npmMeta = Get-NpmDownloads -Package $t.package
    if ($npmMeta) { $downloads = [int]$npmMeta.downloads }
  }

  $prItems = @()
  foreach ($n in $t.tracked_pr_numbers) {
    $pr = Get-GitHubJson -Uri "https://api.github.com/repos/$($t.owner)/$($t.repo)/pulls/$n"
    $prItems += [PSCustomObject]@{
      number = $pr.number
      title = $pr.title
      state = $pr.state
      html_url = $pr.html_url
      updated_at = $pr.updated_at
      mergeable_state = $pr.mergeable_state
      comments = $pr.comments
      review_comments = $pr.review_comments
      commits = $pr.commits
    }
  }

  $openCount = ($prItems | Where-Object { $_.state -eq "open" } | Measure-Object).Count

  $projects += [PSCustomObject]@{
    owner = $t.owner
    repo = $t.repo
    repo_url = $repoMeta.html_url
    stars = $repoMeta.stargazers_count
    forks = $repoMeta.forks_count
    open_issues = $repoMeta.open_issues_count
    pushed_at = $repoMeta.pushed_at
    package = $t.package
    npm_downloads_last_week = $downloads
    npm_start = if ($npmMeta) { $npmMeta.start } else { $null }
    npm_end = if ($npmMeta) { $npmMeta.end } else { $null }
    maintainer_needed_signal = $t.maintainer_needed_signal
    status_label = $t.status_label
    tracked_pr_numbers = $t.tracked_pr_numbers
    tracked_prs_open = $openCount
    tracked_pr_details = $prItems
  }

  $trackedPrs += $prItems
  $totalStars += [int]$repoMeta.stargazers_count
  $totalForks += [int]$repoMeta.forks_count
  $totalDownloads += $downloads
}

$snapshot = [PSCustomObject]@{
  generated_at_utc = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  summary = [PSCustomObject]@{
    tracked_projects = $projects.Count
    tracked_prs_total = $trackedPrs.Count
    tracked_prs_open = (($trackedPrs | Where-Object { $_.state -eq "open" } | Measure-Object).Count)
    total_stars = $totalStars
    total_forks = $totalForks
    total_npm_downloads_last_week = $totalDownloads
  }
  projects = $projects
}

$jsonPath = Join-Path $OutDir "ecosystem-status.json"
$jsonText = $snapshot | ConvertTo-Json -Depth 10
Set-Content -Path $jsonPath -Value $jsonText -Encoding utf8

$lines = @()
$lines += "# Ecosystem Status"
$lines += ""
$lines += "Generated: $($snapshot.generated_at_utc)"
$lines += ""
$lines += "## Summary"
$lines += "- Tracked projects: $($snapshot.summary.tracked_projects)"
$lines += "- Tracked PRs (total): $($snapshot.summary.tracked_prs_total)"
$lines += "- Tracked PRs (open): $($snapshot.summary.tracked_prs_open)"
$lines += "- Total stars: $($snapshot.summary.total_stars)"
$lines += "- Total forks: $($snapshot.summary.total_forks)"
$lines += "- Total npm downloads last week: $($snapshot.summary.total_npm_downloads_last_week)"
$lines += ""
$lines += "## Projects"
$lines += "| Project | Status | Stars | Forks | npm weekly | Tracked PRs | Open tracked PRs |"
$lines += "|---|---|---|---|---|---|---|"

foreach ($p in $projects) {
  $prCount = ($p.tracked_pr_numbers | Measure-Object).Count
  $lines += "| [$($p.owner)/$($p.repo)]($($p.repo_url)) | $($p.status_label) | $($p.stars) | $($p.forks) | $($p.npm_downloads_last_week) | $prCount | $($p.tracked_prs_open) |"
}

$mdPath = Join-Path $OutDir "ecosystem-status.md"
Set-Content -Path $mdPath -Value ($lines -join "`r`n") -Encoding utf8

Write-Host "Updated:"
Write-Host " - $jsonPath"
Write-Host " - $mdPath"
