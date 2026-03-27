param(
  [string]$Message,
  [switch]$NoPush
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

$sourceFile = Join-Path $repoRoot 'EduStats.html'
$targetFile = Join-Path $repoRoot 'index.html'

if (-not (Test-Path $sourceFile)) {
  throw 'EduStats.html was not found. Release aborted.'
}

if (-not (Test-Path $targetFile)) {
  throw 'index.html was not found. Release aborted.'
}

git rev-parse --is-inside-work-tree | Out-Null

Copy-Item -Path $sourceFile -Destination $targetFile -Force
git add index.html

git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
  Write-Host 'No changes to release. index.html is already up to date.' -ForegroundColor Yellow
  exit 0
}

if ([string]::IsNullOrWhiteSpace($Message)) {
  $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
  $Message = "Release: sync index.html from EduStats.html ($timestamp)"
}

git commit -m $Message

if ($NoPush) {
  Write-Host 'Release commit created locally. Push skipped because -NoPush was used.' -ForegroundColor Cyan
  exit 0
}

git push
Write-Host 'Release complete: index.html updated from EduStats.html and pushed.' -ForegroundColor Green
