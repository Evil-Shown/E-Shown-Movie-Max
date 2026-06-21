const { BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { formatReleaseNotesHtml } = require("./release-notes");

/** @type {BrowserWindow | null} */
let activeDialog = null;

function getDialogPath(fileName) {
  return path.join(__dirname, fileName);
}

function closeActiveDialog() {
  if (activeDialog && !activeDialog.isDestroyed()) {
    activeDialog.destroy();
  }
  activeDialog = null;
}

/**
 * @param {{
 *   parent?: import("electron").BrowserWindow | null,
 *   kind: "available" | "ready",
 *   currentVersion?: string,
 *   nextVersion?: string,
 *   releaseNotes?: string | Array<{ note?: string } | string>,
 * }} options
 * @returns {Promise<"primary" | "secondary">}
 */
function showUpdateDialog(options) {
  closeActiveDialog();

  return new Promise((resolve) => {
    const dialogWindow = new BrowserWindow({
      parent: options.parent || undefined,
      modal: Boolean(options.parent),
      width: 500,
      height: 620,
      show: false,
      frame: false,
      transparent: true,
      resizable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      skipTaskbar: true,
      autoHideMenuBar: true,
      webPreferences: {
        preload: getDialogPath("update-dialog-preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

    activeDialog = dialogWindow;
    let settled = false;

    const finish = (action) => {
      if (settled) return;
      settled = true;
      ipcMain.removeListener("update-dialog:respond", onRespond);
      closeActiveDialog();
      resolve(action);
    };

    const onRespond = (event, action) => {
      if (event.sender !== dialogWindow.webContents) return;
      finish(action === "primary" ? "primary" : "secondary");
    };

    ipcMain.on("update-dialog:respond", onRespond);

    dialogWindow.on("closed", () => {
      if (!settled) {
        settled = true;
        ipcMain.removeListener("update-dialog:respond", onRespond);
        activeDialog = null;
        resolve("secondary");
      }
    });

    dialogWindow.webContents.on("will-navigate", (event) => {
      event.preventDefault();
    });

    dialogWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

    dialogWindow.webContents.once("did-finish-load", () => {
      dialogWindow.webContents.send("update-dialog:init", {
        kind: options.kind,
        currentVersion: options.currentVersion || "",
        nextVersion: options.nextVersion || "",
        notesHtml:
          options.kind === "available" ? formatReleaseNotesHtml(options.releaseNotes) : "",
      });
      dialogWindow.show();
      dialogWindow.focus();
    });

    dialogWindow.loadFile(getDialogPath("update-dialog.html")).catch(() => {
      finish("secondary");
    });
  });
}

module.exports = { showUpdateDialog, closeActiveDialog };
