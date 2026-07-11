const { app, BrowserWindow, Menu, Tray, nativeImage, shell, session, ipcMain } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const http = require("http");
const fs = require("fs");
const { setupAutoUpdater, checkForUpdates } = require("./updater");
const { isBlockedAdUrl, isEmbedProviderUrl, shouldCancelNetworkRequest } = require("./block-ad-nav");
const { EMBED_HOST_PATTERNS, getStableUserAgent, getRefererForUrl } = require("./embed-headers");
const { setupTelemetry } = require("./telemetry");

// Simple rotating file logger for packaged builds
const LOG_DIR = path.join(app.getPath("userData"), "logs");
const LOG_FILE = path.join(LOG_DIR, "chithra.log");
try { fs.mkdirSync(LOG_DIR, { recursive: true }); } catch {}
function log(level, ...args) {
  const line = `[${new Date().toISOString()}] [${level}] ${args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ")}`;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + "\n"); } catch {}
}
function logInfo(...args) { log("INFO", ...args); }
function logError(...args) { log("ERROR", ...args); }

app.commandLine.appendSwitch("remote-debugging-port", "0");

const API_PORT = 5000;
const WEB_PORT = 3000;
const API_URL = `http://127.0.0.1:${API_PORT}/api/health`;
const WEB_URL = `http://127.0.0.1:${WEB_PORT}`;

/** @type {import("child_process").ChildProcess[]} */
const childProcesses = [];
/** @type {BrowserWindow | null} */
let mainWindow = null;
/** @type {BrowserWindow | null} */
let splashWindow = null;
/** @type {Tray | null} */
let tray = null;

function getPaths() {
  const packaged = app.isPackaged;
  const resourcesRoot = packaged ? process.resourcesPath : path.join(__dirname, "..");

  return {
    clientDir: packaged ? path.join(resourcesRoot, "app") : path.join(resourcesRoot, "client"),
    serverDir: path.join(resourcesRoot, packaged ? "server" : "server"),
    assetsDir: path.join(__dirname, "assets")
  };
}

function nodeEnv(extra = {}) {
  return {
    ...process.env,
    ELECTRON_RUN_AS_NODE: "1",
    ...extra
  };
}

function spawnNode(args, cwd, extraEnv = {}) {
  const label = path.basename(args.find(a => !a.startsWith("-")) || "node");
  const child = spawn(process.execPath, args, {
    cwd,
    env: nodeEnv(extraEnv),
    stdio: packagedLogPipe(),
    windowsHide: true
  });

  if (app.isPackaged && child.stdout && child.stderr) {
    child.stdout.on("data", (data) => {
      logInfo(`[${label}] ${data.toString().trimEnd()}`);
    });
    child.stderr.on("data", (data) => {
      logError(`[${label}] ${data.toString().trimEnd()}`);
    });
  }

  child.on("error", (error) => {
    logError(`Failed to start ${args.join(" ")}:`, error);
  });

  child.on("exit", (code, signal) => {
    logInfo(`[${label}] process exited code=${code} signal=${signal}`);
  });

  childProcesses.push(child);
  return child;
}

function packagedLogPipe() {
  return app.isPackaged ? "pipe" : "inherit";
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    env[key] = value;
  }
  return env;
}

function startBackend(serverDir) {
  const serverEnv = loadEnvFile(path.join(serverDir, ".env"));
  return spawnNode([path.join(serverDir, "dist", "index.js")], serverDir, {
    PORT: String(API_PORT),
    USER_DATA_PATH: app.getPath("userData"),
    ...serverEnv
  });
}

function startFrontend(clientDir) {
  const clientEnv = loadEnvFile(path.join(clientDir, ".env.local"));
  const nextBin = path.join(clientDir, "node_modules", "next", "dist", "bin", "next");

  if (!fs.existsSync(nextBin)) {
    throw new Error(`Next.js binary not found at ${nextBin}. Run the desktop build script first.`);
  }

  return spawnNode([nextBin, "start", "-p", String(WEB_PORT)], clientDir, {
    PORT: String(WEB_PORT),
    NODE_ENV: "production",
    ...clientEnv,
    NEXT_PUBLIC_API_BASE_URL: clientEnv.NEXT_PUBLIC_API_BASE_URL || `http://127.0.0.1:${API_PORT}`,
    NEXT_PUBLIC_GODS_EYE_API_URL: clientEnv.NEXT_PUBLIC_GODS_EYE_API_URL || `http://127.0.0.1:${API_PORT}`,
    NEXT_PUBLIC_TBOOM_API_URL: clientEnv.NEXT_PUBLIC_TBOOM_API_URL || `http://127.0.0.1:${API_PORT}`
  });
}

