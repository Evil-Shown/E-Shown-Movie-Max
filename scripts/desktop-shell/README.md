# CHITHRA - CINEMA Desktop

Electron wrapper with **auto-update** via [GitHub Releases](https://github.com/Evil-Shown/E-Shown-Movie-Max/releases).

## Build installer (local only)

From project root:

```powershell
npm run package                  # auto-increment patch, build, output → release/desktop/{version}/
npm run package:current          # build current version without increment
npm run package:version 2.3.0    # build a specific version
```

Output: `release/desktop/2.2.5/Chithra-Cinema-Setup-2.2.5.exe`

Each build creates a versioned folder under `release/desktop/`. The patch number auto-increments unless you use `package:current` or `package:version`.

## Auto-update (for installed users)

The packaged app checks **GitHub Releases** on startup. If a newer version exists, users get:

1. **Update available** — Download update / Not now
2. After download — **Restart now** / Later

Tray menu also has **Check for updates...**

> The git repo alone is not the update server. Each release must upload the `.exe` plus `latest.yml` (electron-builder does this when you publish).

## Publish a new version

### GitHub Actions (recommended)

1. Add repository secrets under **Settings → Secrets and variables → Actions**:
   - `TMDB_API_KEY`
   - `OMDB_API_KEY`
   - `WYZIE_API_KEY`
   - `VIRUSTOTAL_API_KEY`
   - Optional: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
2. Push this repo to GitHub, then run the workflow:

```powershell
# Auto-increment patch version
npm run release:desktop

# Or publish a specific version
gh workflow run release-desktop.yml -f version=2.3.0
```

Or open **Actions → Release Desktop → Run workflow** in GitHub.

The workflow builds the NSIS installer, publishes it to [GitHub Releases](https://github.com/Evil-Shown/E-Shown-Movie-Max/releases), and uploads the `.exe` as a workflow artifact.

### Local publish (manual)

1. Create a [GitHub personal access token](https://github.com/settings/tokens) with permission to create releases on `Evil-Shown/E-Shown-Movie-Max`.
2. Run:

```powershell
$env:GH_TOKEN = "ghp_your_token"
npm run package:publish                  # auto-increment patch, build, publish
npm run package:publish:current          # publish current version
npm run package:publish:version 2.3.0    # publish a specific version
```

Or with PowerShell directly:

```powershell
$env:GH_TOKEN = "ghp_your_token"
.\scripts\publish-desktop-release.ps1 -Version 2.3.0
```

This builds the installer, places it in `release/desktop/{version}/`, and uploads it to GitHub Releases. Users on older builds will be prompted on next launch.

When a user chooses **Download update**, an animated progress window keeps them informed during the download—even on slow networks—without navigating away from the app.

## Dev

```powershell
cd desktop
npm install
npm start
```

Auto-update is disabled when running from source (`electron .`).

---

## ⚖️ License & Restrictive Notice

**Copyright © 2026 CHITHRA — CINEMA. All rights reserved.**

This desktop wrapper, build logic, and associated scripts are proprietary code. Under no circumstances may this be copied, modified, reverse engineered, or redistributed without prior written consent.
