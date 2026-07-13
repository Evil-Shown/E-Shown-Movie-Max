const { app, BrowserWindow } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const { getStableUserAgent } = require("./embed-headers");
const { showUpdateDialog } = require("./update-dialog");

let updateCheckStarted = false;
let manualCheckActive = false;
/** @type {(() => import("electron").BrowserWindow | null) | null} */
let getMainWindow = null;
/** @type {BrowserWindow | null} */
let progressWindow = null;

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

function closeProgressWindow() {
  if (progressWindow && !progressWindow.isDestroyed()) {
    progressWindow.close();
  }
  progressWindow = null;
}

function sendProgress(payload) {
  if (progressWindow && !progressWindow.isDestroyed()) {
    progressWindow.webContents.send("update-progress:progress", payload);
  }
}

function showDownloadProgress(version) {
  return new Promise((resolve) => {
    closeProgressWindow();

    progressWindow = new BrowserWindow({
      width: 520,
      height: 380,
      frame: false,
      transparent: true,
      resizable: false,
      minimizable: true,
      maximizable: false,
      fullscreenable: false,
      alwaysOnTop: true,
      skipTaskbar: false,
      center: true,
      show: false,
      backgroundColor: "#00000000",
      webPreferences: {
        preload: path.join(__dirname, "update-progress-preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    });

    progressWindow.loadFile(path.join(__dirname, "update-progress.html"));

    progressWindow.webContents.once("did-finish-load", () => {
      progressWindow?.show();
      progressWindow?.webContents.send("update-progress:init", {
        version,
        percent: 0,
        transferred: 0,
        total: 0,
      });
      resolve();
    });

    progressWindow.on("closed", () => {
      progressWindow = null;
    });
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
    manualCheckActive = false;
    const response = await showUpdateDialog({
      parent: getMainWindow?.() || undefined,
      kind: "available",
      currentVersion: app.getVersion(),
      nextVersion: info.version || "unknown",
      releaseNotes: info.releaseNotes,
    });

    if (response === "primary") {
      showDownloadProgress(info.version);
      await autoUpdater.downloadUpdate();
    }
  });

  autoUpdater.on("update-not-available", () => {
    // No popup on startup when already up to date.
    if (manualCheckActive) {
      manualCheckActive = false;
      void showUpdateDialog({
        parent: getMainWindow?.() || undefined,
        kind: "uptodate",
        currentVersion: app.getVersion(),
      });
    }
  });

  autoUpdater.on("download-progress", (progress) => {
    const percent = progress.percent || 0;
    console.log(`[updater] Downloading update: ${Math.round(percent)}%`);
    sendProgress({
      percent,
      transferred: progress.transferred || 0,
      total: progress.total || 0,
    });
  });

  autoUpdater.on("update-downloaded", async (info) => {
    closeProgressWindow();
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
    manualCheckActive = false;
    closeProgressWindow();
    console.error("[updater]", error?.message || error);
    void showUpdateFailureDialog("Could not download the update.", error?.message || "Unknown error");
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
  manualCheckActive = manual;

  autoUpdater.checkForUpdates().catch((error) => {
    manualCheckActive = false;
    console.error("[updater] check failed:", error?.message || error);
    if (manual) {
      void showUpdateFailureDialog("Could not check for updates right now.", error?.message);
    }
  });
}

module.exports = { setupAutoUpdater, checkForUpdates };
