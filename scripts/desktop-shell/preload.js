const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("chithraDesktop", {
  isDesktopApp: true,
  platform: process.platform
});
