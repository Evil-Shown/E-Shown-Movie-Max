# Builds a portable Windows folder your friend can run with START-CHITHRA.bat
# Does NOT change your source code - only writes to the release/ folder.
$ErrorActionPreference = "Stop"

$root = Split-Path $PSScriptRoot -Parent
$client = Join-Path $root "client"
$releaseRoot = Join-Path $root "release"
$stamp = Get-Date -Format "yyyy-MM-dd_HHmm"
$packageName = "Chithra-Cinema-$stamp"
$packageDir = Join-Path $releaseRoot $packageName
$appDir = Join-Path $packageDir "app"
$envFile = Join-Path $client ".env.local"
$zipPath = Join-Path $releaseRoot "$packageName.zip"

Write-Host ""
Write-Host "=== Chithra Cinema - package for friend ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $client)) {
  throw "Client folder not found: $client"
}

if (-not (Test-Path $envFile)) {
  throw "Missing $envFile - create it from client/.env.example with your API keys first."
}

$staging = Join-Path $env:TEMP "chithra-package-staging-$stamp"
if (Test-Path $staging) {
  Remove-Item $staging -Recurse -Force
}
New-Item -ItemType Directory -Path $staging | Out-Null

Write-Host "[1/5] Copying app source to temp staging (your dev folder stays as-is)..."
$excludeDirs = @("node_modules", ".next")
Get-ChildItem -Path $client -Force | Where-Object {
  $excludeDirs -notcontains $_.Name
} | ForEach-Object {
  Copy-Item $_.FullName (Join-Path $staging $_.Name) -Recurse -Force
}

Copy-Item $envFile (Join-Path $staging ".env.local") -Force

Write-Host "[2/5] Installing dependencies in staging..."
Push-Location $staging
npm ci
if ($LASTEXITCODE -ne 0) { throw "npm ci failed" }

Write-Host "[3/5] Building production app..."
npm run build
if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }

Write-Host "[4/5] Trimming to production dependencies..."
npm ci --omit=dev
if ($LASTEXITCODE -ne 0) { throw "npm ci --omit=dev failed" }
Pop-Location

if (Test-Path $packageDir) {
  Remove-Item $packageDir -Recurse -Force
}
New-Item -ItemType Directory -Path $appDir -Force | Out-Null

$shipItems = @(".next", "public", "node_modules", "package.json", "package-lock.json", "next.config.ts", ".env.local")
foreach ($item in $shipItems) {
  $source = Join-Path $staging $item
  if (-not (Test-Path $source)) {
    throw "Missing build artifact: $item"
  }
  Copy-Item $source (Join-Path $appDir $item) -Recurse -Force
}

@'
@echo off
title Chithra Cinema
cd /d "%~dp0app"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js is not installed.
  echo  Install the LTS version from https://nodejs.org then run this file again.
  echo.
  start https://nodejs.org/
  pause
  exit /b 1
)

echo.
echo  Starting Chithra Cinema...
echo  Keep this window open while you watch.
echo  Close this window to stop the app.
echo.

start "" cmd /c "timeout /t 4 /nobreak >nul && start http://localhost:3000"

set PORT=3000
npm start

echo.
echo  App stopped.
pause
'@ | Set-Content -Path (Join-Path $packageDir "START-CHITHRA.bat") -Encoding ASCII

@'
CHITHRA CINEMA - quick start
============================

1) Install Node.js (one time only)
   https://nodejs.org/
   Choose the LTS version, install with default options.

2) Unzip this folder anywhere (Desktop is fine).

3) Double-click: START-CHITHRA.bat

4) Your browser opens to http://localhost:3000
   Keep the black window open while using the app.
   Close that window when you are done.

Troubleshooting
---------------
- "Node.js is not installed" -> install from nodejs.org, restart PC, try again.
- Page won't load -> wait 10 seconds and refresh the browser.
- Port busy -> close any other Chithra window and try again.

Note: This package includes API keys needed to run the app.
      Share only with people you trust. Do not upload publicly.
'@ | Set-Content -Path (Join-Path $packageDir "README-FOR-FRIEND.txt") -Encoding UTF8

Write-Host "[5/5] Creating zip archive (large - may take several minutes)..."
if (Test-Path $zipPath) {
  Remove-Item $zipPath -Force
}

$zipOk = $false
try {
  Push-Location $releaseRoot
  & tar.exe -a -c -f $zipPath $packageName
  Pop-Location
  if ((Test-Path $zipPath) -and ((Get-Item $zipPath).Length -gt 0)) {
    $zipOk = $true
  }
} catch {
  Pop-Location
}

if (-not $zipOk) {
  Write-Host "Zip was not created. Share this folder directly (USB / Google Drive):" -ForegroundColor Yellow
  Write-Host "  $packageDir" -ForegroundColor Yellow
} else {
  $zipMb = [math]::Round((Get-Item $zipPath).Length / 1MB, 1)
  Write-Host "  Zip size: $zipMb MB"
}
Remove-Item $staging -Recurse -Force

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Write-Host "  Folder: $packageDir"
if ($zipOk) {
  Write-Host "  Zip:    $zipPath"
  Write-Host ""
  Write-Host "Send your friend the .zip file. They unzip and double-click START-CHITHRA.bat"
} else {
  Write-Host ""
  Write-Host "Copy the folder above to USB / cloud, or zip it manually in File Explorer."
}
Write-Host "Your dev project was not modified (only release/ was created)."
Write-Host ""