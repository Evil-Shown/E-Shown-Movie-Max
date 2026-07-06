const { app, BrowserWindow, Menu, Tray, nativeImage, shell, session } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const http = require("http");
const fs = require("fs");
const { setupAutoUpdater, checkForUpdates } = require("./updater");
const { isBlockedAdUrl } = require("./block-ad-nav");
const { EMBED_HOST_PATTERNS, getRandomUserAgent, getRandomReferrer } = require("./embed-headers");

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
  const child = spawn(process.execPath, args, {
    cwd,
    env: nodeEnv(extraEnv),
    stdio: packagedLogPipe(),
    windowsHide: true
  });

  child.on("error", (error) => {
    console.error(`Failed to start ${args.join(" ")}:`, error);
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
  return spawnNode([path.join(serverDir, "src", "index.js")], serverDir, {
    PORT: String(API_PORT),
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
  splashWindow = new BrowserWindow({
    width: 460,
    height: 320,
    frame: false,
    resizable: false,
    center: true,
    show: false,
    backgroundColor: "#0a0a0f",
    icon: path.join(__dirname, "assets", "icon.ico")
  });

  splashWindow.loadFile(path.join(__dirname, "splash.html"));
  splashWindow.once("ready-to-show", () => splashWindow?.show());
}

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
    if (isBlockedAdUrl(details.url)) {
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
      headers["User-Agent"] = getRandomUserAgent();
      headers["Referer"] = getRandomReferrer();
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
    return { action: "deny" };
  });

  window.webContents.on("will-navigate", (event, url) => {
    if (isBlockedAdUrl(url) || !isAllowedAppUrl(url)) {
      event.preventDefault();
    }
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    title: "CHITHRA - CINEMA",
    backgroundColor: "#f7f4ef",
    autoHideMenuBar: true,
    icon: path.join(__dirname, "assets", "icon.ico"),
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

  mainWindow.on("close", (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.webContents.once("did-finish-load", () => {
    setTimeout(() => {
      splashWindow?.close();
      splashWindow = null;
      mainWindow?.show();
      mainWindow?.focus();
    }, 500);
  });

  mainWindow.loadURL(`${WEB_URL}?app=desktop`);
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

  createSplashWindow();
  startBackend(serverDir);

  splashWindow?.webContents.executeJavaScript(
    `document.getElementById("status").textContent = "Starting search engine...";`
  ).catch(() => undefined);

  await waitForUrl(API_URL);

  splashWindow?.webContents.executeJavaScript(
    `document.getElementById("status").textContent = "Preparing your library...";`
  ).catch(() => undefined);

  startFrontend(clientDir);
  await waitForUrl(WEB_URL);

  createMainWindow();
  createTray();
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
      configureAdBlocking();
      configureEmbedHeaders();
      setupAutoUpdater();
      checkForUpdates();
      await bootApplication();
    } catch (error) {
      console.error(error);
      app.exit(1);
    }
  });
}

app.on("before-quit", () => {
  app.isQuitting = true;
  stopChildren();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin" && !tray) {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow) {
    mainWindow.show();
  }
});
