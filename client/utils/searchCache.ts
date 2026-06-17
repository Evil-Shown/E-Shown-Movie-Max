const PREFIX = "gods_eye_cache_";
const LEGACY_PREFIX = "tboom_cache_";
const TTL_MS = 5 * 60 * 1000;

type CacheEntry<T> = {
  ts: number;
  data: T;
};

function hashQuery(query: string): string {
  let h = 0;
  for (let i = 0; i < query.length; i++) {
    h = (h << 5) - h + query.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

export function getCachedSearch<T>(query: string): T | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const key = `${PREFIX}${hashQuery(query)}`;
    const legacyKey = `${LEGACY_PREFIX}${hashQuery(query)}`;
    const raw = sessionStorage.getItem(key) ?? sessionStorage.getItem(legacyKey);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.ts > TTL_MS) {
      sessionStorage.removeItem(key);
      sessionStorage.removeItem(legacyKey);
      return null;
    }
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, raw);
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function setCachedSearch<T>(query: string, data: T): void {
  if (typeof sessionStorage === "undefined") return;
  const entry: CacheEntry<T> = { ts: Date.now(), data };
  sessionStorage.setItem(`${PREFIX}${hashQuery(query)}`, JSON.stringify(entry));
}

export function invalidateSearchCache(query?: string): void {
  if (typeof sessionStorage === "undefined") return;
  if (query) {
    sessionStorage.removeItem(`${PREFIX}${hashQuery(query)}`);
    return;
  }
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(PREFIX)) sessionStorage.removeItem(key);
  }
}

export function shouldBypassCache(query: string): boolean {
  return query.trim().startsWith("!");
}

export function stripCacheBypass(query: string): string {
  return query.trim().replace(/^!+/, "").trim();
}
