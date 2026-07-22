# CHITHRA — CINEMA Desktop

Electron desktop wrapper for **CHITHRA — CINEMA** with auto-update via GitHub Releases.

> **Latest release:** [GitHub Releases](https://github.com/Evil-Shown/Chithra-Cinema/releases)  
> **Installer:** NSIS `.exe` (Windows only)  
> **Build output:** `release/desktop/{version}/`

---

## Table of Contents

1. [Architecture](#architecture)
2. [Build Installer](#build-installer)
3. [Auto-Update System](#auto-update-system)
4. [Publish a New Version](#publish-a-new-version)
5. [Development](#development)
6. [Electron Processes](#electron-processes)
7. [OAuth Bridge](#oauth-bridge)
8. [Project Structure](#project-structure)
9. [Troubleshooting](#troubleshooting)

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Electron Main Process                      │
│  (main.js)                                                    │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  - Creates BrowserWindow                                  │ │
│  │  - Loads Next.js (production build or dev server)         │ │
│  │  - Manages auto-updater (electron-updater)                │ │
│  │  - Handles OAuth relay (custom protocol + nonce)          │ │
│  │  - Manages Tray icon + context menu                       │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────┬───────────────────────────────────┘
                           │ IPC
┌──────────────────────────┴───────────────────────────────────┐
│                    Preload Script                              │
│  (preload.js)                                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  - contextBridge API exposing:                            │ │
│  │    • platform info (os, arch)                             │ │
│  │    • app events (update-available, download-progress,     │ │
│  │      update-downloaded, update-error)                     │ │
│  │    • auto-updater actions (checkForUpdates,               │ │
│  │      downloadUpdate, quitAndInstall)                      │ │
│  │    • OAuth nonce relay                                    │ │
│  │    • window controls (minimize, maximize, close)          │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────┬───────────────────────────────────┘
                           │ contextBridge
┌──────────────────────────┴───────────────────────────────────┐
│                    Renderer Process                            │
│  (Next.js app, wrapped in React)                              │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  - Full CHITHRA — CINEMA Next.js app                     │ │
│  │  - Desktop-specific features:                             │ │
│  │    • Downloads page (offline playback)                    │ │
│  │    • Auto-update notification banner                      │ │
│  │    • Animated download progress window                    │ │
│  │    • Tray-driven update checks                            │ │
│  │    • OAuth flow (opens system browser, relays token back) │ │
│  │    • Startup Spline 3D carousel                           │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Dual-Mode API Architecture

The desktop app runs the Express server in **proxy mode**:

```
Desktop App
├── Local Express Server (RENDER_API_URL set)
│   ├── /api/v1/search     → Torrent search (local, no API keys)
│   ├── /api/v1/embed      → Embed proxy (local, no API keys)
│   └── Everything else    → Proxied to cloud (auth, TMDB, DB)
└── Next.js Client (connects to local Express)
```

This avoids shipping API keys in the desktop binary while keeping search and embed low-latency.

---

## Build Installer

From the project root:

```powershell
# Auto-increment patch version, build installer
npm run package

# Build current version without incrementing
npm run package:current

# Build a specific version
npm run package:version 2.3.0
```

### Output

```
release/desktop/
  └── {version}/
      ├── Chithra-Cinema-Setup-{version}.exe      ← NSIS installer
      ├── Chithra-Cinema-Setup-{version}.exe.blockmap
      ├── latest.yml                               ← electron-updater manifest
      ├── builder-debug.yml                        ← electron-builder debug log
      ├── builder-effective-config.yaml            ← Resolved build config
      ├── release-notes.md                         ← Auto-generated release notes
      └── win-unpacked/                            ← Unpacked app (for testing)
```

### Build Pipeline

```
scripts/build-desktop.ps1
  1. Reads current version from release/desktop/ (or uses provided version)
  2. Increments patch number (unless -NoIncrement flag)
  3. Creates .env file with RENDER_API_URL for desktop proxy mode
  4. Copies desktop-shell source to desktop/
  5. Runs npm install in desktop/
  6. Runs npm run build (builds Next.js + Electron)
  7. Runs electron-builder (NSIS)
  8. Outputs to release/desktop/{new-version}/
```

### Build Configuration (electron-builder)

- **App ID**: `com.chithra.cinema`
- **Product name**: `Chithra Cinema`
- **Compression**: Maximum (LZMA2)
- **NSIS options**:
  - Per-machine installation (all users)
  - Desktop shortcut
  - Start menu folder
  - Uninstaller
  - Auto-launch on startup (optional)
- **Files included**: Next.js production build, Express server (prebuilt), Electron shell

---

## Auto-Update System

Uses `electron-updater` with **GitHub Releases** as the update server.

### Update Flow

```
App startup
  │
  ├── Check for updates ──────► GitHub Releases API
  │                                │
  │                          Latest version > current?
  │                                │
  │                           Yes ──► Show "Update Available" dialog
  │                                     │
  │                              "Download update" ──► Download progress
  │                              │                        │
  │                              │               Animated progress window
  │                              │               (keeps user informed on slow networks)
  │                              │                        │
  │                              │               Download complete ──► "Restart Now" / "Later"
  │                              │
  │                              "Not now" ──► Dismiss (checks again next launch)
  │
  ├── Tray menu ──► "Check for updates…" ──► Same flow as above
  │
  └── Notification ──► "Update available" (even when app is running)
```

### electron-updater Config

```yaml
provider: github
owner: Evil-Shown
repo: Chithra-Cinema
private: false
releaseType: release
```

### Key Behaviors

- **Auto-update disabled** when running from source (`electron .`)
- **Download progress** shown in an animated modal window (Framer Motion)
- **Silent background download** — user can continue using app
- **Restart prompt** — "Restart now" opens the new version immediately
- **Tray integration** — right-click tray icon → "Check for updates…"
- **Update manifest**: `latest.yml` (generated by electron-builder during publish)

---

## Publish a New Version

### GitHub Actions (Recommended)

1. **Add repository secrets** (Settings → Secrets and variables → Actions):

| Secret | Required | Description |
|---|---|---|
| `TMDB_API_KEY` | Yes | TMDB API key |
| `OMDB_API_KEY` | No | OMDB API key |
| `WYZIE_API_KEY` | No | Wyzie subtitles key |
| `VIRUSTOTAL_API_KEY` | No | VirusTotal key |

2. **Run the workflow:**

```powershell
# Auto-increment patch version, build, and publish
npm run release:desktop

# Or specify a version
gh workflow run release-desktop.yml -f version=2.3.0
```

Or use the GitHub UI: **Actions → Release Desktop → Run workflow**.

**What the workflow does:**
1. Validates that all required secrets exist
2. Creates `.env` files for desktop proxy mode
3. Runs `scripts/publish-desktop-release.ps1`
4. Builds the NSIS installer
5. Publishes to GitHub Releases
6. Uploads the `.exe` as a workflow artifact

### Local Publish (Manual)

1. **Create a GitHub personal access token** with `repo` scope.

2. **Run the publish command:**

```powershell
$env:GH_TOKEN = "ghp_your_token_here"

# Build + publish (auto-increment patch)
npm run package:publish

# Publish current version
npm run package:publish:current

# Publish specific version
npm run package:publish:version 2.3.0
```

Or use the PowerShell script directly:

```powershell
$env:GH_TOKEN = "ghp_your_token_here"
.\scripts\publish-desktop-release.ps1 -Version 2.3.0
```

**What publish does:**
1. Builds the installer (same as `npm run package`)
2. Creates a GitHub Release with the version tag
3. Uploads the `.exe` installer
4. Uploads `latest.yml` (auto-update manifest)
5. Uploads `release-notes.md`

### Post-Publish

- Installed users will be prompted on next launch (or can check via tray menu)
- The `latest.yml` file is the critical piece — without it, auto-update won't detect the new version
- Old versions in `release/desktop/` can be cleaned up (only the latest matters)

---

## Development

### Prerequisites

- Node.js 22+
- npm 10+

### Setup

```powershell
cd desktop
npm install
npm start
```

**Important:** Auto-update is disabled when running from source.

### Dev Workflow

The `desktop/` directory is **generated** by the build scripts — it's not tracked in git. When working on the shell itself, edit files in `scripts/desktop-shell/` and rebuild.

```powershell
# After editing shell files:
npm run package:current
# Then test the installer output
```

### Debugging

- **DevTools**: `Ctrl+Shift+I` in the Electron window
- **Logs**: Console output in the terminal where `npm start` was run
- **auto-updater logs**: Enabled in dev mode via `require("electron-log").transports.console.level`

---

## Electron Processes

### Main Process (`main.js`)

| Responsibility | Implementation |
|---|---|
| BrowserWindow creation | `new BrowserWindow({ width: 1280, height: 720, ... })` |
| Window config | Frameless (`frame: false`) on Windows, min size 800x600, icon |
| URL loading | Production: `loadFile(renderer/dist/index.html)`; Dev: `loadURL(http://localhost:3000)` |
| Auto-updater | `electron-updater` with GitHub provider |
| Tray icon | System tray with context menu (Check for updates, About, Quit) |
| Custom protocol | `chithra-cinema://` protocol for OAuth callback relay |
| IPC handlers | Update events, window controls, OAuth nonce relay |

### Preload Script (`preload.js`)

Exposes a safe API via `contextBridge.exposeInMainWorld`:

```typescript
window.electronAPI = {
  // Platform info
  platform: string,        // "win32" | "darwin" | "linux"
  arch: string,            // "x64" | "arm64"

  // Auto-update event listeners
  onUpdateAvailable(callback: (info: UpdateInfo) => void): void
  onDownloadProgress(callback: (percent: number) => void): void
  onUpdateDownloaded(callback: () => void): void
  onUpdateError(callback: (error: string) => void): void

  // Auto-update actions
  checkForUpdates(): Promise<UpdateCheckResult | null>
  downloadUpdate(): Promise<void>
  quitAndInstall(): void

  // Window controls
  minimizeWindow(): void
  maximizeWindow(): void
  closeWindow(): void

  // OAuth relay
  relayAuthToken(nonce: string, token: string): Promise<boolean>
}
```

### Renderer Process

The Next.js app running in Electron has access to `window.electronAPI` for desktop-specific features:

- **Auto-update banner**: Listens for `onUpdateAvailable` and shows a notification
- **Download progress modal**: Animated Framer Motion window showing percentage
- **Downloads page**: `/downloads` uses Electron's file system for offline storage
- **OAuth flow**: `/auth/callback` calls `window.electronAPI.relayAuthToken()` to pass the token back to main process

---

## OAuth Bridge

When a user logs in via Google/GitHub OAuth on the desktop app:

```
1. User clicks "Login with Google"
2. Renderer calls main process via IPC
3. Main process opens system browser with OAuth URL
4. User authenticates in browser
5. Browser redirects to custom protocol: chithra-cinema://auth/callback?token=...
6. Main process captures the URL via app.on('open-url')
7. Main process stores the token and generates a nonce
8. Renderer polls /api/auth/claim-relay with the nonce
9. Server returns the token (one-time use)
10. Renderer completes authentication
```

This system avoids exposing the auth token to the system browser's redirect handling and works around Electron's OAuth limitations.

---

## Project Structure

```
scripts/desktop-shell/          ← Source code (tracked in git)
├── main.js                     ← Electron main process
├── preload.js                  ← Context bridge
├── renderer/                   ← React renderer (update UI)
│   ├── index.html
│   ├── index.tsx
│   ├── App.tsx                 ← Main app component
│   ├── components/
│   │   ├── UpdateBanner.tsx    ← Update notification banner
│   │   ├── DownloadProgress.tsx ← Animated progress modal
│   │   └── ...
│   ├── hooks/
│   │   └── useAutoUpdater.ts   ← Auto-update hook
│   └── styles/
│
├── package.json                ← Electron dependencies
└── electron-builder.yml         ← Build config

desktop/                        ← Generated build output (git-ignored)
├── main.js                     ← Copied from desktop-shell
├── preload.js                  ← Copied from desktop-shell
├── package.json
├── node_modules/
├── renderer/                   ← Built React renderer
└── ...

release/desktop/                ← Installer output (git-ignored)
└── {version}/
    ├── Chithra-Cinema-Setup-{version}.exe
    ├── latest.yml
    └── ...
```

---

## Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| **Auto-update not prompting** | No newer GitHub Release exists | Publish a new version via GitHub Actions or local publish |
| **"Download update" stuck** | `GH_TOKEN` missing or insufficient permissions | Ensure token has `repo` scope |
| **OAuth login fails** | Custom protocol (`chithra-cinema://`) not registered | Run installer (protocol registered during install); on dev, register manually |
| **App won't start** | Missing `RENDER_API_URL` in `.env` | Build via `npm run package` which auto-generates `.env` |
| **Blank white screen** | Next.js build not found | Run `npm run package:current` to rebuild, or start Next.js dev server separately |
| **CORS errors in network tab** | Express proxy mode not receiving requests | Check `RENDER_API_URL` is set and accessible |
| **Installer fails** | Antivirus blocking NSIS | Add exclusion for `release/desktop/` or sign the installer |
| **"Update available" every launch** | `latest.yml` not uploaded with release | Re-publish to ensure manifest is uploaded |
| **Tray icon not showing** | Missing tray icon asset | Check `icon.ico` exists in project root |
| **DevTools shortcut not working** | Dev mode only | Open via Electron menu: View → Toggle Developer Tools |

---

## License

**Copyright © 2026 CHITHRA — CINEMA. All rights reserved.**

This desktop wrapper, build scripts, and associated logic are proprietary. Copying, modifying, reverse engineering, or redistributing any part of this software is strictly prohibited.
