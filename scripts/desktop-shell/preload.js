const { contextBridge } = require("electron");
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
});
