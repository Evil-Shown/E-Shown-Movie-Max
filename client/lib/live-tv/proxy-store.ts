/** Server-side URL registry — avoids 414 from nested proxy query strings */

export interface ProxyTarget {
  url: string;
  referer?: string;
  origin?: string;
  expiresAt: number;
}

const TTL_MS = 45 * 60 * 1000;
const MAX_ENTRIES = 8000;

const targets = new Map<string, ProxyTarget>();

function pruneExpired(): void {
  const now = Date.now();
  for (const [sid, entry] of targets) {
    if (entry.expiresAt <= now) targets.delete(sid);
  }
}

function findExisting(url: string, referer?: string, origin?: string): string | null {
  const now = Date.now();
  for (const [sid, entry] of targets) {
    if (
      entry.expiresAt > now &&
      entry.url === url &&
      entry.referer === referer &&
      entry.origin === origin
    ) {
      return sid;
    }
  }
  return null;
}

function createSid(): string {
  return `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}

/** Register upstream target; returns short sid for ?sid= proxy URLs */
export function registerProxyTarget(
  url: string,
  referer?: string,
  origin?: string
): string {
  const existing = findExisting(url, referer, origin);
  if (existing) return existing;

  if (targets.size >= MAX_ENTRIES) pruneExpired();

  const sid = createSid();
  targets.set(sid, {
    url,
    referer,
    origin,
    expiresAt: Date.now() + TTL_MS,
  });
  return sid;
}

export function lookupProxyTarget(sid: string): ProxyTarget | null {
  const entry = targets.get(sid);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    targets.delete(sid);
    return null;
  }
  return entry;
}

export function buildSidProxyUrl(proxyBase: string, sid: string): string {
  return `${proxyBase}?sid=${encodeURIComponent(sid)}`;
}

export const LONG_PROXY_URL_THRESHOLD = 1200;

export function needsSidProxy(url: string): boolean {
  return url.length >= LONG_PROXY_URL_THRESHOLD || url.includes("authToken=");
}
