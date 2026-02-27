param(
  [string]$Owner = "kylefox",
  [string]$Repo = "jquery-modal",
  [string]$PackageName = "jquery-modal",
  [int[]]$PrNumbers = @(315, 316, 317),
  [string]$OutDir = "evidence"
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Get-Json {
  param(
    [string]$Uri
  )

  $headers = @{ "User-Agent" = "dusan-maintains-oss-log" }
  return Invoke-RestMethod -Uri $Uri -Headers $headers
}

if (!(Test-Path $OutDir)) {
  New-Item -ItemType Directory -Path $OutDir | Out-Null
}

$repoMeta = Get-Json -Uri "https://api.github.com/repos/$Owner/$Repo"
$npmMeta = Get-Json -Uri "https://api.npmjs.org/downloads/point/last-week/$PackageName"

$prs = @()
foreach ($n in $PrNumbers) {
  $pr = Get-Json -Uri "https://api.github.com/repos/$Owner/$Repo/pulls/$n"
  $prs += [PSCustomObject]@{
    number = $pr.number
    title = $pr.title
    state = $pr.state
    html_url = $pr.html_url
    mergeable_state = $pr.mergeable_state
    updated_at = $pr.updated_at
    comments = $pr.comments
    review_comments = $pr.review_comments
    commits = $pr.commits
  }
}

$snapshot = [PSCustomObject]@{
  generated_at_utc = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  repo = [PSCustomObject]@{
    owner = $Owner
    name = $Repo
    html_url = $repoMeta.html_url
    stars = $repoMeta.stargazers_count
    forks = $repoMeta.forks_count
    open_issues = $repoMeta.open_issues_count
    pushed_at = $repoMeta.pushed_at
  }
  npm = [PSCustomObject]@{
    package = $npmMeta.package
    downloads_last_week = $npmMeta.downloads
    start = $npmMeta.start
    end = $npmMeta.end
  }
  tracked_prs = $prs
}

$json = $snapshot | ConvertTo-Json -Depth 8
$latest = Join-Path $OutDir "latest-status.json"
Set-Content -Path $latest -Value $json -Encoding utf8

$stamp = (Get-Date).ToUniversalTime().ToString("yyyyMMdd-HHmmssZ")
$snap = Join-Path $OutDir "status-$stamp.json"
Set-Content -Path $snap -Value $json -Encoding utf8

Write-Host "Updated:"
Write-Host " - $latest"
Write-Host " - $snap"
