const { app, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const { showUpdateDialog } = require("./update-dialog");

let updateCheckStarted = false;
/** @type {(() => import("electron").BrowserWindow | null) | null} */
let getMainWindow = null;

function formatVersion(version) {
  return version ? `v${version}` : "a new version";
}

function setupAutoUpdater(options = {}) {
  if (!app.isPackaged) return;

  getMainWindow = typeof options.getMainWindow === "function" ? options.getMainWindow : null;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowDowngrade = false;

  autoUpdater.on("update-available", async (info) => {
    const response = await showUpdateDialog({
      parent: getMainWindow?.() || undefined,
      kind: "available",
      currentVersion: app.getVersion(),
      nextVersion: info.version || "unknown",
      releaseNotes: info.releaseNotes,
    });

    if (response === "primary") {
      await autoUpdater.downloadUpdate();
    }
  });

  autoUpdater.on("update-not-available", () => {
    // No popup on startup when already up to date.
  });

  autoUpdater.on("download-progress", (progress) => {
    const percent = Math.round(progress.percent || 0);
    console.log(`[updater] Downloading update: ${percent}%`);
  });

  autoUpdater.on("update-downloaded", async (info) => {
    const response = await showUpdateDialog({
      parent: getMainWindow?.() || undefined,
      kind: "ready",
      currentVersion: app.getVersion(),
      nextVersion: info.version || "unknown",
    });

    if (response === "primary") {
      app.isQuitting = true;
      autoUpdater.quitAndInstall(false, true);
    }
  });

  autoUpdater.on("error", (error) => {
    console.error("[updater]", error?.message || error);
  });
}

function checkForUpdates({ manual = false } = {}) {
  if (!app.isPackaged) {
    if (manual) {
      dialog.showMessageBox({
        type: "info",
        title: "Updates",
        message: "Updates are only checked in the installed desktop app.",
        detail: "Run the packaged CHITHRA - CINEMA installer to test auto-update.",
      });
    }
    return;
  }

  if (updateCheckStarted && !manual) return;
  updateCheckStarted = true;

  autoUpdater.checkForUpdates().catch((error) => {
    console.error("[updater] check failed:", error?.message || error);
    if (manual) {
      dialog.showMessageBox({
        type: "warning",
        title: "Update check failed",
        message: "Could not check for updates right now.",
        detail: error?.message || "Check your internet connection and try again.",
      });
    }
  });
}

module.exports = { setupAutoUpdater, checkForUpdates };
