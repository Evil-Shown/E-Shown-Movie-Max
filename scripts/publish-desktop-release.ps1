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

function Write-Utf8NoBom {
  param(
    [string]$Path,
    [string]$Content
  )
  $utf8NoBom = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

$root = Split-Path $PSScriptRoot -Parent
$desktopPackage = Join-Path $PSScriptRoot "desktop-shell\package.json"
$envFile = Join-Path $root ".env"

if (-not $env:GH_TOKEN -and (Test-Path $envFile)) {
  Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line -match "^GH_TOKEN\s*=\s*(.+)$") {
      $env:GH_TOKEN = $matches[1].Trim().Trim('"').Trim("'")
    }
  }
}

if (-not $env:GH_TOKEN) {
  throw @"
GH_TOKEN is not set.

Create a GitHub token with repo scope, then either:

  1. Add GH_TOKEN=ghp_... to .env in the project root (copy from .env.example), or
  2. Run: `$env:GH_TOKEN = "your_token_here"

Then run: .\scripts\publish-desktop-release.ps1
"@
}

if ($Version) {
  $text = Get-Content $desktopPackage -Raw
  $text = $text -replace '"version"\s*:\s*"[^"]+"', "`"version`": `"$Version`""
  Write-Utf8NoBom -Path $desktopPackage -Content $text
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
