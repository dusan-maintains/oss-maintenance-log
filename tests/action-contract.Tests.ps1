Describe "Reusable action contract" {

  BeforeAll {
    $actionPath = Join-Path (Join-Path $PSScriptRoot "..") "action.yml"
    $actionText = Get-Content $actionPath -Raw
  }

  It "runs the orchestrator from the action bundle" {
    $actionText | Should -Match "github\.action_path"
    $actionText | Should -Match "update-all-evidence\.ps1"
  }

  It "derives output metrics from health.scores" {
    $actionText | Should -Match "health\.scores"
    $actionText | Should -Not -Match "health\.packages"
  }

  It "pins workspace-relative resolution through OSS_MAINTENANCE_LOG_WORKSPACE_ROOT" {
    $actionText | Should -Match "OSS_MAINTENANCE_LOG_WORKSPACE_ROOT"
  }
}
