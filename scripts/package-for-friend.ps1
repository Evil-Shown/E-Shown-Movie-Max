# Builds a portable Windows folder your friend can run with START-CHITHRA.bat
# Ships: Next.js client (port 3000) + Express API (port 5000) + both .env files.
$ErrorActionPreference = "Stop"

$root = Split-Path $PSScriptRoot -Parent
$client = Join-Path $root "client"
$server = Join-Path $root "server"
$releaseRoot = Join-Path $root "release"
$stamp = Get-Date -Format "yyyy-MM-dd_HHmm"
$packageName = "Chithra-Cinema-$stamp"
$packageDir = Join-Path $releaseRoot $packageName
$appDir = Join-Path $packageDir "app"
$serverDir = Join-Path $packageDir "server"
$clientEnvFile = Join-Path $client ".env.local"
$serverEnvFile = Join-Path $server ".env"
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

function Prepare-ClientEnvForPackage {
  param(
    [string]$SourceEnv,
    [string]$DestPath
  )

  Copy-Item $SourceEnv $DestPath -Force
  $lines = @(Get-Content $DestPath)

  $tmdbKey = $null
  foreach ($line in $lines) {
    if ($line -match '^\s*TMDB_API_KEY=(.+)$') {
      $tmdbKey = $Matches[1].Trim()
    }
  }

  $required = [ordered]@{
    "NEXT_PUBLIC_API_BASE_URL"      = "http://localhost:5000"
    "NEXT_PUBLIC_GODS_EYE_API_URL"  = "http://localhost:5000"
    "NEXT_PUBLIC_TBOOM_API_URL"     = "http://localhost:5000"
    "NEXT_PUBLIC_SITE_NAME"         = "CHITHRA - CINEMA"
  }

  if ($tmdbKey -and -not ($lines -match '^\s*NEXT_PUBLIC_TMDB_KEY=')) {
    $required["NEXT_PUBLIC_TMDB_KEY"] = $tmdbKey
  }

  foreach ($key in $required.Keys) {
    if (-not ($lines -match "^\s*$key=")) {
      $lines += "$key=$($required[$key])"
    }
  }

  Set-Content -Path $DestPath -Value $lines -Encoding UTF8
}

Write-Host ""
Write-Host "=== Chithra Cinema - package for friend ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $client)) {
  throw "Client folder not found: $client"
}

if (-not (Test-Path $server)) {
  throw "Server folder not found: $server"
}

if (-not (Test-Path $clientEnvFile)) {
  throw "Missing $clientEnvFile - create it from client/.env.example (TMDB + OMDB keys)."
}

if (-not (Test-Path $serverEnvFile)) {
  throw "Missing $serverEnvFile - create it from server/.env.example (VIRUSTOTAL_API_KEY)."
}

if (-not (Test-Path (Join-Path $client "package-lock.json"))) {
  throw "Missing client/package-lock.json - run 'npm install' in client/ first."
}

if (-not (Test-Path (Join-Path $server "package-lock.json"))) {
  throw "Missing server/package-lock.json - run 'npm install' in server/ first."
}

$clientStaging = Join-Path $env:TEMP "chithra-client-staging-$stamp"
$serverStaging = Join-Path $env:TEMP "chithra-server-staging-$stamp"

foreach ($dir in @($clientStaging, $serverStaging)) {
  if (Test-Path $dir) {
    Remove-Item $dir -Recurse -Force
  }
  New-Item -ItemType Directory -Path $dir | Out-Null
}

Write-Host "[1/7] Copying client to temp staging..."
$excludeDirs = @("node_modules", ".next")
Get-ChildItem -Path $client -Force | Where-Object {
  $excludeDirs -notcontains $_.Name
} | ForEach-Object {
  Copy-Item $_.FullName (Join-Path $clientStaging $_.Name) -Recurse -Force
}

Prepare-ClientEnvForPackage -SourceEnv $clientEnvFile -DestPath (Join-Path $clientStaging ".env.local")

