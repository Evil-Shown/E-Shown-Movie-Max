const LAST_DAY_KEY = "chithra_desktop_last_day";
const LAST_LAUNCH_KEY = "chithra_desktop_launch_id";
const EPHEMERAL_SESSION_PREFIXES = ["gods_eye_cache_", "tmdb_"];
const EPHEMERAL_LOCAL_KEYS = ["chithra-provider-performance", "chithra-stream-provider"];

function isDesktopApp() {
  if (typeof window === "undefined") return false;
  return Boolean(window.chithraDesktop?.isDesktopApp);
}

function todayToken() {
  return new Date().toISOString().slice(0, 10);
}

function clearSessionPrefixes(prefixes: string[]) {
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (key && prefixes.some((prefix) => key.startsWith(prefix))) {
      sessionStorage.removeItem(key);
    }
  }
}

export function syncDesktopSession() {
  if (!isDesktopApp() || typeof window === "undefined") return false;

  const launchId = window.chithraDesktop?.launchId || "";
  const launchDay = window.chithraDesktop?.launchDay || todayToken();
  const storedLaunchId = localStorage.getItem(LAST_LAUNCH_KEY);
  const storedDay = localStorage.getItem(LAST_DAY_KEY);
  const shouldReset = storedLaunchId !== launchId || storedDay !== launchDay;

  if (!shouldReset) return false;

  clearSessionPrefixes(EPHEMERAL_SESSION_PREFIXES);
  for (const key of EPHEMERAL_LOCAL_KEYS) {
    localStorage.removeItem(key);
  }

  localStorage.setItem(LAST_LAUNCH_KEY, launchId);
  localStorage.setItem(LAST_DAY_KEY, launchDay);
  return true;
}
