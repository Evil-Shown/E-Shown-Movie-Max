# Builds a portable Windows folder your friend can run with START-CHITHRA.bat
# Writes only to release/ - your dev client/ folder is copied to a temp staging dir first.
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

function Invoke-ProductionBuild {
  param([string]$WorkDir)

  Push-Location $WorkDir
  $env:NEXT_TELEMETRY_DISABLED = "1"

  Write-Host "  Trying: npm run build (Turbopack)..." -ForegroundColor DarkGray
  npm run build 2>&1 | ForEach-Object { Write-Host $_ }
  if ($LASTEXITCODE -eq 0) {
    Pop-Location
    return
  }

  Write-Host "  Turbopack build failed - retrying with webpack..." -ForegroundColor Yellow
  npx next build --webpack 2>&1 | ForEach-Object { Write-Host $_ }
  if ($LASTEXITCODE -ne 0) {
    Pop-Location
    $buildHelp = @'
Production build failed.

Common cause (fixed in source): WebTorrent must load from CDN in the browser, not from npm,
because node-datachannel breaks Next.js production builds.

If this persists:
  1. cd client; npm install; npm run build
  2. Fix any TypeScript or ESLint errors shown above
  3. Re-run scripts\package-for-friend.ps1
'@
    throw $buildHelp
  }
  Pop-Location
}

Write-Host ""
Write-Host "=== Chithra Cinema - package for friend ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $client)) {
  throw "Client folder not found: $client"
}

if (-not (Test-Path $envFile)) {
  throw "Missing $envFile - create it from client/.env.example with your API keys first."
}

if (-not (Test-Path (Join-Path $client "package-lock.json"))) {
  throw "Missing client/package-lock.json - run 'npm install' in client/ first."
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
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "npm ci failed" }
Pop-Location

Write-Host "[3/5] Building production app..."
Invoke-ProductionBuild -WorkDir $staging

Write-Host "[4/5] Trimming to production dependencies..."
Push-Location $staging
npm ci --omit=dev
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "npm ci --omit=dev failed" }
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

$batLines = @(
  '@echo off',
  'title Chithra Cinema',
  'cd /d "%~dp0app"',
  '',
  'where node >nul 2>nul',
  'if errorlevel 1 (',
  '  echo.',
  '  echo  Node.js is not installed.',
  '  echo  Install the LTS version from https://nodejs.org then run this file again.',
  '  echo.',
  '  start https://nodejs.org/',
  '  pause',
  '  exit /b 1',
  ')',
  '',
  'echo.',
  'echo  Starting Chithra Cinema...',
  'echo  Keep this window open while you watch.',
  'echo  Close this window to stop the app.',
  'echo.',
  '',
  'timeout /t 4 /nobreak >nul',
  'start http://localhost:3000',
  '',
  'set PORT=3000',
  'npm start',
  '',
  'echo.',
  'echo  App stopped.',
  'pause'
)
$batContent = $batLines -join "`r`n"
Set-Content -Path (Join-Path $packageDir "START-CHITHRA.bat") -Value $batContent -Encoding ASCII

$readmeLines = @(
  'CHITHRA CINEMA - quick start',
  '============================',
  '',
  '1) Install Node.js (one time only)',
  '   https://nodejs.org/',
  '   Choose the LTS version, install with default options.',
  '',
  '2) Unzip this folder anywhere (Desktop is fine).',
  '',
  '3) Double-click: START-CHITHRA.bat',
  '',
  '4) Your browser opens to http://localhost:3000',
  '   Keep the black window open while using the app.',
  '   Close that window when you are done.',
  '',
  'Troubleshooting',
  '---------------',
  '- "Node.js is not installed" -> install from nodejs.org, restart PC, try again.',
  '- Page won''t load -> wait 10 seconds and refresh the browser.',
  '- Port busy -> close any other Chithra window and try again.',
  '- Gods Eye stream/download needs internet (WebTorrent loads from CDN).',
  '',
  'Note: This package includes API keys needed to run the app.',
  '      Share only with people you trust. Do not upload publicly.'
)
$readmeContent = $readmeLines -join "`r`n"
Set-Content -Path (Join-Path $packageDir "README-FOR-FRIEND.txt") -Value $readmeContent -Encoding UTF8

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
