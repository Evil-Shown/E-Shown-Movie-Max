# Desktop Build Guide

This document explains how to build the Chithra Cinema desktop app locally and how the `electron-builder` configuration works.

---

## Prerequisites

- **Node.js** 20+
- **npm** 10+
- **Git** (for version management)
- **Windows** (the build targets Windows NSIS installer)
- **Electron** dependencies may require Visual Studio Build Tools (for native modules)

---

## Architecture Overview

The desktop app bundles three components into a single installer:

```
desktop/
├── main.js              # Electron main process
├── preload.js           # Electron preload script
├── updater.js           # Auto-update logic (electron-updater)
├── package.json         # Electron + electron-builder config
│
resources/app/           # Bundled Next.js client (built)
resources/server/        # Bundled Express server (built)
```

The build process:

1. **Stages** the client and server from the monorepo into temporary directories
2. **Builds** both client and server in those staging directories
3. **Copies** the build outputs into `desktop/resources/`
4. **Runs** `electron-builder` to package everything into a Windows installer

---

## Configuration Files

### `desktop/package.json`

Core Electron and electron-builder config:

```json
{
  "name": "chithra-cinema",
  "productName": "CHITHRA - CINEMA",
  "version": "2.2.6",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "dist": "electron-builder --win nsis",
    "dist:dir": "electron-builder --win dir",
    "publish": "electron-builder --win nsis --publish always"
  },
  "dependencies": {
    "electron-updater": "^6.6.2"
  },
  "build": {
    "appId": "com.chithra.cinema",
    "productName": "CHITHRA - CINEMA",
    "directories": {
      "output": "../release/desktop",
      "buildResources": "assets"
    },
    "files": [
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
      "assets/**"
    ],
    "extraResources": [
      { "from": "resources/app", "to": "app" },
      { "from": "resources/server", "to": "server" }
    ],
    "asar": true,
    "publish": {
      "provider": "github",
      "owner": "Evil-Shown",
      "repo": "E-Shown-Movie-Max",
      "releaseType": "release"
    },
    "win": {
      "target": [{ "target": "nsis", "arch": ["x64"] }],
      "icon": "icon.ico",
      "artifactName": "Chithra-Cinema-Setup-${version}.${ext}"
    },
    "nsis": {
      "oneClick": false,
      "perMachine": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

### `scripts/build-desktop.ps1`

The build script that orchestrates the entire process:

| Step                       | Description                                  |
| -------------------------- | -------------------------------------------- |
| `[1/6] Staging client`     | Copies client source into temp dir           |
| `[2/6] Staging server`     | Copies server source into temp dir           |
| `[3/6] Building client`    | Runs `npm run build` (Next.js) in staging    |
| `[4/6] Building server`    | Runs `npm run build` (TypeScript) in staging |
| `[5/6] Copying resources`  | Copies build outputs to `desktop/resources/` |
| `[6/6] Building installer` | Runs `electron-builder` to produce `.exe`    |

### `scripts/publish-desktop-release.ps1`

The publish script that:

1. Calls `build-desktop.ps1` to produce the installer
2. Runs `npm run publish` (`electron-builder --publish always`) which uploads to GitHub Releases
3. Auto-increment the version number

---

## Build Methods

### 1. Local Build (Full)

Produces an installer in `release/desktop/{version}/`:

```bash
cd desktop
npm run dist
# or
npm run dist -- --config.directories.output="../release/desktop/2.2.6"
```

- Requires all monorepo dependencies installed
- Builds client, server, and Electron in sequence
- Output: `.exe` installer

### 2. Build via Script (Recommended)

The `build-desktop.ps1` script handles staging, building, and packaging:

```powershell
.\scripts\build-desktop.ps1
.\scripts\build-desktop.ps1 -Version 2.3.0
.\scripts\build-desktop.ps1 -NoIncrement
```

**Parameters:**

| Parameter           | Description                                |
| ------------------- | ------------------------------------------ |
| `-Version`          | Override the version (e.g., `2.3.0`)       |
| `-NoIncrement`      | Use current version without incrementing   |
| `-ReleaseNotes`     | Pass release notes as a string             |
| `-ReleaseNotesFile` | Path to a markdown file with release notes |

### 3. Publish (Build + Upload to GitHub)

Builds and uploads to GitHub Releases (which triggers auto-update for installed users):

```bash
npm run package:publish
# or
.\scripts\publish-desktop-release.ps1
```

**Requires:** `GH_TOKEN` set in `scripts/.env` or as `$env:GH_TOKEN`

---

## Build Artifacts

| Profile            | Artifact                             | Location                                  |
| ------------------ | ------------------------------------ | ----------------------------------------- |
| `npm run dist`     | `Chithra-Cinema-Setup-{version}.exe` | `release/desktop/{version}/`              |
| `npm run dist:dir` | Unpacked directory                   | `release/desktop/{version}/win-unpacked/` |
| `npm run publish`  | Installer + auto-update metadata     | Uploaded to GitHub Releases               |

---

## Environment Variables in Builds

### Build-Time (Injected at Build)

The `build-desktop.ps1` script generates `.env` files for the client and server using values from:

| Source                 | Used For                       |
| ---------------------- | ------------------------------ |
| `client/.env.local`    | Client API URL, site name      |
| `server/.env`          | Server API keys, DB connection |
| GitHub Actions Secrets | CI/CD build values             |

### Client `.env.local` (auto-generated during build)

```
NEXT_PUBLIC_GODS_EYE_API_URL=http://127.0.0.1:5000
NEXT_PUBLIC_TBOOM_API_URL=http://127.0.0.1:5000
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000
NEXT_PUBLIC_USE_EMBED_PROXY=false
```

> ⚠️ API keys such as `TMDB_API_KEY` are **never** written to the client env. They stay in `server/.env`.

### Server `.env` (auto-generated during build)

```
PORT=5000
TMDB_API_KEY=...
OMDB_API_KEY=...
WYZIE_API_KEY=...
VIRUSTOTAL_API_KEY=...
```

---

## How Auto-Update Works

The desktop app uses `electron-updater` with GitHub as the update provider:

1. **electron-builder** publishes the installer and `latest.yml` to GitHub Releases
2. **Installed app** checks for updates on launch via `updater.js`
3. **If newer version found** → download progress dialog → restart to install

### Update Configuration

```javascript
// desktop/updater.js
const { autoUpdater } = require("electron-updater");

