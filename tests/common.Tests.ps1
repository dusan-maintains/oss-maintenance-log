BeforeAll {
  . (Join-Path (Join-Path (Join-Path $PSScriptRoot "..") "scripts") "common.ps1")
}

Describe "New-GitHubHeaders" {

  It "returns User-Agent header without token" {
    $env:GITHUB_TOKEN = ""
    $h = New-GitHubHeaders
    $h["User-Agent"] | Should -Be "dusan-maintains-oss-log"
    $h.ContainsKey("Authorization") | Should -Be $false
  }

  It "includes Authorization when GITHUB_TOKEN is set" {
    $env:GITHUB_TOKEN = "test-token-123"
    try {
      $h = New-GitHubHeaders
      $h["Authorization"] | Should -Be "Bearer test-token-123"
      $h["X-GitHub-Api-Version"] | Should -Be "2022-11-28"
    } finally {
      $env:GITHUB_TOKEN = ""
    }
  }
}

Describe "Get-RepoRoot" {

  It "returns the parent of scripts directory" {
    $root = Get-RepoRoot
    $root | Should -Not -BeNullOrEmpty
    (Test-Path (Join-Path $root "scripts")) | Should -Be $true
  }

  It "prefers OSS_MAINTENANCE_LOG_WORKSPACE_ROOT when set" {
    $testRoot = Join-Path ([System.IO.Path]::GetTempPath()) "oss-root-$(Get-Random)"
    New-Item -ItemType Directory -Path $testRoot | Out-Null

    try {
      $env:OSS_MAINTENANCE_LOG_WORKSPACE_ROOT = $testRoot
      (Get-RepoRoot) | Should -Be $testRoot
    } finally {
      $env:OSS_MAINTENANCE_LOG_WORKSPACE_ROOT = ""
      Remove-Item $testRoot -Recurse -Force
    }
  }
}

Describe "Resolve-RepoPath" {

  It "resolves a relative path to repo root" {
    $resolved = Resolve-RepoPath -Path "config/tracked-repositories.json"
    $resolved | Should -Match "tracked-repositories\.json$"
  }

  It "returns absolute paths unchanged" {
    if ($IsWindows -or $env:OS -match "Windows") {
      $abs = "C:\absolute\path.json"
    } else {
      $abs = "/absolute/path.json"
    }
    (Resolve-RepoPath -Path $abs) | Should -Be $abs
  }
}

Describe "Ensure-Directory" {

  It "creates a directory if it does not exist" {
    $testDir = Join-Path ([System.IO.Path]::GetTempPath()) "oss-test-$(Get-Random)"
    try {
      (Test-Path $testDir) | Should -Be $false
      Ensure-Directory -Path $testDir
      (Test-Path $testDir) | Should -Be $true
    } finally {
      if (Test-Path $testDir) { Remove-Item $testDir -Recurse -Force }
    }
  }

  It "does not error on existing directory" {
    $testDir = Join-Path ([System.IO.Path]::GetTempPath()) "oss-test-$(Get-Random)"
    New-Item -ItemType Directory -Path $testDir | Out-Null
    try {
      { Ensure-Directory -Path $testDir } | Should -Not -Throw
    } finally {
      Remove-Item $testDir -Recurse -Force
    }
  }
}

Describe "Get-TrackedConfig" {

  It "parses the default config file" {
    $cfg = Get-TrackedConfig
    $cfg.version | Should -Be 1
    $cfg.contributor | Should -Be "dusan-maintains"
    $cfg.repositories.Count | Should -BeGreaterThan 4
  }

  It "each repository has required fields" {
    $cfg = Get-TrackedConfig
    foreach ($repo in $cfg.repositories) {
      $repo.owner | Should -Not -BeNullOrEmpty
      $repo.repo | Should -Not -BeNullOrEmpty
      $repo.tracked_pr_numbers | Should -Not -BeNullOrEmpty
      $repo.review_sla_base_name | Should -Not -BeNullOrEmpty
    }
  }
}

Describe "Convert-StringToUtcDateTime" {

  It "parses ISO 8601 strings" {
    $dt = Convert-StringToUtcDateTime -Value "2026-03-15T12:30:00Z"
    $dt.Year | Should -Be 2026
    $dt.Month | Should -Be 3
    $dt.Day | Should -Be 15
    $dt.Hour | Should -Be 12
    $dt.Minute | Should -Be 30
  }

  It "throws on invalid input" {
    { Convert-StringToUtcDateTime -Value "not-a-date" } | Should -Throw
  }
}

Describe "Get-UiGlyph" {

  It "returns the expected em dash glyph" {
    (Get-UiGlyph -Name "emdash") | Should -Be ([char]::ConvertFromUtf32(0x2014))
  }

  It "returns the expected green circle glyph" {
    (Get-UiGlyph -Name "green-circle") | Should -Be ([char]::ConvertFromUtf32(0x1F7E2))
  }
}
