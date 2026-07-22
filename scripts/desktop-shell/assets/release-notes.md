**CHITHRA — CINEMA v2.3.8**

**Security & Performance Update**

- Added hybrid server architecture — app now opens instantly with sensitive features (movie browsing, auth, watchlist) powered by the cloud backend
- Removed all API keys from the installer — secrets stay securely on the server, never on your machine
- Enabled Electron security hardening — DevTools disabled, code integrity enforced, debugger protection active
- Obfuscated application code — startup logic, ad-blocking rules, and embed headers are now encrypted
- Torrent search and embed proxy continue to work locally for instant results
- Cloud features may take a few seconds to load if the server has been idle

**Bug fixes & improvements**

- Improved error handling when the cloud server is waking up — shows a friendly message instead of a crash
- Added 30-second timeout with retry guidance for cloud requests
- Health check no longer requires database connection in desktop mode
