import { cacheGetJson, cacheSetJson, cacheSetStringNx, redisKey, cacheDelete } from "@/lib/cache/redis";

export { buildCacheKey } from "@chithra/core/cache";

const LOCK_TTL_SECONDS = 30;
const STALE_MULTIPLIER = 10; // stale data lives 10x longer than fresh TTL

interface SwrEntry<T> {
  data: T;
  storedAt: number;
}

/**
 * Stale-While-Revalidate + Distributed Single-Flight cache.
 *
 * - Fresh data (within ttlMs) is returned immediately.
 * - Stale data (within staleTtlMs) is returned immediately, and a background
 *   refresh is triggered (only one instance will do the refresh via Redis lock).
 * - Cache miss: only one server instance fetches (Redis lock); others poll for
 *   the result.
 *
 * This replaces the in-memory `inFlight` Map that only worked on a single instance.
 */
export async function cacheJson<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>
): Promise<T> {
  const storeKey = redisKey("cache", key);
  const staleKey = redisKey("cache:stale", key);
  const lockKey = redisKey("cache:lock", key);
  const ttlSeconds = Math.max(1, Math.ceil(ttlMs / 1000));
  const staleTtlSeconds = ttlSeconds * STALE_MULTIPLIER;
  const now = Date.now();

  // 1. Try fresh cache
  const fresh = await cacheGetJson<SwrEntry<T>>(storeKey);
  if (fresh && now - fresh.storedAt < ttlMs) {
    return fresh.data;
  }

  // 2. Try stale cache (serve stale while revalidating in background)
  const stale = await cacheGetJson<SwrEntry<T>>(staleKey);
  if (stale) {
    // Trigger background refresh (fire-and-forget)
    triggerBackgroundRefresh(storeKey, staleKey, lockKey, ttlSeconds, loader).catch(() => {
      // Background refresh failure is non-fatal — stale data is still served
    });
    return stale.data;
  }

  // 3. Cache miss — use distributed single-flight
  return singleFlightFetch(storeKey, staleKey, lockKey, ttlSeconds, staleTtlSeconds, loader);
}

/**
 * Background refresh with Redis lock.
 * Only one instance refreshes at a time; others skip.
 */
async function triggerBackgroundRefresh<T>(
  storeKey: string,
  staleKey: string,
  lockKey: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<void> {
  // Try to acquire lock (non-blocking, SETNX)
  const acquired = await cacheSetStringNx(lockKey, "1", LOCK_TTL_SECONDS);
  if (!acquired) {
    // Another instance is already refreshing
    return;
  }

  try {
    const data = await loader();
    const entry: SwrEntry<T> = { data, storedAt: Date.now() };
    await Promise.all([
      cacheSetJson(storeKey, entry, ttlSeconds),
      cacheSetJson(staleKey, entry, ttlSeconds * STALE_MULTIPLIER),
    ]);
  } finally {
    await cacheDelete(lockKey);
  }
}

/**
 * Distributed single-flight: only one instance fetches, others poll for the result.
 */
async function singleFlightFetch<T>(
  storeKey: string,
  staleKey: string,
  lockKey: string,
  ttlSeconds: number,
  staleTtlSeconds: number,
  loader: () => Promise<T>
): Promise<T> {
  // Try to acquire lock (SETNX)
  const acquired = await cacheSetStringNx(lockKey, "1", LOCK_TTL_SECONDS);

  if (acquired) {
    // We got the lock — fetch the data
    try {
      const data = await loader();
      const entry: SwrEntry<T> = { data, storedAt: Date.now() };
      await Promise.all([
        cacheSetJson(storeKey, entry, ttlSeconds),
        cacheSetJson(staleKey, entry, staleTtlSeconds),
      ]);
      return data;
    } finally {
      await cacheDelete(lockKey);
    }
  }

  // Another instance is fetching — wait for the result
  return pollForResult<T>(storeKey, staleKey);
}

/**
 * Poll Redis for a result that another instance is currently fetching.
 */
async function pollForResult<T>(storeKey: string, staleKey: string): Promise<T> {
  const maxAttempts = LOCK_TTL_SECONDS * 10; // 100ms intervals

  for (let i = 0; i < maxAttempts; i++) {
    await sleep(100);

    const entry = await cacheGetJson<SwrEntry<T>>(storeKey) ??
                  await cacheGetJson<SwrEntry<T>>(staleKey);
    if (entry) return entry.data;
  }

  // Timeout — fall through to direct fetch
  throw new Error(`cacheJson: timeout waiting for result`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
