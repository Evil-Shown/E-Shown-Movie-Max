# Builds CHITHRA - CINEMA Windows installer (Electron + NSIS)
# Output: release/desktop/{version}/Chithra-Cinema-Setup-{version}.exe
#
# Usage:
#   .\scripts\build-desktop.ps1
#   .\scripts\build-desktop.ps1 -Version 1.1.0
#   .\scripts\build-desktop.ps1 -NoIncrement
#   .\scripts\build-desktop.ps1 -ReleaseNotes "Fixed bugs and improved performance"
#   .\scripts\build-desktop.ps1 -ReleaseNotesFile .\RELEASE_NOTES.md
param(
  [string]$Version = "",
  [switch]$NoIncrement,
  [string]$ReleaseNotes = "",
  [string]$ReleaseNotesFile = ""
)
$ErrorActionPreference = "Stop"

$root = Split-Path $PSScriptRoot -Parent
$client = Join-Path $root "client"
$server = Join-Path $root "server"
$desktop = Join-Path $root "desktop"
$clientEnvFile = Join-Path $client ".env.local"
$serverEnvFile = Join-Path $server ".env"
$resourcesApp = Join-Path $desktop "resources/app"
$resourcesServer = Join-Path $desktop "resources/server"
$iconSource = Join-Path $PSScriptRoot "desktop-shell/assets/icon.ico"
$iconDest = Join-Path $desktop "assets/icon.ico"
$desktopShell = Join-Path $PSScriptRoot "desktop-shell"
$desktopPackage = Join-Path $desktopShell "package.json"
$corePackage = Join-Path $root "packages/core"

function Write-Utf8NoBom {
  param(
    [string]$Path,
    [string]$Content
  )
  $utf8NoBom = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Get-NextPatchVersion([string]$current) {
  $parts = $current.Split('.')
  if ($parts.Length -ne 3) { return $current }
  $major = [int]$parts[0]
  $minor = [int]$parts[1]
  $patch = [int]$parts[2] + 1
  return "$major.$minor.$patch"
}

function Set-DesktopVersion([string]$newVersion) {
  $text = Get-Content $desktopPackage -Raw
  $text = $text -replace '"version"\s*:\s*"[^"]+"', "`"version`": `"$newVersion`""
  Write-Utf8NoBom -Path $desktopPackage -Content $text
}

function Get-ReleaseNotes([string]$version) {
  if ($ReleaseNotesFile -and (Test-Path $ReleaseNotesFile -PathType Leaf)) {
    return (Get-Content $ReleaseNotesFile -Raw).Trim()
  }
  if ($ReleaseNotes) {
    return $ReleaseNotes.Trim()
  }

  Write-Host ""
  Write-Host "Release notes for v$version" -ForegroundColor Cyan
  Write-Host "  Type your notes below. Press Enter twice on a blank line to finish." -ForegroundColor DarkGray
  Write-Host "  Or pass -ReleaseNotes '...' / -ReleaseNotesFile path to skip this prompt." -ForegroundColor DarkGray
  Write-Host "  Leave the first line empty to skip release notes." -ForegroundColor DarkGray

  $first = Read-Host "Release notes"
  if ([string]::IsNullOrWhiteSpace($first)) {
    return ""
  }

  $lines = @($first)
  while ($true) {
    $line = Read-Host
    if ([string]::IsNullOrWhiteSpace($line)) {
      if ($lines.Count -gt 0 -and [string]::IsNullOrWhiteSpace($lines[-1])) {
        break
      }
    }
    $lines += $line
  }

  # Remove the trailing blank line used to finish input.
  while ($lines.Count -gt 0 -and [string]::IsNullOrWhiteSpace($lines[-1])) {
    $lines = $lines[0..($lines.Count - 2)]
  }

  return ($lines -join "`n").Trim()
}

function Write-ReleaseNotesFile {
  param(
    [string]$Path,
    [string]$Version,
    [string]$Notes
  )
  $dir = Split-Path $Path -Parent
  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }
  $content = if ($Notes) { $Notes } else { "Release v$Version" }
  Write-Utf8NoBom -Path $Path -Content $content
}

