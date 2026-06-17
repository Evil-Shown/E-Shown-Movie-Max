const { app, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");

let updateCheckStarted = false;

function formatVersion(version) {
  return version ? `v${version}` : "a new version";
}

function setupAutoUpdater() {
  if (!app.isPackaged) return;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowDowngrade = false;

  autoUpdater.on("update-available", async (info) => {
    const current = app.getVersion();
    const next = info.version || "unknown";
    const notes = info.releaseNotes
      ? typeof info.releaseNotes === "string"
        ? info.releaseNotes
        : ""
      : "";

    const { response } = await dialog.showMessageBox({
      type: "info",
      buttons: ["Download update", "Not now"],
      defaultId: 0,
      cancelId: 1,
      title: "Update available",
      message: `CHITHRA - CINEMA ${formatVersion(next)} is available.`,
      detail: [
        `Installed: ${formatVersion(current)}`,
        notes ? `\n${notes}` : "",
        "\nDownload and install the update?"
      ]
        .join("")
        .trim()
    });

    if (response === 0) {
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
    const { response } = await dialog.showMessageBox({
      type: "info",
      buttons: ["Restart now", "Later"],
      defaultId: 0,
      cancelId: 1,
      title: "Update ready",
      message: `${formatVersion(info.version)} has been downloaded.`,
      detail: "Restart CHITHRA - CINEMA to finish installing the update."
    });

    if (response === 0) {
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
        detail: "Run the packaged CHITHRA - CINEMA installer to test auto-update."
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
        detail: error?.message || "Check your internet connection and try again."
      });
    }
  });
}

module.exports = { setupAutoUpdater, checkForUpdates };
