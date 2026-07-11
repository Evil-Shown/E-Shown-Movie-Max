const { contextBridge, ipcRenderer } = require("electron");
const pkg = require("./package.json");

const launchDay = new Date().toISOString().slice(0, 10);
const launchId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

contextBridge.exposeInMainWorld("chithraDesktop", {
  isDesktopApp: true,
  platform: process.platform,
  appVersion: pkg.version,
  launchId,
  launchDay,
  signalSplashReady: () => ipcRenderer.send("splash-ready"),
  onAppWindowEvent: (callback) => {
    const handler = (_event, payload) => callback(payload?.type ?? "");
    ipcRenderer.on("app-window-event", handler);
    return () => ipcRenderer.removeListener("app-window-event", handler);
  },
});
