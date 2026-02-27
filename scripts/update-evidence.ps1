param(
  [string]$Owner = "kylefox",
  [string]$Repo = "jquery-modal",
  [string]$PackageName = "jquery-modal",
  [int[]]$PrNumbers = @(315, 316, 317),
  [string]$OutDir = "evidence",
  [int]$KeepSnapshots = 45
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

function Get-JsonWithFallback {
  param(
    [string]$Uri,
    [hashtable]$Headers
  )

  try {
    return Invoke-RestMethod -Uri $Uri -Headers $Headers
  } catch {
    $pythonCmd = if (Get-Command python -ErrorAction SilentlyContinue) { "python" } elseif (Get-Command python3 -ErrorAction SilentlyContinue) { "python3" } else { $null }
    if (-not $pythonCmd) {
      throw
    }

    $prevHttpProxy = $env:HTTP_PROXY
    $prevHttpsProxy = $env:HTTPS_PROXY
    $prevAllProxy = $env:ALL_PROXY
    $prevGitHttpProxy = $env:GIT_HTTP_PROXY
    $prevGitHttpsProxy = $env:GIT_HTTPS_PROXY
    try {
      $env:HTTP_PROXY = ""
      $env:HTTPS_PROXY = ""
      $env:ALL_PROXY = ""
      $env:GIT_HTTP_PROXY = ""
      $env:GIT_HTTPS_PROXY = ""
      $env:REQ_URL = $Uri
      $env:REQ_HEADERS_JSON = ($Headers | ConvertTo-Json -Compress)
      $json = @'
import json
import os
import urllib.request

url = os.environ["REQ_URL"]
headers = json.loads(os.environ.get("REQ_HEADERS_JSON", "{}"))
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, timeout=30) as resp:
    print(resp.read().decode("utf-8"))
'@ | & $pythonCmd -
      return ($json | ConvertFrom-Json)
    } finally {
      $env:HTTP_PROXY = $prevHttpProxy
      $env:HTTPS_PROXY = $prevHttpsProxy
      $env:ALL_PROXY = $prevAllProxy
      $env:GIT_HTTP_PROXY = $prevGitHttpProxy
      $env:GIT_HTTPS_PROXY = $prevGitHttpsProxy
      Remove-Item Env:REQ_URL -ErrorAction SilentlyContinue
      Remove-Item Env:REQ_HEADERS_JSON -ErrorAction SilentlyContinue
    }
  }
}

function Get-GitHubJson {
  param(
    [string]$Uri
  )

  return Get-JsonWithFallback -Uri $Uri -Headers (New-GitHubHeaders)
}

function Get-Json {
  param(
    [string]$Uri
  )

  return Get-JsonWithFallback -Uri $Uri -Headers @{ "User-Agent" = "dusan-maintains-oss-log" }
}

if (!(Test-Path $OutDir)) {
  New-Item -ItemType Directory -Path $OutDir | Out-Null
}

$repoMeta = Get-GitHubJson -Uri "https://api.github.com/repos/$Owner/$Repo"
$npmMeta = Get-Json -Uri "https://api.npmjs.org/downloads/point/last-week/$PackageName"

$prs = @()
foreach ($n in $PrNumbers) {
  $pr = Get-GitHubJson -Uri "https://api.github.com/repos/$Owner/$Repo/pulls/$n"
  $prs += [PSCustomObject]@{
    number = $pr.number
    title = $pr.title
    state = $pr.state
    html_url = $pr.html_url
    head_label = $pr.head.label
    head_sha = $pr.head.sha
    base_ref = $pr.base.ref
    draft = $pr.draft
    mergeable_state = $pr.mergeable_state
    updated_at = $pr.updated_at
    created_at = $pr.created_at
    merged_at = $pr.merged_at
    comments = $pr.comments
    review_comments = $pr.review_comments
    commits = $pr.commits
    additions = $pr.additions
    deletions = $pr.deletions
    changed_files = $pr.changed_files
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

$snapshots = Get-ChildItem -Path $OutDir -Filter "status-*.json" | Sort-Object LastWriteTime -Descending
if ($snapshots.Count -gt $KeepSnapshots) {
  $toDelete = $snapshots | Select-Object -Skip $KeepSnapshots
  foreach ($file in $toDelete) {
    Remove-Item -Path $file.FullName -Force
  }
  Write-Host "Pruned $($toDelete.Count) old snapshot(s)."
}

Write-Host "Updated:"
Write-Host " - $latest"
Write-Host " - $snap"
