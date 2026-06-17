# Builds CHITHRA - CINEMA Windows installer (Electron + NSIS)
# Output: release/desktop/Chithra-Cinema-Setup-1.0.0.exe
$ErrorActionPreference = "Stop"

$root = Split-Path $PSScriptRoot -Parent
$client = Join-Path $root "client"
$server = Join-Path $root "server"
$desktop = Join-Path $root "desktop"
$clientEnvFile = Join-Path $client ".env.local"
$serverEnvFile = Join-Path $server ".env"
$resourcesApp = Join-Path $desktop "resources/app"
$resourcesServer = Join-Path $desktop "resources/server"
$iconSource = Join-Path $client "app/favicon.ico"
$iconDest = Join-Path $desktop "assets/icon.ico"
$desktopShell = Join-Path $PSScriptRoot "desktop-shell"

function Sync-DesktopShell {
  $required = @("package.json", "main.js", "preload.js", "splash.html")
  if (-not (Test-Path $desktopShell)) {
    throw "Missing $desktopShell - Electron shell templates are required."
  }
  foreach ($name in $required) {
    $src = Join-Path $desktopShell $name
    if (-not (Test-Path $src)) {
      throw "Missing $src"
    }
    New-Item -ItemType Directory -Path $desktop -Force | Out-Null
    Copy-Item $src (Join-Path $desktop $name) -Force
  }
}

function Invoke-ProductionBuild {
  param([string]$WorkDir)

  Push-Location $WorkDir
  $env:NEXT_TELEMETRY_DISABLED = "1"

  npm run build 2>&1 | ForEach-Object { Write-Host $_ }
  if ($LASTEXITCODE -eq 0) {
    Pop-Location
    return
  }

  Write-Host "  Retrying client build with webpack..." -ForegroundColor Yellow
  npx next build --webpack 2>&1 | ForEach-Object { Write-Host $_ }
  if ($LASTEXITCODE -ne 0) {
    Pop-Location
    throw "Client production build failed."
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

  $siteName = "CHITHRA $([char]0x2014) CINEMA"
  $required = [ordered]@{
    "NEXT_PUBLIC_API_BASE_URL"     = "http://127.0.0.1:5000"
    "NEXT_PUBLIC_GODS_EYE_API_URL" = "http://127.0.0.1:5000"
    "NEXT_PUBLIC_TBOOM_API_URL"    = "http://127.0.0.1:5000"
    "NEXT_PUBLIC_SITE_NAME"        = $siteName
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
Write-Host "=== CHITHRA - CINEMA - Desktop Installer Build ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $clientEnvFile)) {
  throw "Missing $clientEnvFile"
}
if (-not (Test-Path $serverEnvFile)) {
  throw "Missing $serverEnvFile"
}

Sync-DesktopShell

$clientStaging = Join-Path $env:TEMP "chithra-desktop-client-$([Guid]::NewGuid().ToString('N'))"
$serverStaging = Join-Path $env:TEMP "chithra-desktop-server-$([Guid]::NewGuid().ToString('N'))"

foreach ($dir in @($clientStaging, $serverStaging, (Join-Path $desktop "resources"))) {
  if (Test-Path $dir) {
    Remove-Item $dir -Recurse -Force
  }
}

Write-Host "[1/6] Staging client..."
$excludeDirs = @("node_modules", ".next")
Get-ChildItem -Path $client -Force | Where-Object { $excludeDirs -notcontains $_.Name } | ForEach-Object {
  Copy-Item $_.FullName (Join-Path $clientStaging $_.Name) -Recurse -Force
}
Prepare-ClientEnvForPackage -SourceEnv $clientEnvFile -DestPath (Join-Path $clientStaging ".env.local")

Write-Host "[2/6] Staging server..."
Get-ChildItem -Path $server -Force | Where-Object { $_.Name -ne "node_modules" } | ForEach-Object {
  Copy-Item $_.FullName (Join-Path $serverStaging $_.Name) -Recurse -Force
}
Copy-Item $serverEnvFile (Join-Path $serverStaging ".env") -Force

Write-Host "[3/6] Installing and building client..."
Push-Location $clientStaging
npm ci
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "client npm ci failed" }
Invoke-ProductionBuild -WorkDir $clientStaging
npm ci --omit=dev
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "client npm ci --omit=dev failed" }
Pop-Location

Write-Host "[4/6] Installing server production dependencies..."
Push-Location $serverStaging
npm ci --omit=dev
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "server npm ci --omit=dev failed" }
Pop-Location

Write-Host "[5/6] Copying bundled resources into desktop/..."
New-Item -ItemType Directory -Path $resourcesApp -Force | Out-Null
New-Item -ItemType Directory -Path $resourcesServer -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $desktop "assets") -Force | Out-Null

$clientShip = @(".next", "public", "node_modules", "package.json", "package-lock.json", "next.config.ts", ".env.local")
foreach ($item in $clientShip) {
  Copy-Item (Join-Path $clientStaging $item) (Join-Path $resourcesApp $item) -Recurse -Force
}

$serverShip = @("src", "node_modules", "package.json", "package-lock.json", ".env")
foreach ($item in $serverShip) {
  Copy-Item (Join-Path $serverStaging $item) (Join-Path $resourcesServer $item) -Recurse -Force
}

Copy-Item $iconSource $iconDest -Force

Remove-Item $clientStaging -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item $serverStaging -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "[6/6] Building Electron installer (this can take several minutes)..."
Sync-DesktopShell
Push-Location $desktop

npm install
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "desktop npm install failed" }

# Skip Authenticode signing (avoids winCodeSign symlink extraction on Windows without Developer Mode).
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"

npm run dist
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "electron-builder failed" }
Pop-Location

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Write-Host "  Installer: $root\release\desktop\Chithra-Cinema-Setup-1.0.0.exe"
Write-Host ""
Write-Host "Your friend can run the installer - no Node.js or .bat required."
Write-Host ""