function Robocopy-Item {
  param([string]$Source, [string]$Dest)
  if (Test-Path $Source -PathType Leaf) {
    $destDir = if (Test-Path $Dest -PathType Container) { $Dest } else { Split-Path $Dest -Parent }
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    Copy-Item $Source (Join-Path $destDir (Split-Path $Source -Leaf)) -Force
    return
  }
  New-Item -ItemType Directory -Path $Dest -Force | Out-Null
  robocopy $Source $Dest /E /COPY:DAT /NFL /NDL /NJH /NJS /nc /ns /np /r:2 /w:5 | Out-Null
  if ($LASTEXITCODE -ge 8) {
    throw "Robocopy failed for $Source -> $Dest (exit code $LASTEXITCODE)"
  }
}

function Sync-DesktopShell {
  $required = @(
    "package.json",
    "main.js",
    "preload.js",
    "updater.js",
    "update-dialog.js",
    "update-dialog.html",
    "update-dialog-preload.js",
    "update-dialog-renderer.js",
    "update-progress.html",
    "update-progress-preload.js",
    "release-notes.js",
    "block-ad-nav.js",
    "embed-headers.js",
    "splash.html",
    "telemetry.js",
    "update-progress.html"
  )
  if (-not (Test-Path $desktopShell)) {
    throw "Missing $desktopShell - Electron shell templates are required."
  }
  foreach ($name in $required) {
    $src = Join-Path $desktopShell $name
    if (-not (Test-Path $src)) {
      throw "Missing $src"
    }
    New-Item -ItemType Directory -Path $desktop -Force | Out-Null
    $dest = Join-Path $desktop $name
    if ($name -eq "package.json") {
      Write-Utf8NoBom -Path $dest -Content (Get-Content $src -Raw)
    } else {
      Copy-Item $src $dest -Force
    }
  }
}

function Invoke-ProductionBuild {
  param([string]$WorkDir)

  Push-Location $WorkDir
  $env:NEXT_TELEMETRY_DISABLED = "1"
  $prevEap = $ErrorActionPreference
  $ErrorActionPreference = "Continue"

  try {
    Write-Host "  Trying: npm run build (Turbopack)..." -ForegroundColor DarkGray
    npm run build
    $buildExit = $LASTEXITCODE

    if ($buildExit -ne 0) {
      Write-Host "  Retrying client build with webpack..." -ForegroundColor Yellow
      npx next build --webpack
      $buildExit = $LASTEXITCODE
    }

    if ($buildExit -ne 0) {
      throw "Client production build failed."
    }
  }
  finally {
    $ErrorActionPreference = $prevEap
    Pop-Location
  }
}

function Stage-MonorepoCorePackage {
  param([string]$ClientStagingDir)

  if (-not (Test-Path $corePackage)) {
    throw "Missing $corePackage - required for @chithra/core during desktop packaging."
  }

  $coreStaging = Join-Path (Split-Path $ClientStagingDir -Parent) "packages\core"
  Write-Host "  Staging @chithra/core..."
  Robocopy-Item -Source $corePackage -Dest $coreStaging
  return $coreStaging
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

$desktopPackageJson = Get-Content $desktopPackage -Raw | ConvertFrom-Json
$currentVersion = $desktopPackageJson.version

if ($Version) {
  Set-DesktopVersion -newVersion $Version
  Write-Host "Using specified version: $Version" -ForegroundColor Cyan
} elseif (-not $NoIncrement) {
  $newVersion = Get-NextPatchVersion -current $currentVersion
  Set-DesktopVersion -newVersion $newVersion
  Write-Host "Auto-incremented version: $currentVersion -> $newVersion" -ForegroundColor Cyan
} else {
  Write-Host "Using current version: $currentVersion (no increment)" -ForegroundColor Cyan
}

$desktopPackageJson = Get-Content $desktopPackage -Raw | ConvertFrom-Json
$desktopVersion = $desktopPackageJson.version
$installerName = "Chithra-Cinema-Setup-$desktopVersion.exe"
$outputDir = "../release/desktop/$desktopVersion"
$outputDirAbsolute = Join-Path $root "release\desktop\$desktopVersion"

Sync-DesktopShell

$releaseNotes = Get-ReleaseNotes -version $desktopVersion
$releaseNotesPath = Join-Path $desktop "assets/release-notes.md"
Write-ReleaseNotesFile -Path $releaseNotesPath -Version $desktopVersion -Notes $releaseNotes
Write-Host "  Release notes saved to $releaseNotesPath" -ForegroundColor DarkGray

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
  Robocopy-Item -Source $_.FullName -Dest (Join-Path $clientStaging $_.Name)
}
Prepare-ClientEnvForPackage -SourceEnv $clientEnvFile -DestPath (Join-Path $clientStaging ".env.local")
$coreStaging = Stage-MonorepoCorePackage -ClientStagingDir $clientStaging

