const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("chithraDesktop", {
  isDesktopApp: true,
  platform: process.platform,
  appVersion: process.env.CHITHRA_APP_VERSION || "unknown",
  launchId: process.env.CHITHRA_LAUNCH_ID || "",
  launchDay: process.env.CHITHRA_LAUNCH_DAY || ""
});
