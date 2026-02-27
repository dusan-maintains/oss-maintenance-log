param(
  [string]$Owner = "kylefox",
  [string]$Repo = "jquery-modal",
  [string]$Contributor = "dusan-maintains",
  [int[]]$PrNumbers = @(315, 316, 317),
  [string]$OutDir = "evidence",
  [int]$SlaHours = 24,
  [string]$OutBaseName = "review-sla"
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

function New-Event {
  param(
    [string]$Type,
    [string]$Author,
    [string]$CreatedAt,
    [string]$HtmlUrl
  )

  return [PSCustomObject]@{
    type = $Type
    author = $Author
    created_at = $CreatedAt
    html_url = $HtmlUrl
  }
}

function Convert-ToUtcDateTime {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Value
  )

  return ([DateTimeOffset]::Parse($Value)).UtcDateTime
}

if (!(Test-Path $OutDir)) {
  New-Item -ItemType Directory -Path $OutDir | Out-Null
}

$now = ([DateTimeOffset]::UtcNow).UtcDateTime
$items = @()

foreach ($n in $PrNumbers) {
  $pr = Get-GitHubJson -Uri "https://api.github.com/repos/$Owner/$Repo/pulls/$n"
  $issueComments = Get-GitHubJson -Uri "https://api.github.com/repos/$Owner/$Repo/issues/$n/comments"
  $reviewComments = Get-GitHubJson -Uri "https://api.github.com/repos/$Owner/$Repo/pulls/$n/comments"
  $reviews = Get-GitHubJson -Uri "https://api.github.com/repos/$Owner/$Repo/pulls/$n/reviews"

  $externalEvents = @()
  $ownEvents = @()

  foreach ($c in $issueComments) {
    $ev = New-Event -Type "issue_comment" -Author $c.user.login -CreatedAt $c.created_at -HtmlUrl $c.html_url
    if ($c.user.login -eq $Contributor) { $ownEvents += $ev } else { $externalEvents += $ev }
  }

  foreach ($c in $reviewComments) {
    $ev = New-Event -Type "review_comment" -Author $c.user.login -CreatedAt $c.created_at -HtmlUrl $c.html_url
    if ($c.user.login -eq $Contributor) { $ownEvents += $ev } else { $externalEvents += $ev }
  }

  foreach ($r in $reviews) {
    if ($r.state -eq "PENDING") { continue }
    $ev = New-Event -Type ("review_" + $r.state.ToLower()) -Author $r.user.login -CreatedAt $r.submitted_at -HtmlUrl $r.html_url
    if ($r.user.login -eq $Contributor) { $ownEvents += $ev } else { $externalEvents += $ev }
  }

  $lastExternal = $null
  $lastOwnAfterExternal = $null
  $needsResponse = $false
  $overdue = $false
  $hoursSince = $null

  if ($externalEvents.Count -gt 0) {
    $lastExternal = $externalEvents | Sort-Object { Convert-ToUtcDateTime -Value $_.created_at } -Descending | Select-Object -First 1
    $lastOwnAfterExternal = $ownEvents | Where-Object { (Convert-ToUtcDateTime -Value $_.created_at) -gt (Convert-ToUtcDateTime -Value $lastExternal.created_at) } | Sort-Object { Convert-ToUtcDateTime -Value $_.created_at } -Descending | Select-Object -First 1

    $hoursSince = [Math]::Round(($now - (Convert-ToUtcDateTime -Value $lastExternal.created_at)).TotalHours, 2)
    if ($pr.state -eq "open" -and -not $lastOwnAfterExternal) {
      $needsResponse = $true
      $overdue = $hoursSince -ge $SlaHours
    }
  }

  $items += [PSCustomObject]@{
    pr_number = $pr.number
    pr_title = $pr.title
    pr_state = $pr.state
    pr_url = $pr.html_url
    updated_at = $pr.updated_at
    external_feedback_count = $externalEvents.Count
    own_followups_count = $ownEvents.Count
    last_external_type = if ($lastExternal) { $lastExternal.type } else { $null }
    last_external_author = if ($lastExternal) { $lastExternal.author } else { $null }
    last_external_at = if ($lastExternal) { $lastExternal.created_at } else { $null }
    last_external_url = if ($lastExternal) { $lastExternal.html_url } else { $null }
    last_own_after_external_at = if ($lastOwnAfterExternal) { $lastOwnAfterExternal.created_at } else { $null }
    needs_response = $needsResponse
    hours_since_last_external = $hoursSince
    overdue_sla = $overdue
  }
}

$openItems = $items | Where-Object { $_.pr_state -eq "open" }
$summary = [PSCustomObject]@{
  tracked_open_prs = ($openItems | Measure-Object).Count
  needs_response_count = (($openItems | Where-Object { $_.needs_response }) | Measure-Object).Count
  overdue_count = (($openItems | Where-Object { $_.overdue_sla }) | Measure-Object).Count
}

$report = [PSCustomObject]@{
  generated_at_utc = $now.ToString("yyyy-MM-ddTHH:mm:ssZ")
  repository = "$Owner/$Repo"
  contributor = $Contributor
  sla_hours = $SlaHours
  summary = $summary
  items = $items
}

$jsonPath = Join-Path $OutDir "$OutBaseName.json"
$jsonText = $report | ConvertTo-Json -Depth 8
Set-Content -Path $jsonPath -Value $jsonText -Encoding utf8

$lines = @()
$lines += "# PR Review SLA Status"
$lines += ""
$lines += "Generated: $($report.generated_at_utc)"
$lines += "Repository: ``$($report.repository)``"
$lines += "Contributor: ``$Contributor``"
$lines += "SLA: ``$SlaHours`` hours"
$lines += ""
$lines += "## Summary"
$lines += "- Open tracked PRs: $($summary.tracked_open_prs)"
$lines += "- Needs response: $($summary.needs_response_count)"
$lines += "- Overdue: $($summary.overdue_count)"
$lines += ""
$lines += "## Details"
$lines += "| PR | State | Needs response | Hours since external feedback | Overdue | Last external author | Last external at | Link |"
$lines += "|---|---|---|---|---|---|---|---|"

foreach ($it in ($items | Sort-Object pr_number)) {
  $needs = if ($it.needs_response) { "yes" } else { "no" }
  $od = if ($it.overdue_sla) { "yes" } else { "no" }
  $hours = if ($null -ne $it.hours_since_last_external) { $it.hours_since_last_external } else { "-" }
  $author = if ($it.last_external_author) { $it.last_external_author } else { "-" }
  $at = if ($it.last_external_at) { $it.last_external_at } else { "-" }
  $lines += "| #$($it.pr_number) | $($it.pr_state) | $needs | $hours | $od | $author | $at | [link]($($it.pr_url)) |"
}

$mdPath = Join-Path $OutDir "$OutBaseName.md"
Set-Content -Path $mdPath -Value ($lines -join "`r`n") -Encoding utf8

Write-Host "Updated:"
Write-Host " - $jsonPath"
Write-Host " - $mdPath"
