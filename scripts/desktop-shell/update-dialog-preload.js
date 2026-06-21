const { contextBridge, ipcRenderer } = require("electron");

/** @type {((payload: unknown) => void) | null} */
let initCallback = null;
/** @type {unknown} */
let initPayload = null;

ipcRenderer.on("update-dialog:init", (_event, payload) => {
  initPayload = payload;
  if (initCallback) initCallback(payload);
});

contextBridge.exposeInMainWorld("updateDialog", {
  onInit(callback) {
    initCallback = callback;
    if (initPayload) callback(initPayload);
  },
  respond(action) {
    ipcRenderer.send("update-dialog:respond", action);
  },
});