Write-Host "[2/7] Copying server to temp staging..."
Get-ChildItem -Path $server -Force | Where-Object {
  $_.Name -ne "node_modules"
} | ForEach-Object {
  Copy-Item $_.FullName (Join-Path $serverStaging $_.Name) -Recurse -Force
}

Copy-Item $serverEnvFile (Join-Path $serverStaging ".env") -Force

Write-Host "[3/7] Installing client dependencies..."
Push-Location $clientStaging
npm ci
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "client npm ci failed" }
Pop-Location

Write-Host "[4/7] Building production client..."
Invoke-ProductionBuild -WorkDir $clientStaging

Write-Host "[5/7] Trimming client to production dependencies..."
Push-Location $clientStaging
npm ci --omit=dev
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "client npm ci --omit=dev failed" }
Pop-Location

Write-Host "[6/7] Installing server production dependencies..."
Push-Location $serverStaging
npm ci --omit=dev
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "server npm ci --omit=dev failed" }
Pop-Location

if (Test-Path $packageDir) {
  Remove-Item $packageDir -Recurse -Force
}
New-Item -ItemType Directory -Path $appDir -Force | Out-Null
New-Item -ItemType Directory -Path $serverDir -Force | Out-Null

$clientShipItems = @(".next", "public", "node_modules", "package.json", "package-lock.json", "next.config.ts", ".env.local")
foreach ($item in $clientShipItems) {
  $source = Join-Path $clientStaging $item
  if (-not (Test-Path $source)) {
    throw "Missing client build artifact: $item"
  }
  Copy-Item $source (Join-Path $appDir $item) -Recurse -Force
}

$serverShipItems = @("src", "node_modules", "package.json", "package-lock.json", ".env")
foreach ($item in $serverShipItems) {
  $source = Join-Path $serverStaging $item
  if (-not (Test-Path $source)) {
    throw "Missing server build artifact: $item"
  }
  Copy-Item $source (Join-Path $serverDir $item) -Recurse -Force
}

$batLines = @(
  '@echo off',
  'title Chithra Cinema',
  'cd /d "%~dp0"',
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
  'echo  Starting Chithra Cinema (API + website)...',
  'echo  Keep this window open while you use the app.',
  'echo.',
  '',
  'start "Chithra API" /min cmd /c "cd /d %~dp0server && npm start"',
  'timeout /t 4 /nobreak >nul',
  'start http://localhost:3000',
  '',
  'cd /d "%~dp0app"',
  'set PORT=3000',
  'npm start',
  '',
  'echo.',
  'echo  App stopped. Close the minimized API window if it is still open.',
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
  '   A minimized "Chithra API" window also runs (God''s Eye search).',
  '   Close both when you are done.',
  '',
  'What is included',
  '----------------',
  '- app/.env.local  -> TMDB, OMDB, and site keys for the website',
  '- server/.env     -> VirusTotal and API server settings',
  '',
  'Troubleshooting',
  '---------------',
  '- "Node.js is not installed" -> install from nodejs.org, restart PC, try again.',
  '- Page won''t load -> wait 10 seconds and refresh the browser.',
  '- God''s Eye search fails -> check the minimized Chithra API window for errors.',
  '- Port busy -> close any other Chithra window and try again.',
  '- Gods Eye stream/download needs internet (WebTorrent loads from CDN).',
  '',
  'Security',
  '--------',
  'This package includes API keys needed to run the app.',
  'Share only with people you trust. Do not upload publicly.'
)
$readmeContent = $readmeLines -join "`r`n"
Set-Content -Path (Join-Path $packageDir "README-FOR-FRIEND.txt") -Value $readmeContent -Encoding UTF8

Write-Host "[7/7] Creating zip archive (large - may take several minutes)..."
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

Remove-Item $clientStaging -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item $serverStaging -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Write-Host "  Folder: $packageDir"
Write-Host "  Includes: app/.env.local + server/.env (API keys for full functionality)"
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
