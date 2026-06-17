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
  client/   # Next.js frontend
  server/   # Express API (God's Eye search, VirusTotal)
  desktop/  # Electron desktop shell
  scripts/  # Packaging & installer build
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

## Portable zip (legacy)

```powershell
npm run package:portable
```
