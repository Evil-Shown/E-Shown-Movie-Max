const SESSION_KEY = "chithra_startup_splash_launch";
const FULL_INTRO_VERSION_KEY = "chithra_desktop_full_intro_version";

export type StartupSplashMode = "none" | "full" | "spline-only";

/** Dev-only: survives client navigations, resets on a full page reload. */
let devSplashPlayedThisDocument = false;

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
    // Subsequent launches: show just the 3D Spline animation, no cinema intro
    return "spline-only";
  }

  if (process.env.NODE_ENV === "development" && isDevDesktopQuery()) {
    if (devSplashPlayedThisDocument) return "none";
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
    devSplashPlayedThisDocument = true;
  }
}

/** Persist that the full cinema + 3D intro was shown for this app version. */
export function markFullIntroCompleted(): void {
  if (typeof window === "undefined" || !isDesktopApp()) return;
  const appVersion = window.chithraDesktop?.appVersion;
  if (appVersion) localStorage.setItem(FULL_INTRO_VERSION_KEY, appVersion);
}
