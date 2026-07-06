const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("chithraDesktop", {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome
  }
});