autoUpdater.setFeedURL({
  provider: "github",
  owner: "Evil-Shown",
  repo: "E-Shown-Movie-Max",
});
```

### Update Channels

The update dialog (`update-dialog.html`) shows:

- Current version
- Available version
- Release notes
- Download progress
- Install / Later buttons

---

## Version Management

Version is managed in two places (synced by `Sync-DesktopShell` in the build script):

| File                                 | Purpose                                |
| ------------------------------------ | -------------------------------------- |
| `scripts/desktop-shell/package.json` | **Source of truth** for version        |
| `desktop/package.json`               | Synced from desktop-shell during build |

### Version Increment

Auto-incremented by the build script (patch +1 by default):

```powershell
.\scripts\build-desktop.ps1                    # 2.2.5 → 2.2.6
.\scripts\build-desktop.ps1 -Version 3.0.0     # Force version
.\scripts\build-desktop.ps1 -NoIncrement       # Keep current
```

---

## Release Notes

Before building, write release notes to:

```
desktop/assets/release-notes.md
```

The build script auto-detects this file. After the build completes, the file is **automatically cleared** to prevent stale notes from being included in future builds.

If no release notes file exists (or it's empty), the script will prompt interactively.

---

## CI/CD Integration

### GitHub Actions Workflow

`.github/workflows/release-desktop.yml` is manually triggered via `workflow_dispatch`:

1. **Validate Secrets** — Checks required secrets are set
2. **Create build env files** — Generates `.env.local` and `.env` from secrets
3. **Build and Publish** — Runs `publish-desktop-release.ps1`
4. **Upload Artifact** — Saves installer as a workflow artifact

### Required GitHub Secrets

| Secret                     | Description                    |
| -------------------------- | ------------------------------ |
| `TMDB_API_KEY`             | The Movie Database API key     |
| `OMDB_API_KEY`             | OMDB API key                   |
| `WYZIE_API_KEY`            | Wyzie streaming API key        |
| `VIRUSTOTAL_API_KEY`       | VirusTotal API key             |
| `UPSTASH_REDIS_REST_URL`   | Redis URL (optional)           |
| `UPSTASH_REDIS_REST_TOKEN` | Redis token (optional)         |
| `GH_TOKEN`                 | GitHub token with `repo` scope |

### Triggering a CI Build

```bash
# Push a tag (or use GitHub UI → Actions → Release Desktop → Run workflow)
git tag desktop-v2.2.6
git push origin desktop-v2.2.6
```

---

## Troubleshooting

| Issue                                      | Solution                                           |
| ------------------------------------------ | -------------------------------------------------- |
| `electron-builder` fails on native modules | Ensure VS Build Tools installed; try `npm rebuild` |
| `CSC_IDENTITY_AUTO_DISCOVERY` error        | Script sets this to `false` automatically          |
| Build hangs on `npm install`               | Check network; try `npm ci` instead                |
| `GH_TOKEN` not found                       | Add to `.env` file or `$env:GH_TOKEN`              |
| `electron-updater` not finding update      | Check GitHub Release has `latest.yml`              |
| Installer blocked by Windows Defender      | Sign the executable or add exclusion               |
| Node.js out of memory during client build  | Use `NODE_OPTIONS=--max_old_space_size=4096`       |

---

## Security Checklist

- [ ] No secrets in `desktop/assets/release-notes.md`
- [ ] `GH_TOKEN` in `.env` is gitignored
- [ ] Server `.env` is not bundled in client resources
- [ ] `VIRUSTOTAL_API_KEY` is server-only

---

## Quick Reference

| Task                    | Command                                    |
| ----------------------- | ------------------------------------------ |
| Build installer locally | `cd desktop && npm run dist`               |
| Build via script        | `.\scripts\build-desktop.ps1`              |
| Build + Publish         | `npm run package:publish`                  |
| Run desktop in dev mode | `cd desktop && npm start`                  |
| View build output       | `.\release\desktop\{version}\`             |
| Set release notes       | Write to `desktop/assets/release-notes.md` |
