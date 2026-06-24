const { app } = require("electron");
const { autoUpdater } = require("electron-updater");
const { getStableUserAgent } = require("./embed-headers");
const { showUpdateDialog } = require("./update-dialog");

let updateCheckStarted = false;
/** @type {(() => import("electron").BrowserWindow | null) | null} */
let getMainWindow = null;

function formatVersion(version) {
  return version ? `v${version}` : "a new version";
}

async function showUpdateFailureDialog(message, detail) {
  await showUpdateDialog({
    parent: getMainWindow?.() || undefined,
    kind: "available",
    currentVersion: app.getVersion(),
    nextVersion: "unavailable",
    releaseNotes: [
      {
        note: `${message}\n\n${detail || "Check your internet connection and try again later."}`,
      },
    ],
  });
}

function setupAutoUpdater(options = {}) {
  if (!app.isPackaged) return;

  getMainWindow = typeof options.getMainWindow === "function" ? options.getMainWindow : null;

  autoUpdater.requestHeaders = {
    "User-Agent": getStableUserAgent(),
    Accept: "application/vnd.github+json",
  };
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
      void showUpdateDialog({
        parent: getMainWindow?.() || undefined,
        kind: "available",
        currentVersion: app.getVersion(),
        nextVersion: "desktop build",
        releaseNotes: [
          {
            note: "Updates are only checked in the installed desktop app.\n\nRun the packaged CHITHRA - CINEMA installer to test auto-update.",
          },
        ],
      });
    }
    return;
  }

  if (updateCheckStarted && !manual) return;
  updateCheckStarted = true;

  const check = manual ? autoUpdater.checkForUpdatesAndNotify() : autoUpdater.checkForUpdates();

  check.catch((error) => {
    console.error("[updater] check failed:", error?.message || error);
    if (manual) {
      void showUpdateFailureDialog(
        "Could not check for updates right now.",
        error?.message
      );
    }
  });
}

module.exports = { setupAutoUpdater, checkForUpdates };