Write-Host "[2/6] Staging server..."
Get-ChildItem -Path $server -Force | Where-Object { $_.Name -ne "node_modules" } | ForEach-Object {
  Robocopy-Item -Source $_.FullName -Dest (Join-Path $serverStaging $_.Name)
}
Copy-Item $serverEnvFile (Join-Path $serverStaging ".env") -Force

Write-Host "[3/6] Installing and building client..."
Push-Location $clientStaging
  npm install
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "client npm install failed" }
Invoke-ProductionBuild -WorkDir $clientStaging
npm install --omit=dev
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "client npm install --omit=dev failed" }
Pop-Location

Write-Host "[4/6] Installing and building server..."
Push-Location $serverStaging
npm install
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "server npm install failed" }
npm run build
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "server build failed" }
npm install --omit=dev
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "server npm install --omit=dev failed" }
Pop-Location

Write-Host "[5/6] Copying bundled resources into desktop/..."
New-Item -ItemType Directory -Path $resourcesApp -Force | Out-Null
New-Item -ItemType Directory -Path $resourcesServer -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $desktop "assets") -Force | Out-Null

$clientShip = @(".next", "public", "node_modules", "package.json", "package-lock.json", "next.config.ts", ".env.local")
foreach ($item in $clientShip) {
  $src = Join-Path $clientStaging $item
  if (Test-Path $src) {
    Robocopy-Item -Source $src -Dest (Join-Path $resourcesApp $item)
  }
}

$serverShip = @("dist", "node_modules", "package.json", "package-lock.json", ".env")
foreach ($item in $serverShip) {
  $src = Join-Path $serverStaging $item
  if (Test-Path $src) {
    Robocopy-Item -Source $src -Dest (Join-Path $resourcesServer $item)
  }
}

Copy-Item $iconSource $iconDest -Force

Remove-Item $clientStaging -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item $serverStaging -Recurse -Force -ErrorAction SilentlyContinue
if ($coreStaging) {
  Remove-Item $coreStaging -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "[6/6] Building Electron installer (this can take several minutes)..."
Sync-DesktopShell
Push-Location $desktop

npm install
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "desktop npm install failed" }

# Skip Authenticode signing (avoids winCodeSign symlink extraction on Windows without Developer Mode).
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"

npm run dist -- --config.directories.output="$outputDir"
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "electron-builder failed" }
Pop-Location

$releaseNotesDest = Join-Path $outputDirAbsolute "release-notes.md"
if (Test-Path $releaseNotesPath) {
  Copy-Item $releaseNotesPath $releaseNotesDest -Force
  Write-Host "  Copied release notes to $releaseNotesDest" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Write-Host "  Version:   $desktopVersion" -ForegroundColor Green
Write-Host "  Installer: $outputDirAbsolute\$installerName" -ForegroundColor Green
Write-Host ""
Write-Host "Your friend can run the installer - no Node.js or .bat required."
Write-Host ""
