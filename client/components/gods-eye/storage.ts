import { RECENT_KEY, loadRecentSearches } from "@/utils/parseQuery";
import type { ContinueWatching } from "./types";
import { resolveApiBaseAbsolute } from "@/lib/api-base";

export const API_BASE_URL = resolveApiBaseAbsolute();

export const CONTINUE_KEY = "chithra_continue";

export function getInitialRecentSearches() {
  if (typeof window === "undefined") return [];
  const legacy = localStorage.getItem("tboom_recent_searches");
  const modern = localStorage.getItem("gods_eye_recent");
  if (legacy && !localStorage.getItem(RECENT_KEY)) {
    try {
      localStorage.setItem(RECENT_KEY, legacy);
    } catch {
      /* ignore */
    }
  }
  if (modern && !localStorage.getItem(RECENT_KEY)) {
    try {
      localStorage.setItem(RECENT_KEY, modern);
    } catch {
      /* ignore */
    }
  }
  return loadRecentSearches();
}

export function loadContinueWatching(): ContinueWatching | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONTINUE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ContinueWatching;
  } catch {
    return null;
  }
}

export function clearContinueWatching() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CONTINUE_KEY);
}
