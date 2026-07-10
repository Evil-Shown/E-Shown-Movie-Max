# CHITHRA — CINEMA

**චිත්‍ර — Cinema** — Sri Lanka's streaming platform for films, series, and The God's Eye upload search.

A full-stack cinema app with a cinematic Next.js frontend and a lightweight Express backend.

## Tech Stack

- Frontend: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- Desktop: Electron + electron-builder (Windows installer)
- Backend: Node.js, Express 5
- UI/Animations: Framer Motion, Three.js

## Project Structure

```text
CHITHRA — CINEMA/
  client/                 # Next.js frontend + API routes
  mobile/                 # Expo React Native app
  server/                 # Express API (God's Eye search, VirusTotal)
  packages/core/          # Shared types, movies, providers, TMDB client
  scripts/desktop-shell/  # Electron desktop shell (source)
  scripts/                # Packaging & installer build
```

`desktop/` is generated at build time by `scripts/build-desktop.ps1` and is not tracked in git.

## Workspace commands

```bash
npm install          # install all workspaces
npm run dev          # turbo: dev in all apps
npm run build        # turbo: build all apps
```

## Quick Start

1. `cd client && npm install`
2. `cd ../server && npm install`
3. Copy `client/.env.example` → `client/.env.local`
4. Copy `server/.env.example` → `server/.env`
5. Run:
   - Frontend: `cd client && npm run dev`
   - Backend: `cd server && npm run dev`
6. Open [http://localhost:3000](http://localhost:3000)

## Build Windows Installer

```powershell
npm run package
```

Output: `release/desktop/Chithra-Cinema-Setup-1.0.0.exe`

## Publish update (auto-update for installed users)

Bump `scripts/desktop-shell/package.json` version, then:

```powershell
$env:GH_TOKEN = "your_github_token"
npm run package:publish
```

Installed apps check [GitHub Releases](https://github.com/Evil-Shown/E-Shown-Movie-Max/releases) on startup and prompt users to accept or skip updates.

See `scripts/desktop-shell/README.md` for details.

## Portable zip (legacy)

```powershell
npm run package:portable
```

## ⚖️ License & Intellectual Property Restriction

**Copyright © 2026 CHITHRA — CINEMA. All rights reserved.**

This software and its entire codebase (including frontend, backend, desktop wrapper, scraping scripts, and configuration files) are strictly **proprietary** and **confidential**. 

### Restrictions:
- **No Copying/Cloning**: You are strictly prohibited from copying, cloning, duplicating, or mimicking any part of this project, its code structure, or its features.
- **No Redistribution**: You may not distribute, host, publish, or sublicense the source code or binaries to any third party.
- **No Modification**: You may not modify, alter, or create derivative works of this codebase.
- **No Reverse Engineering**: Any attempt to decompile, reverse engineer, or decrypt the packaged Electron application (`.asar`) or binary installer is strictly prohibited and subject to legal action.

By accessing this codebase, you agree to keep the code confidential. Unauthorized use, copying, or distribution will result in immediate termination of access and legal action.
