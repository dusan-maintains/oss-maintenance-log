param(
  [string]$OutDir = "evidence",
  [string]$ConfigPath = "config/tracked-repositories.json"
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "common.ps1")

function New-StepResult {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [Parameter(Mandatory = $true)]
    [string]$Scope,
    [Parameter(Mandatory = $true)]
    [string]$Status,
    [string]$Message = "",
    [string[]]$Outputs = @()
  )

  return [PSCustomObject]@{
    name = $Name
    scope = $Scope
    status = $Status
    message = $Message
    outputs = @($Outputs)
  }
}

function Invoke-RefreshStep {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [Parameter(Mandatory = $true)]
    [string]$Scope,
    [Parameter(Mandatory = $true)]
    [scriptblock]$Action,
    [string[]]$Outputs = @()
  )

  try {
    & $Action
    return (New-StepResult -Name $Name -Scope $Scope -Status "success" -Outputs $Outputs)
  } catch {
    $message = $_.Exception.Message
    Write-Warning ("{0} ({1}) failed: {2}" -f $Name, $Scope, $message)
    return (New-StepResult -Name $Name -Scope $Scope -Status "failed" -Message $message -Outputs $Outputs)
  }
}

function Write-Manifest {
  param(
    [Parameter(Mandatory = $true)]
    [string]$OutDir,
    [Parameter(Mandatory = $true)]
    [psobject]$Config,
    [Parameter(Mandatory = $true)]
    [datetime]$RunStartedAtUtc,
    [Parameter(Mandatory = $true)]
    [psobject[]]$StepResults
  )

  $runCompletedAtUtc = ([DateTimeOffset]::UtcNow).UtcDateTime
  $failedSteps = @($StepResults | Where-Object { $_.status -eq "failed" })
  $skippedSteps = @($StepResults | Where-Object { $_.status -eq "skipped" })
  $successSteps = @($StepResults | Where-Object { $_.status -eq "success" })

  $globalSteps = @($StepResults | Where-Object { $_.scope -eq "global" })
  $repositorySteps = @($StepResults | Where-Object { $_.scope -ne "global" })
  $repositoryStatus = @()

  foreach ($repository in @($Config.repositories)) {
    $scope = "{0}/{1}" -f $repository.owner, $repository.repo
    $repoSteps = @($repositorySteps | Where-Object { $_.scope -eq $scope })
    $repoFailures = @($repoSteps | Where-Object { $_.status -eq "failed" })
    $repoSuccesses = @($repoSteps | Where-Object { $_.status -eq "success" })
    $repoStatus = if ($repoFailures.Count -eq 0 -and $repoSuccesses.Count -gt 0) {
      "fresh"
    } elseif ($repoFailures.Count -gt 0 -and $repoSuccesses.Count -gt 0) {
      "partial"
    } elseif ($repoFailures.Count -gt 0) {
      "failed"
    } else {
      "unknown"
    }

    $repositoryStatus += [PSCustomObject]@{
      repository = $scope
      status = $repoStatus
      latest_snapshot_file = "latest-status-{0}-{1}.json" -f $repository.owner, $repository.repo -replace "[^A-Za-z0-9._/-]", "-"
      review_sla_file = "{0}.json" -f $repository.review_sla_base_name
      steps = $repoSteps
      errors = @($repoFailures | ForEach-Object { $_.message } | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    }
  }

  $freshRepositories = (@($repositoryStatus | Where-Object { $_.status -eq "fresh" })).Count
  $partialRepositories = (@($repositoryStatus | Where-Object { $_.status -eq "partial" })).Count
  $failedRepositories = (@($repositoryStatus | Where-Object { $_.status -eq "failed" })).Count
  $ecosystemStep = @($globalSteps | Where-Object { $_.name -eq "ecosystem_status" } | Select-Object -First 1)

  $overallStatus = if ($failedSteps.Count -eq 0 -and $skippedSteps.Count -eq 0) {
    "success"
  } elseif ($ecosystemStep -and $ecosystemStep.status -eq "failed" -and $freshRepositories -eq 0 -and $partialRepositories -eq 0) {
    "failed"
  } elseif ($successSteps.Count -gt 0) {
    "partial_success"
  } else {
    "failed"
  }

  $manifest = [PSCustomObject]@{
    schema_version = 1
    run_started_at_utc = $RunStartedAtUtc.ToString("yyyy-MM-ddTHH:mm:ssZ")
    run_completed_at_utc = $runCompletedAtUtc.ToString("yyyy-MM-ddTHH:mm:ssZ")
    run_status = $overallStatus
    config_version = $Config.version
    summary = [PSCustomObject]@{
      total_steps = $StepResults.Count
      successful_steps = $successSteps.Count
      failed_steps = $failedSteps.Count
      skipped_steps = $skippedSteps.Count
      tracked_repositories = $Config.repositories.Count
      fresh_repositories = $freshRepositories
      partial_repositories = $partialRepositories
      failed_repositories = $failedRepositories
    }
    global_steps = $globalSteps
    repositories = $repositoryStatus
  }

  $jsonPath = Join-Path $OutDir "manifest.json"
  $mdPath = Join-Path $OutDir "manifest.md"

  Set-Content -Path $jsonPath -Value ($manifest | ConvertTo-Json -Depth 10) -Encoding utf8

  $lines = @()
  $lines += "# Refresh Manifest"
  $lines += ""
  $lines += "- Run status: $($manifest.run_status)"
  $lines += "- Started: $($manifest.run_started_at_utc)"
  $lines += "- Completed: $($manifest.run_completed_at_utc)"
  $lines += "- Total steps: $($manifest.summary.total_steps)"
  $lines += "- Successful steps: $($manifest.summary.successful_steps)"
  $lines += "- Failed steps: $($manifest.summary.failed_steps)"
  $lines += "- Skipped steps: $($manifest.summary.skipped_steps)"
  $lines += "- Fresh repositories: $($manifest.summary.fresh_repositories)"
  $lines += "- Partial repositories: $($manifest.summary.partial_repositories)"
  $lines += "- Failed repositories: $($manifest.summary.failed_repositories)"
  $lines += ""
  $lines += "## Global Steps"
  $lines += "| Step | Status | Message |"
  $lines += "|---|---|---|"
  foreach ($step in $globalSteps) {
    $message = if ([string]::IsNullOrWhiteSpace($step.message)) { "-" } else { $step.message }
    $lines += "| $($step.name) | $($step.status) | $message |"
  }
  $lines += ""
  $lines += "## Repository Status"
  $lines += "| Repository | Status | Errors |"
  $lines += "|---|---|---|"
  foreach ($repository in $repositoryStatus) {
    $errors = if ($repository.errors.Count -gt 0) { ($repository.errors -join "; ") } else { "-" }
    $lines += "| $($repository.repository) | $($repository.status) | $errors |"
  }

  Set-Content -Path $mdPath -Value ($lines -join "`r`n") -Encoding utf8

  Write-Host "Updated:"
  Write-Host " - $jsonPath"
  Write-Host " - $mdPath"

  return $manifest
}

$config = Get-TrackedConfig -ConfigPath $ConfigPath
Ensure-Directory -Path $OutDir

$runStartedAtUtc = ([DateTimeOffset]::UtcNow).UtcDateTime
$stepResults = @()
$ecosystemSucceeded = $false

$stepResults += Invoke-RefreshStep -Name "ecosystem_status" -Scope "global" -Outputs @("ecosystem-status.json", "ecosystem-status.md") -Action {
  & (Join-Path $PSScriptRoot "update-ecosystem-status.ps1") -OutDir $OutDir -ConfigPath $ConfigPath
  $script:ecosystemSucceeded = $true
}

foreach ($repository in @($config.repositories)) {
  $scope = "{0}/{1}" -f $repository.owner, $repository.repo
  $safeName = ("{0}-{1}" -f $repository.owner, $repository.repo) -replace "[^A-Za-z0-9._-]", "-"
  $package = if ($null -ne $repository.package) { [string]$repository.package } else { "" }

  $stepResults += Invoke-RefreshStep -Name "repository_snapshot" -Scope $scope -Outputs @("latest-status-$safeName.json") -Action {
    & (Join-Path $PSScriptRoot "update-evidence.ps1") `
      -Owner $repository.owner `
      -Repo $repository.repo `
      -PackageName $package `
      -PrNumbers @($repository.tracked_pr_numbers) `
      -OutDir $OutDir `
      -KeepSnapshots 45 `
      -LatestFileName ("latest-status-{0}.json" -f $safeName) `
      -SnapshotPrefix ("status-{0}" -f $safeName) `
      -ConfigPath $ConfigPath
  }

  $stepResults += Invoke-RefreshStep -Name "review_sla" -Scope $scope -Outputs @("$($repository.review_sla_base_name).json", "$($repository.review_sla_base_name).md") -Action {
    & (Join-Path $PSScriptRoot "update-review-sla.ps1") `
      -Owner $repository.owner `
      -Repo $repository.repo `
      -Contributor $config.contributor `
      -PrNumbers @($repository.tracked_pr_numbers) `
      -OutDir $OutDir `
      -SlaHours ([int]$config.default_sla_hours) `
      -OutBaseName $repository.review_sla_base_name `
      -ConfigPath $ConfigPath
  }
}

$stepResults += Invoke-RefreshStep -Name "action_queue" -Scope "global" -Outputs @("action-queue.json", "action-queue.md") -Action {
  & (Join-Path $PSScriptRoot "update-action-queue.ps1") -OutDir $OutDir
}

# ── Health scoring pipeline (depends on ecosystem data) ──────────

$ecoJsonPath = Join-Path $OutDir "ecosystem-status.json"

if (Test-Path $ecoJsonPath) {
  $stepResults += Invoke-RefreshStep -Name "health_scores" -Scope "global" -Outputs @("health-scores.json", "health-scores.md", "badges/") -Action {
    & (Join-Path $PSScriptRoot "compute-health-scores.ps1") -OutDir $OutDir -ConfigPath $ConfigPath
  }
} else {
  $stepResults += New-StepResult -Name "health_scores" -Scope "global" -Status "skipped" -Message "Skipped because ecosystem-status.json is unavailable."
}

$healthJsonPath = Join-Path $OutDir "health-scores.json"

if (Test-Path $healthJsonPath) {
  $stepResults += Invoke-RefreshStep -Name "trends" -Scope "global" -Outputs @("health-trends.json", "health-trends.md", "health-history.json") -Action {
    & (Join-Path $PSScriptRoot "compute-trends.ps1") -OutDir $OutDir
  }
} else {
  $stepResults += New-StepResult -Name "trends" -Scope "global" -Status "skipped" -Message "Skipped because health-scores.json is unavailable."
}

$stepResults += Invoke-RefreshStep -Name "alerts" -Scope "global" -Outputs @("alerts.json", "alerts.md") -Action {
  & (Join-Path $PSScriptRoot "check-alerts.ps1") -OutDir $OutDir
}

# ── README regeneration (depends on ecosystem + health + manifest) ─

# Write preliminary manifest so readme-stats can read freshness data
$manifest = Write-Manifest -OutDir $OutDir -Config $config -RunStartedAtUtc $runStartedAtUtc -StepResults $stepResults

if (Test-Path $ecoJsonPath) {
  $stepResults += Invoke-RefreshStep -Name "readme_refresh" -Scope "global" -Outputs @("README.md") -Action {
    & (Join-Path $PSScriptRoot "update-readme-stats.ps1") -EcoJson $ecoJsonPath -HealthJson $healthJsonPath -ManifestJson (Join-Path $OutDir "manifest.json") -ConfigPath $ConfigPath -ReadmePath "README.md"
  }
} else {
  $stepResults += New-StepResult -Name "readme_refresh" -Scope "global" -Status "skipped" -Message "Skipped because ecosystem-status.json is unavailable."
}

# ── Final manifest (includes all steps) ──────────────────────────

$manifest = Write-Manifest -OutDir $OutDir -Config $config -RunStartedAtUtc $runStartedAtUtc -StepResults $stepResults

if ($manifest.run_status -ne "success") {
  Write-Warning ("Refresh completed with status '{0}'. See evidence/manifest.json for details." -f $manifest.run_status)
}
