$ErrorActionPreference = 'Stop'

param(
  [Parameter(Mandatory = $false)]
  [switch]$Interactive
)

function Write-Step($msg) { Write-Host "  -> $msg" -ForegroundColor Cyan }

function Read-Secret([string]$Prompt) {
  $secure = Read-Host -Prompt $Prompt -AsSecureString
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  }
}

function Generate-TelemetryKey {
  $bytes = [byte[]]::new(32)
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  return [System.Convert]::ToHexString($bytes).ToLower()
}

function Confirm-FileWritten([string]$Path) {
  if (-not (Test-Path $Path)) {
    throw "Failed to write file: $Path"
  }
}

Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  CHITHRA - CINEMA Environment Setup" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# ── 1. Server .env ────────────────────────────────────────────────
Write-Host "[1/3] Setting up server/.env" -ForegroundColor Yellow

$serverEnvPath = Join-Path $PSScriptRoot ".." "server" ".env"

if (Test-Path $serverEnvPath) {
  Write-Step "server/.env already exists, skipping (delete it to regenerate)"
} else {
  $supabaseUrl = Read-Host "  SUPABASE_URL (e.g. https://your-project.supabase.co)"
  $supabaseAnon = Read-Secret "  SUPABASE_ANON_KEY"
  $supabaseService = Read-Secret "  SUPABASE_SERVICE_ROLE_KEY"
  $databaseUrl = Read-Secret "  DATABASE_URL"
  $tmdbKey = Read-Secret "  TMDB_API_KEY"

  $serverContent = @"
# Supabase
SUPABASE_URL=$supabaseUrl
SUPABASE_ANON_KEY=$supabaseAnon
SUPABASE_SERVICE_ROLE_KEY=$supabaseService

# Database
DATABASE_URL=$databaseUrl

# External APIs
TMDB_API_KEY=$tmdbKey
VIRUSTOTAL_API_KEY=
OMDB_API_KEY=
WYZIE_API_KEY=

# PayHere payment
PAYHERE_MERCHANT_ID=
PAYHERE_SECRET=
PAYHERE_API_URL=https://sandbox.payhere.lk

# App URLs
APP_URL=http://localhost:3000
API_URL=http://localhost:5000

# Telemetry
ADMIN_TELEMETRY_KEY=$(Generate-TelemetryKey)

# Redis (optional)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Embed proxy (optional)
EMBED_PROXY_LIST=
"@

  $serverContent | Out-File -FilePath $serverEnvPath -Encoding utf8NoBom -ErrorAction Stop
  Confirm-FileWritten -Path $serverEnvPath
  Write-Step "Created server/.env with generated telemetry key"
}

# ── 2. Client .env.local ───────────────────────────────────────────
Write-Host "[2/3] Setting up client/.env.local" -ForegroundColor Yellow

$clientEnvPath = Join-Path $PSScriptRoot ".." "client" ".env.local"

if (Test-Path $clientEnvPath) {
  Write-Step "client/.env.local already exists, skipping"
} else {
  $supabaseUrl = Read-Host "  Supabase URL (for NEXT_PUBLIC_SUPABASE_URL)"
  $supabaseAnon = Read-Secret "  Supabase anon key (for NEXT_PUBLIC_SUPABASE_ANON_KEY)"

  $clientContent = @"
# ── Backend API URLs ───────────────────────────────────────────────
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_GODS_EYE_API_URL=http://localhost:5000
NEXT_PUBLIC_TBOOM_API_URL=http://localhost:5000

# ── Site Branding ──────────────────────────────────────────────────
NEXT_PUBLIC_SITE_NAME=CHITHRA — CINEMA

# ── Supabase Auth ──────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseAnon

# ── Embed Proxy ────────────────────────────────────────────────────
NEXT_PUBLIC_USE_EMBED_PROXY=false
"@

  $clientContent | Out-File -FilePath $clientEnvPath -Encoding utf8NoBom -ErrorAction Stop
  Confirm-FileWritten -Path $clientEnvPath
  Write-Step "Created client/.env.local"
}

# ── 3. GitHub Actions Secrets Checklist ──────────────────────────
Write-Host "[3/3] GitHub Actions Secrets Checklist" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Set these in GitHub: Settings -> Secrets and variables -> Actions" -ForegroundColor White
Write-Host "  ───────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "  TMDB_API_KEY          (required)" -ForegroundColor Cyan
Write-Host "  OMDB_API_KEY          (optional)" -ForegroundColor Cyan
Write-Host "  WYZIE_API_KEY         (optional)" -ForegroundColor Cyan
Write-Host "  VIRUSTOTAL_API_KEY    (optional)" -ForegroundColor Cyan
Write-Host "  UPSTASH_REDIS_REST_URL  (optional)" -ForegroundColor Cyan
Write-Host "  UPSTASH_REDIS_REST_TOKEN (optional)" -ForegroundColor Cyan
Write-Host "  GITHUB_TOKEN          (auto-provided, has write perms)" -ForegroundColor Green
Write-Host ""
Write-Host "  See: https://github.com/Evil-Shown/E-Shown-Movie-Max/settings/secrets/actions"
Write-Host ""

Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  Setup complete!" -ForegroundColor Magenta
Write-Host "  Fill in the remaining empty values in server/.env" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
