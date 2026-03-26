BeforeAll {
  . (Join-Path (Join-Path (Join-Path $PSScriptRoot "..") "scripts") "common.ps1")

  function Get-LogScore {
    param([double]$Value, [double]$Scale = 1000)
    if ($Value -le 0) { return 0 }
    $raw = [Math]::Log10($Value + 1) / [Math]::Log10($Scale + 1) * 10
    return [Math]::Min([Math]::Round($raw, 2), 10)
  }

  function Get-DecayScore {
    param([double]$DaysSinceEvent, [double]$HalfLifeDays = 180)
    if ($DaysSinceEvent -le 0) { return 10 }
    $score = 10 * [Math]::Exp(-0.693 * $DaysSinceEvent / $HalfLifeDays)
    return [Math]::Round([Math]::Max($score, 0), 2)
  }
}

Describe "Get-LogScore" {

  It "returns 0 for zero input" {
    (Get-LogScore -Value 0) | Should -Be 0
  }

  It "returns 0 for negative input" {
    (Get-LogScore -Value -5) | Should -Be 0
  }

  It "returns score between 0 and 10 for positive values" {
    $score = Get-LogScore -Value 500 -Scale 1000
    $score | Should -BeGreaterThan 0
    $score | Should -Not -BeGreaterThan 10
  }

  It "scales logarithmically - 1M scores higher than 1k" {
    $low = Get-LogScore -Value 1000 -Scale 1000000
    $high = Get-LogScore -Value 1000000 -Scale 1000000
    $high | Should -BeGreaterThan $low
  }

  It "caps at 10" {
    $score = Get-LogScore -Value 999999999 -Scale 1000
    $score | Should -Be 10
  }
}

Describe "Get-DecayScore" {

  It "returns 10 for 0 days" {
    (Get-DecayScore -DaysSinceEvent 0) | Should -Be 10
  }

  It "returns approximately 5 at half-life" {
    $score = Get-DecayScore -DaysSinceEvent 180 -HalfLifeDays 180
    $score | Should -BeGreaterThan 4
    $score | Should -BeLessThan 6
  }

  It "scores decrease over time" {
    $fresh = Get-DecayScore -DaysSinceEvent 30
    $old = Get-DecayScore -DaysSinceEvent 365
    $ancient = Get-DecayScore -DaysSinceEvent 730
    $fresh | Should -BeGreaterThan $old
    $old | Should -BeGreaterThan $ancient
  }

  It "never goes below 0" {
    $score = Get-DecayScore -DaysSinceEvent 99999
    $score | Should -BeGreaterOrEqual 0
  }
}

Describe "Health Score JSON Schema" {

  It "health-scores.json is valid if present" {
    $jsonPath = Join-Path (Join-Path (Get-RepoRoot) "evidence") "health-scores.json"
    if (Test-Path $jsonPath) {
      $data = Get-Content $jsonPath -Raw | ConvertFrom-Json
      $data.generated_at_utc | Should -Not -BeNullOrEmpty
      $data.summary.total_projects | Should -BeGreaterThan 0
      foreach ($s in $data.scores) {
        $s.health_score | Should -BeGreaterOrEqual 0
        $s.health_score | Should -BeLessOrEqual 100
      }
    }
  }
}
