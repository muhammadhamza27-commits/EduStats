param(
  [string]$Message,
  [switch]$NoPush
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

if (-not (Test-Path (Join-Path $repoRoot 'index.html'))) {
  throw 'index.html was not found. Release aborted.'
}

git rev-parse --is-inside-work-tree | Out-Null

git add index.html analysis.worker.js js/core README.md release.ps1 .github/workflows/ci.yml package.json tools/domain-smoke-test.mjs tests

git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
  Write-Host 'No changes to release.' -ForegroundColor Yellow
  exit 0
}

if ([string]::IsNullOrWhiteSpace($Message)) {
  $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
  $Message = "Release: update index and core modules ($timestamp)"
}

git commit -m $Message

if ($NoPush) {
  Write-Host 'Release commit created locally. Push skipped because -NoPush was used.' -ForegroundColor Cyan
  exit 0
}

git push
Write-Host 'Release complete: staged updates pushed.' -ForegroundColor Green