function waitForUrl(url, timeoutMs = 120000, intervalMs = 500) {
  const started = Date.now();

  return new Promise((resolve, reject) => {
    const tick = () => {
      const req = http.get(url, (res) => {
        res.resume();
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 500) {
          resolve(true);
          return;
        }
        retry();
      });

      req.on("error", retry);
      req.setTimeout(2500, () => {
        req.destroy();
        retry();
      });
    };

    const retry = () => {
      if (Date.now() - started > timeoutMs) {
        reject(new Error(`Timed out waiting for ${url}`));
        return;
      }
      setTimeout(tick, intervalMs);
    };

    tick();
  });
}

function createSplashWindow() {
  const iconPath = path.join(__dirname, "assets", "icon.ico");
  logInfo("Creating splash window", { iconPath, exists: fs.existsSync(iconPath) });

  splashWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1100,
    minHeight: 620,
    frame: false,
    resizable: false,
    center: true,
    show: false,
    backgroundColor: "#0a0a0f",
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    }
  });

  splashWindow.loadFile(path.join(__dirname, "splash.html"));
  splashWindow.once("ready-to-show", () => splashWindow?.show());
}

ipcMain.on("splash-ready", () => {
  // Splash signals it finished its boot animation; give it a moment then close.
  // If the main window has not been created yet or is still loading, keep splash alive.
  setTimeout(() => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      logInfo("Splash animation complete, but main window is not ready yet; keeping splash open");
      return;
    }
    if (mainWindow.webContents.isLoading()) {
      logInfo("Splash animation complete, waiting for main window load before closing splash");
      return;
    }
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close();
      splashWindow = null;
    }
  }, 1500);
});

function isAllowedAppUrl(url) {
  try {
    const parsed = new URL(url);
    return (
      (parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost") &&
      parsed.port === String(WEB_PORT)
    );
  } catch {
    return false;
  }
}

function configureAdBlocking() {
  session.defaultSession.webRequest.onBeforeRequest({ urls: ["*://*/*"] }, (details, callback) => {
    if (shouldCancelNetworkRequest(details)) {
      console.warn("[CHITHRA] Blocked ad navigation:", details.url);
      callback({ cancel: true });
      return;
    }
    callback({});
  });
}

function configureEmbedHeaders() {
  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: EMBED_HOST_PATTERNS },
    (details, callback) => {
      const headers = { ...details.requestHeaders };
      headers["User-Agent"] = getStableUserAgent();
      headers["Referer"] = getRefererForUrl(details.url);
      headers["Accept-Language"] = "en-US,en;q=0.9";
      callback({ requestHeaders: headers });
    }
  );

  session.defaultSession.webRequest.onHeadersReceived({ urls: EMBED_HOST_PATTERNS }, (details, callback) => {
    const headers = { ...details.responseHeaders };
    delete headers["x-frame-options"];
    delete headers["X-Frame-Options"];
    delete headers["content-security-policy"];
    delete headers["Content-Security-Policy"];
    callback({ responseHeaders: headers });
  });
}

function toggleDevTools(window) {
  if (!window || window.isDestroyed()) return;
  if (window.webContents.isDevToolsOpened()) {
    window.webContents.closeDevTools();
  } else {
    window.webContents.openDevTools({ mode: "detach" });
  }
}

function registerDevToolsShortcuts(window) {
  if (app.isPackaged) {
    window.webContents.on("devtools-opened", () => {
      window.webContents.closeDevTools();
    });
    return;
  }

  window.webContents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown" || input.key.toUpperCase() !== "F12") return;
    event.preventDefault();
    toggleDevTools(window);
  });
}

function attachWindowGuards(window) {
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (isBlockedAdUrl(url)) {
      console.warn("[CHITHRA] Blocked ad popup:", url);
      return { action: "deny" };
    }
    if (isEmbedProviderUrl(url)) {
      return { action: "allow" };
    }
    return { action: "deny" };
  });

  window.webContents.on("will-navigate", (event, url) => {
    if (isBlockedAdUrl(url) || !isAllowedAppUrl(url)) {
      event.preventDefault();
    }
  });
}

