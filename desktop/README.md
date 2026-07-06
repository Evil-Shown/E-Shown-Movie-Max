# Chithra Cinema Desktop

Electron wrapper for a native Windows app experience.

## Build installer

From project root:

```powershell
npm run package
```

Or double-click `scripts/build-desktop.bat`.

**Requires before build:**
- `client/.env.local` (TMDB + OMDB keys)
- `server/.env` (VirusTotal key)

**Output:**
```
release/desktop/Chithra-Cinema-Setup-1.0.0.exe
```

## What your friend gets

- Windows installer (NSIS)
- Desktop + Start Menu shortcut: **Chithra Cinema**
- No Node.js install
- No CMD windows
- Splash screen on launch
- System tray icon (double-click to restore)

## Dev mode (Electron shell only)

After client + server are built and `desktop/resources/` populated:

```powershell
cd desktop
npm install
npm start
```

For full local dev, use `client/npm run dev` and `server/npm run dev` as usual.

## Portable zip (legacy)

```powershell
npm run package:portable
```
