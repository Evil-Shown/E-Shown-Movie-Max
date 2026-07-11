const { contextBridge, ipcRenderer } = require("electron");

/** @type {((payload: unknown) => void) | null} */
let initCallback = null;
/** @type {unknown} */
let initPayload = null;

ipcRenderer.on("update-progress:init", (_event, payload) => {
  initPayload = payload;
  if (initCallback) initCallback(payload);
});

ipcRenderer.on("update-progress:progress", (_event, payload) => {
  if (initCallback) initCallback(payload);
});

contextBridge.exposeInMainWorld("updateProgress", {
  onInit(callback) {
    initCallback = callback;
    if (initPayload) callback(initPayload);
  },
});
