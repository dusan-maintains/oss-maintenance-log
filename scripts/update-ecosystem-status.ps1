param(
  [string]$OutDir = "evidence"
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function New-GitHubHeaders {
  $headers = @{ "User-Agent" = "dusan-maintains-oss-log" }
  if ($env:GITHUB_TOKEN) {
    $headers["Authorization"] = "Bearer $($env:GITHUB_TOKEN)"
    $headers["X-GitHub-Api-Version"] = "2022-11-28"
  }
  return $headers
}

function Get-GitHubJson {
  param(
    [string]$Uri
  )

  return Invoke-RestMethod -Uri $Uri -Headers (New-GitHubHeaders)
}

function Get-Json {
  param(
    [string]$Uri
  )

  return Invoke-RestMethod -Uri $Uri -Headers @{ "User-Agent" = "dusan-maintains-oss-log" }
}

if (!(Test-Path $OutDir)) {
  New-Item -ItemType Directory -Path $OutDir | Out-Null
}

$targets = @(
  [PSCustomObject]@{
    owner = "kylefox"
    repo = "jquery-modal"
    package = "jquery-modal"
    maintainer_needed_signal = "README Maintainers Wanted"
    tracked_prs = @(315, 316, 317)
  },
  [PSCustomObject]@{
    owner = "kylefox"
    repo = "jquery-tablesort"
    package = "jquery-tablesort"
    maintainer_needed_signal = "README Maintainers Wanted"
    tracked_prs = @(49)
  },
  [PSCustomObject]@{
    owner = "extrabacon"
    repo = "python-shell"
    package = "python-shell"
    maintainer_needed_signal = "Issue #290: Looking for maintainer"
    tracked_prs = @(320)
  }
)

$projects = @()
$trackedPrs = @()
$totalStars = 0
$totalForks = 0
$totalDownloads = 0

foreach ($t in $targets) {
  $repoMeta = Get-GitHubJson -Uri "https://api.github.com/repos/$($t.owner)/$($t.repo)"
  $npmMeta = Get-Json -Uri "https://api.npmjs.org/downloads/point/last-week/$($t.package)"

  $prItems = @()
  foreach ($n in $t.tracked_prs) {
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
    npm_downloads_last_week = $npmMeta.downloads
    npm_start = $npmMeta.start
    npm_end = $npmMeta.end
    maintainer_needed_signal = $t.maintainer_needed_signal
    tracked_pr_numbers = $t.tracked_prs
    tracked_prs_open = $openCount
    tracked_pr_details = $prItems
  }

  $trackedPrs += $prItems
  $totalStars += [int]$repoMeta.stargazers_count
  $totalForks += [int]$repoMeta.forks_count
  $totalDownloads += [int]$npmMeta.downloads
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
$lines += "| Project | Stars | Forks | npm weekly | Tracked PRs | Open tracked PRs |"
$lines += "|---|---|---|---|---|---|"

foreach ($p in $projects) {
  $prCount = ($p.tracked_pr_numbers | Measure-Object).Count
  $lines += "| [$($p.owner)/$($p.repo)]($($p.repo_url)) | $($p.stars) | $($p.forks) | $($p.npm_downloads_last_week) | $prCount | $($p.tracked_prs_open) |"
}

$mdPath = Join-Path $OutDir "ecosystem-status.md"
Set-Content -Path $mdPath -Value ($lines -join "`r`n") -Encoding utf8

Write-Host "Updated:"
Write-Host " - $jsonPath"
Write-Host " - $mdPath"
