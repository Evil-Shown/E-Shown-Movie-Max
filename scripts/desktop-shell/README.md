# CHITHRA - CINEMA Desktop

Electron wrapper with **auto-update** via [GitHub Releases](https://github.com/Evil-Shown/E-Shown-Movie-Max/releases).

## Build installer (local only)

From project root:

```powershell
npm run package
```

Output: `release/desktop/Chithra-Cinema-Setup-1.0.0.exe`

## Auto-update (for installed users)

The packaged app checks **GitHub Releases** on startup. If a newer version exists, users get:

1. **Update available** — Download update / Not now  
2. After download — **Restart now** / Later  

Tray menu also has **Check for updates...**

> The git repo alone is not the update server. Each release must upload the `.exe` plus `latest.yml` (electron-builder does this when you publish).

## Publish a new version

1. Bump version in `scripts/desktop-shell/package.json` (e.g. `1.0.0` → `1.1.0`).
2. Create a [GitHub personal access token](https://github.com/settings/tokens) with permission to create releases on `Evil-Shown/E-Shown-Movie-Max`.
3. Run:

```powershell
$env:GH_TOKEN = "ghp_your_token"
npm run package:publish
```

Or with version bump in one step:

```powershell
$env:GH_TOKEN = "ghp_your_token"
.\scripts\publish-desktop-release.ps1 -Version 1.1.0
```

This builds the installer and uploads it to GitHub Releases. Users on older builds will be prompted on next launch.

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
