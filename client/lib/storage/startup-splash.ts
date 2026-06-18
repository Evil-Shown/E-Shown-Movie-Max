const SESSION_KEY = "chithra_startup_splash_launch";
const FULL_INTRO_VERSION_KEY = "chithra_desktop_full_intro_version";
const DEV_SESSION_KEY = "chithra_startup_splash_dev";

export type StartupSplashMode = "none" | "full" | "spline-only";

function isDevDesktopQuery(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("app") === "desktop";
}

function isDesktopApp(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.chithraDesktop?.isDesktopApp);
}

/** Whether this page load should show a startup splash (once per app launch). */
export function getStartupSplashMode(): StartupSplashMode {
  if (typeof window === "undefined") return "none";

  if (isDesktopApp()) {
    const launchId = window.chithraDesktop?.launchId;
    if (!launchId) return "none";
    if (sessionStorage.getItem(SESSION_KEY) === launchId) return "none";

    const appVersion = window.chithraDesktop?.appVersion || "0";
    const lastFullIntroVersion = localStorage.getItem(FULL_INTRO_VERSION_KEY);
    if (lastFullIntroVersion !== appVersion) return "full";
    return "spline-only";
  }

  if (process.env.NODE_ENV === "development" && isDevDesktopQuery()) {
    if (sessionStorage.getItem(DEV_SESSION_KEY) === "1") return "none";
    return "full";
  }

  return "none";
}

/** Call when the splash sequence begins so route changes cannot replay it. */
export function markStartupSplashStarted(mode: StartupSplashMode): void {
  if (typeof window === "undefined" || mode === "none") return;

  if (isDesktopApp()) {
    const launchId = window.chithraDesktop?.launchId;
    if (launchId) sessionStorage.setItem(SESSION_KEY, launchId);
    return;
  }

  if (process.env.NODE_ENV === "development") {
    sessionStorage.setItem(DEV_SESSION_KEY, "1");
  }
}

/** Persist that the full cinema + 3D intro was shown for this app version. */
export function markFullIntroCompleted(): void {
  if (typeof window === "undefined" || !isDesktopApp()) return;
  const appVersion = window.chithraDesktop?.appVersion;
  if (appVersion) localStorage.setItem(FULL_INTRO_VERSION_KEY, appVersion);
}
