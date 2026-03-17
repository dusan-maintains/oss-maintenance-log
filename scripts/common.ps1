$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Get-RepoRoot {
  return (Split-Path $PSScriptRoot -Parent)
}

function Resolve-RepoPath {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  if ([System.IO.Path]::IsPathRooted($Path)) {
    return $Path
  }

  return (Join-Path (Get-RepoRoot) $Path)
}

function Ensure-Directory {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  if (-not (Test-Path $Path)) {
    New-Item -ItemType Directory -Path $Path | Out-Null
  }
}

function Get-TrackedConfig {
  param(
    [string]$ConfigPath = "config/tracked-repositories.json"
  )

  $resolved = Resolve-RepoPath -Path $ConfigPath
  return (Get-Content $resolved -Raw | ConvertFrom-Json)
}

function Get-TrackedRepository {
  param(
    [Parameter(Mandatory = $true)]
    [psobject]$Config,
    [Parameter(Mandatory = $true)]
    [string]$Owner,
    [Parameter(Mandatory = $true)]
    [string]$Repo
  )

  $matches = @($Config.repositories | Where-Object { $_.owner -eq $Owner -and $_.repo -eq $Repo })
  if ($matches.Count -eq 0) {
    return $null
  }

  return $matches[0]
}

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
    [Parameter(Mandatory = $true)]
    [string]$Uri,
    [Parameter(Mandatory = $true)]
    [hashtable]$Headers
  )

  try {
    return Invoke-RestMethod -Uri $Uri -Headers $Headers
  } catch {
    $statusCode = $null
    if ($_.Exception -and $_.Exception.Response -and $_.Exception.Response.StatusCode) {
      $statusCode = [int]$_.Exception.Response.StatusCode
    }

    if ($null -ne $statusCode -and $statusCode -ge 400 -and $statusCode -lt 500) {
      throw ("HTTP {0} from {1}" -f $statusCode, $Uri)
    }

    $pythonCmd = if (Get-Command python -ErrorAction SilentlyContinue) {
      "python"
    } elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
      "python3"
    } else {
      $null
    }

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
import sys
import urllib.error
import urllib.request

url = os.environ["REQ_URL"]
headers = json.loads(os.environ.get("REQ_HEADERS_JSON", "{}"))
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        print(resp.read().decode("utf-8"))
except urllib.error.HTTPError as exc:
    body = exc.read().decode("utf-8", errors="replace")
    print(f"HTTP error {exc.code} for {url}: {body}", file=sys.stderr)
    sys.exit(1)
'@ | & $pythonCmd -
      if ($LASTEXITCODE -ne 0) {
        throw ("Fallback request failed for {0}" -f $Uri)
      }
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
    [Parameter(Mandatory = $true)]
    [string]$Uri
  )

  return Get-JsonWithFallback -Uri $Uri -Headers (New-GitHubHeaders)
}

function Get-PublicJson {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Uri
  )

  return Get-JsonWithFallback -Uri $Uri -Headers @{ "User-Agent" = "dusan-maintains-oss-log" }
}

function Get-NpmDownloads {
  param(
    [string]$Package
  )

  if ([string]::IsNullOrWhiteSpace($Package)) {
    return $null
  }

  return Get-PublicJson -Uri "https://api.npmjs.org/downloads/point/last-week/$Package"
}

function Convert-StringToUtcDateTime {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Value
  )

  return ([DateTimeOffset]::Parse($Value)).UtcDateTime
}
