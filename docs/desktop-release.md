# Desktop Release Process

This document describes how to create a production-ready desktop release and how the GitHub Actions workflow auto-builds and publishes updates.

---

## Overview

The release process can be done locally or via GitHub Actions:

1. **Local**: Run `npm run package:publish` — builds the installer and uploads to GitHub Releases.
2. **CI/CD**: Manually trigger the **Release Desktop** GitHub Action via `workflow_dispatch`.
3. **Result**: A Windows `.exe` installer is published to GitHub Releases. Installed apps auto-update on next launch.

---

## Local Release (`npm run package:publish`)

### What It Does

| Step | Script                        | Description                                                           |
| ---- | ----------------------------- | --------------------------------------------------------------------- |
| 1    | `publish-desktop-release.ps1` | Auto-increments version, calls build script                           |
| 2    | `build-desktop.ps1`           | Stages client + server, builds both, produces installer               |
| 3    | `npm run publish`             | Runs `electron-builder --publish always` → uploads to GitHub Releases |

### Prerequisites

```bash
# 1. Set your GitHub token (with repo scope)
# Add to .env in the project root:
echo "GH_TOKEN=ghp_your_token_here" >> .env

# 2. Ensure .env files exist for client and server
# client/.env.local  — public URLs only (no API keys)
# server/.env        — API keys + DB config
```

### Usage

```powershell
# From repo root — builds version X.Y.Z → X.Y.Z+1
npm run package:publish

# Or specify a version
.\scripts\publish-desktop-release.ps1 -Version 2.3.0

# Or skip version increment
.\scripts\publish-desktop-release.ps1 -NoIncrement
```

### Release Notes

Write your release notes before publishing:

```
desktop/assets/release-notes.md
```

The script auto-detects this file. After the build completes, the file is **automatically cleared** to prevent stale notes from bleeding into the next release.