function createMainWindow() {
  const iconPath = path.join(__dirname, "assets", "icon.ico");
  logInfo("Creating main window", { iconPath, exists: fs.existsSync(iconPath) });

  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    title: "CHITHRA - CINEMA",
    backgroundColor: "#f7f4ef",
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  Menu.setApplicationMenu(null);

  mainWindow.on("page-title-updated", (event) => {
    event.preventDefault();
    mainWindow?.setTitle("CHITHRA - CINEMA");
  });

  attachWindowGuards(mainWindow);
  registerDevToolsShortcuts(mainWindow);

  mainWindow.on("minimize", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("app-window-event", { type: "minimize" });
    }
  });

  mainWindow.on("close", (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("app-window-event", { type: "hide" });
      }
      mainWindow?.hide();
    }
  });

  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    logError("Main window failed to load", { errorCode, errorDescription, url: `${WEB_URL}?app=desktop` });
  });

  mainWindow.webContents.on("render-process-gone", (event, details) => {
    logError("Render process gone", details);
  });

  mainWindow.webContents.on("crashed", (event, killed) => {
    logError("Main window renderer crashed", { killed });
  });

  mainWindow.webContents.once("did-finish-load", () => {
    logInfo("Main window finished loading");
    setTimeout(() => {
      splashWindow?.close();
      splashWindow = null;
      mainWindow?.show();
      mainWindow?.focus();
    }, 500);
  });

  logInfo("Loading main window URL", `${WEB_URL}?app=desktop`);
  mainWindow.loadURL(`${WEB_URL}?app=desktop`).catch((error) => {
    logError("Error loading main window URL", error);
  });
}

function createTray() {
  const iconPath = path.join(__dirname, "assets", "icon.ico");
  if (!fs.existsSync(iconPath)) return;

  tray = new Tray(nativeImage.createFromPath(iconPath));
  tray.setToolTip("CHITHRA - CINEMA");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "Show CHITHRA - CINEMA",
        click: () => {
          mainWindow?.show();
          mainWindow?.focus();
        }
      },
      {
        label: "Check for updates...",
        click: () => checkForUpdates({ manual: true })
      },
      { type: "separator" },
      {
        label: "Quit",
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ])
  );
  tray.on("double-click", () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) {
      mainWindow.focus();
    } else {
      mainWindow.show();
    }
  });
}

function stopChildren() {
  for (const child of childProcesses.splice(0)) {
    try {
      if (!child.killed) child.kill();
    } catch {
      /* ignore */
    }
  }
}

async function bootApplication() {
  const { clientDir, serverDir } = getPaths();
  logInfo("Booting application", { clientDir, serverDir, userData: app.getPath("userData") });

  createSplashWindow();
  startBackend(serverDir);

  splashWindow?.webContents.executeJavaScript(
    `document.getElementById("statusMessage").textContent = "Starting search engine...";`
  ).catch(() => undefined);

  logInfo("Waiting for backend at", API_URL);
  await waitForUrl(API_URL);
  logInfo("Backend ready");

  splashWindow?.webContents.executeJavaScript(
    `document.getElementById("statusMessage").textContent = "Preparing your library...";`
  ).catch(() => undefined);

  startFrontend(clientDir);
  logInfo("Waiting for frontend at", WEB_URL);
  await waitForUrl(WEB_URL);
  logInfo("Frontend ready");

  createMainWindow();
  createTray();
  logInfo("Main window and tray created");
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    try {
      logInfo("App ready");
      configureAdBlocking();
      configureEmbedHeaders();
      setupAutoUpdater({ getMainWindow: () => mainWindow });
      setupTelemetry();
      await bootApplication();
      checkForUpdates();
    } catch (error) {
      logError("Fatal error during boot", error);
      const { dialog } = require("electron");
      dialog.showErrorBox(
        "CHITHRA - CINEMA failed to start",
        `A critical error occurred while starting the app.\n\n${error?.message || error}\n\nLogs: ${LOG_FILE}`
      );
      app.exit(1);
    }
  });
}

app.on("before-quit", () => {
  app.isQuitting = true;
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("app-window-event", { type: "quit" });
  }
  stopChildren();
});

app.on("window-all-closed", () => {
  // Don't quit if the main window is still being created/loaded
  if (mainWindow && !mainWindow.isDestroyed()) {
    return;
  }
  if (process.platform !== "darwin" && !tray) {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow) {
    mainWindow.show();
  }
});
