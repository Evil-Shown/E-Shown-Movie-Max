# Build installer and publish to GitHub Releases (auto-update feed).
# Requires: GH_TOKEN with repo scope (GitHub fine-grained or classic PAT).
#
# Usage:
#   $env:GH_TOKEN = "ghp_..."
#   .\scripts\publish-desktop-release.ps1
#   .\scripts\publish-desktop-release.ps1 -Version 1.1.0
param(
  [string]$Version = ""
)

$ErrorActionPreference = "Stop"

$root = Split-Path $PSScriptRoot -Parent
$desktopPackage = Join-Path $PSScriptRoot "desktop-shell\package.json"

if (-not $env:GH_TOKEN) {
  throw @"
GH_TOKEN is not set.

Create a GitHub token with access to Evil-Shown/E-Shown-Movie-Max, then run:

  `$env:GH_TOKEN = "your_token_here"
  .\scripts\publish-desktop-release.ps1
"@
}

if ($Version) {
  $text = Get-Content $desktopPackage -Raw
  $text = $text -replace '"version"\s*:\s*"[^"]+"', "`"version`": `"$Version`""
  Set-Content -Path $desktopPackage -Value $text -Encoding UTF8 -NoNewline
  Write-Host "Bumped desktop version to $Version" -ForegroundColor Cyan
}

& (Join-Path $PSScriptRoot "build-desktop.ps1")

Push-Location (Join-Path $root "desktop")
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
npm run publish
if ($LASTEXITCODE -ne 0) {
  Pop-Location
  throw "GitHub publish failed"
}
Pop-Location

Write-Host ""
Write-Host "Published to GitHub Releases." -ForegroundColor Green
Write-Host "Installed apps will see the update on next launch." -ForegroundColor Green
Write-Host ""