If no notes file is found (or it's empty), the script prompts interactively:

```
Release notes for v2.2.11
  Type your notes below. Press Enter twice on a blank line to finish.
Release notes: _
```

### Example Session

```
=== CHITHRA - CINEMA - Desktop Installer Build ===

Auto-incremented version: 2.2.10 -> 2.2.11
  Using release notes from desktop\assets\release-notes.md
  Release notes saved to desktop\assets\release-notes.md
[1/6] Staging client...
  Staging @chithra/core...
[2/6] Staging server...
[3/6] Installing and building client...
  Trying: npm run build (Turbopack)...
✓ Compiled successfully
[4/6] Installing and building server...
[5/6] Copying bundled resources into desktop/...
[6/6] Building Electron installer (this can take several minutes)...
...
Done!
  Version:   2.2.11
  Installer: release\desktop\2.2.11\Chithra-Cinema-Setup-2.2.11.exe
```

### What Gets Published

After the script finishes, GitHub Releases contains:

```
Chithra-Cinema-Setup-2.2.11.exe         # Windows installer
latest.yml                                # Auto-update metadata
```

The `latest.yml` file is what `electron-updater` reads to check for new versions.

---

## CI/CD Release (GitHub Actions)

### Trigger

Manually via GitHub UI:

1. Go to **Actions** → **Release Desktop**
2. Click **Run workflow**
3. (Optional) Enter a version number
4. Click **Run workflow**

Or via `gh` CLI:

```bash
gh workflow run release-desktop.yml -f version=2.2.11
```

### Workflow Steps (`.github/workflows/release-desktop.yml`)

| Step                        | Description                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------- |
| Checkout                    | Full repo clone                                                                       |
| Setup Node.js               | Node 20 with npm cache                                                                |
| Validate secrets            | Checks TMDB_API_KEY, OMDB_API_KEY, WYZIE_API_KEY, VIRUSTOTAL_API_KEY                  |
| Create build env files      | Generates `client/.env.local` (public URLs only) and `server/.env` (private API keys) |
| Build and publish installer | Runs `publish-desktop-release.ps1`                                                    |
| Upload artifact             | Saves installer as a build artifact (downloadable from workflow page)                 |

### Required Secrets

Set these in **GitHub → Settings → Secrets and variables → Actions**:

| Secret                     | Required | Description                |
| -------------------------- | -------- | -------------------------- |
| `TMDB_API_KEY`             | Yes      | The Movie Database API key |
| `OMDB_API_KEY`             | Yes      | OMDB API key               |
| `WYZIE_API_KEY`            | Yes      | Wyzie streaming API key    |
| `VIRUSTOTAL_API_KEY`       | Yes      | VirusTotal API key         |
| `UPSTASH_REDIS_REST_URL`   | No       | Redis URL for caching      |
| `UPSTASH_REDIS_REST_TOKEN` | No       | Redis auth token           |
| `GH_TOKEN`                 | Auto     | Provided by `GITHUB_TOKEN` |

### Workflow File (Full)

```yaml
name: Release Desktop

on:
  workflow_dispatch:
    inputs:
      version:
        description: "Desktop version (e.g. 2.2.5)"
        required: false
        type: string

permissions:
  contents: write

jobs:
  release:
    runs-on: windows-latest
    timeout-minutes: 60

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm

      - name: Validate secrets
        shell: pwsh
        env:
          TMDB_API_KEY: ${{ secrets.TMDB_API_KEY }}
          OMDB_API_KEY: ${{ secrets.OMDB_API_KEY }}
          WYZIE_API_KEY: ${{ secrets.WYZIE_API_KEY }}
          VIRUSTOTAL_API_KEY: ${{ secrets.VIRUSTOTAL_API_KEY }}
        run: |
          $required = @(
            @{ Name = "TMDB_API_KEY"; Value = $env:TMDB_API_KEY },
            @{ Name = "OMDB_API_KEY"; Value = $env:OMDB_API_KEY },
            @{ Name = "WYZIE_API_KEY"; Value = $env:WYZIE_API_KEY },
            @{ Name = "VIRUSTOTAL_API_KEY"; Value = $env:VIRUSTOTAL_API_KEY }
          )
          $missing = $required | Where-Object { [string]::IsNullOrWhiteSpace($_.Value) }
          if ($missing.Count -gt 0) {
            throw "Missing secrets: $($missing.Name -join ', ')"
          }

      - name: Create build env files
        shell: pwsh
        env:
          TMDB_API_KEY: ${{ secrets.TMDB_API_KEY }}
          OMDB_API_KEY: ${{ secrets.OMDB_API_KEY }}
          WYZIE_API_KEY: ${{ secrets.WYZIE_API_KEY }}
          VIRUSTOTAL_API_KEY: ${{ secrets.VIRUSTOTAL_API_KEY }}
          UPSTASH_REDIS_REST_URL: ${{ secrets.UPSTASH_REDIS_REST_URL }}
          UPSTASH_REDIS_REST_TOKEN: ${{ secrets.UPSTASH_REDIS_REST_TOKEN }}
        run: |
          function Write-Utf8NoBom {
            param([string]$Path, [string]$Content)
            $utf8NoBom = New-Object System.Text.UTF8Encoding $false
            [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
          }

          $siteName = "CHITHRA $([char]0x2014) CINEMA"

          # Client env: public URLs only — API keys stay server-side.
          $clientEnv = @(
            "NEXT_PUBLIC_GODS_EYE_API_URL=http://127.0.0.1:5000"
            "NEXT_PUBLIC_TBOOM_API_URL=http://127.0.0.1:5000"
            "NEXT_PUBLIC_SITE_NAME=$siteName"
            "NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000"
            "NEXT_PUBLIC_USE_EMBED_PROXY=false"
          ) -join "`n"

          # Server env: holds the private API keys.
          $serverLines = @(
            "PORT=5000"
            "TMDB_API_KEY=$env:TMDB_API_KEY"
            "OMDB_API_KEY=$env:OMDB_API_KEY"
            "WYZIE_API_KEY=$env:WYZIE_API_KEY"
            "VIRUSTOTAL_API_KEY=$env:VIRUSTOTAL_API_KEY"
          )
          if (-not [string]::IsNullOrWhiteSpace($env:UPSTASH_REDIS_REST_URL)) {
            $serverLines += "UPSTASH_REDIS_REST_URL=$env:UPSTASH_REDIS_REST_URL"
          }
          if (-not [string]::IsNullOrWhiteSpace($env:UPSTASH_REDIS_REST_TOKEN)) {
            $serverLines += "UPSTASH_REDIS_REST_TOKEN=$env:UPSTASH_REDIS_REST_TOKEN"
          }
          $serverEnv = $serverLines -join "`n"

          Write-Utf8NoBom -Path "client/.env.local" -Content $clientEnv
          Write-Utf8NoBom -Path "server/.env" -Content $serverEnv

      - name: Build and publish installer
        shell: pwsh
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: .\scripts\publish-desktop-release.ps1

      - name: Upload installer artifact
        uses: actions/upload-artifact@v4
        with:
          name: Chithra-Cinema-Setup
          path: release/desktop/**/*
```

---

## How Users Receive Updates

The desktop app ships with `electron-updater` which checks GitHub Releases for new versions:

```
Desktop App (v2.2.6)
       │
       ├── Launch
       │    └── updater.js checks latest.yml on GitHub
       │         ├── No update → continue
       │         └── New version → show dialog
       │              ├── Download → progress bar
       │              └── Install → restart app
       │
       └── About dialog shows current version
```

### Update Dialog Features

The built-in update dialog (`update-dialog.html`) shows:

```
┌─────────────────────────────────────┐
│       Update Available               │
│                                     │
│  CHITHRA - CINEMA v2.2.11           │
│  You have v2.2.10                   │
│                                     │
│  Release Notes:                     │
│  • New authentication system        │
│  • Profile icons and dashboard      │
│  • Bug fixes                        │
│                                     │
│  [Download] [Later]                 │
└─────────────────────────────────────┘
```

---

## Versioning Strategy

| Component          | Source                               | Rule                                |
| ------------------ | ------------------------------------ | ----------------------------------- |
| `version` (semver) | `scripts/desktop-shell/package.json` | Auto-increment patch (+1) per build |
| Git tag            | `desktop-v{version}` (optional)      | Manual                              |
| GitHub Release     | Auto-created by electron-builder     | Per publish                         |

### Version Code Strategy

- Follows semver: `major.minor.patch` (e.g., `2.2.6`)
- Patch auto-increments each build
- Major/minor bumps require manual override: `-Version 3.0.0`

---

## Rollback / Hotfix

### Patch Release

```powershell
# 1. Fix the issue
# 2. Write release notes
code desktop/assets/release-notes.md

# 3. Publish (auto-increments patch)
.\scripts\publish-desktop-release.ps1
```

### Reverting a Bad Release

Delete the GitHub Release and tag, then publish the fixed version:

```bash
# Delete GitHub Release (via UI or gh CLI)
gh release delete v2.2.6

# Delete tag
git push origin --delete desktop-v2.2.6
git tag -d desktop-v2.2.6
```

Users on the bad version will need to manually download and reinstall — auto-update cannot downgrade.

---

## Troubleshooting

| Problem                          | Solution                                                         |
| -------------------------------- | ---------------------------------------------------------------- |
| `GH_TOKEN` not found             | Add to `.env` or `$env:GH_TOKEN`                                 |
| `electron-builder` publish fails | Check `GH_TOKEN` has `repo` scope                                |
| Build fails on staging           | Ensure `client/.env.local` and `server/.env` exist               |
| Auto-update not working          | Check `latest.yml` exists in GitHub Release                      |
| Installer flagged as virus       | Sign with a code signing certificate                             |
| NSIS error during packaging      | Run `npm run dist:dir` to debug                                  |
| Release notes file not read      | Ensure file is at `desktop/assets/release-notes.md` with content |

---

## Related Scripts

| Script                                | Purpose                                |
| ------------------------------------- | -------------------------------------- |
| `scripts/build-desktop.ps1`           | Full build (stage + compile + package) |
| `scripts/publish-desktop-release.ps1` | Build + upload to GitHub Releases      |
| `desktop/updater.js`                  | Auto-update client integration         |
| `desktop/update-dialog.html`          | Update notification UI                 |
| `desktop/release-notes.js`            | Release notes display in update dialog |

---

## Branch Strategy

| Branch        | Purpose                                         |
| ------------- | ----------------------------------------------- |
| `development` | Active development — releases are cut from here |
| `main`        | Production releases (optional)                  |

The release script works on **any branch**. The tag is not required — the GitHub Release is created by `electron-builder publish`, not by tag pushes.

---

## Audit Trail

Each release creates:

1. **Version bump** in `scripts/desktop-shell/package.json`
2. **Installer** at `release/desktop/{version}/Chithra-Cinema-Setup-{version}.exe`
3. **GitHub Release** with the installer and `latest.yml` attached
4. **Build artifact** on GitHub Actions (if CI/CD was used)
