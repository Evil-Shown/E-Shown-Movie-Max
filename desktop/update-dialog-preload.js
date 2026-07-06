const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("updateDialog", {
  onInit(callback) {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on("update-dialog:init", handler);
    return () => ipcRenderer.removeListener("update-dialog:init", handler);
  },
  respond(action) {
    ipcRenderer.send("update-dialog:respond", action);
  },
});
