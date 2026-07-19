import { cacheGetJson, cacheSetJson, cacheSetStringNx, cacheDelete, redisKey } from "./redis";
import { logger } from "../config/logger";

const LOCK_TTL_SECONDS = 30;
const RESULT_TTL_SECONDS = 60;

/**
 * Distributed single-flight request coalescing.
 *
 * When 100 users request the same resource simultaneously and it's not cached,
 * only ONE actual API call is made. The other 99 wait for that single call
 * to resolve via a Redis lock.
 *
 * This replaces the in-memory `inFlight` Map that only worked within a single
 * server instance.
 */
export async function singleFlight<T>(
  key: string,
  loader: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const lockKey = redisKey("lock", key);
  const resultKey = redisKey("result", key);
  const cacheKey = redisKey("cache", key);

  // 1. Check if result is already cached
  const cached = await cacheGetJson<T>(cacheKey);
  if (cached !== null) return cached;

  // 2. Try to acquire the lock (SETNX pattern)
  const acquired = await cacheSetStringNx(lockKey, "1", LOCK_TTL_SECONDS);

  if (!acquired) {
    // Another instance is already fetching — wait for the result
    return waitForResult<T>(resultKey, cacheKey);
  }

  // 3. We got the lock — fetch the data
  try {
    const result = await loader();

    // Store the result for other waiters
    await cacheSetJson(resultKey, result, RESULT_TTL_SECONDS);

    // Also store in the main cache
    await cacheSetJson(cacheKey, result, ttlSeconds);

    return result;
  } finally {
    // Release the lock (best-effort — TTL will expire it anyway)
    await cacheDelete(lockKey).catch(() => {});
  }
}

/**
 * Wait for a result from another instance that's currently fetching.
 * Polls Redis every 100ms for up to LOCK_TTL_SECONDS.
 */
async function waitForResult<T>(resultKey: string, cacheKey: string): Promise<T> {
  const maxAttempts = LOCK_TTL_SECONDS * 10; // 100ms intervals

  for (let i = 0; i < maxAttempts; i++) {
    await sleep(100);

    // Check main cache first
    const cached = await cacheGetJson<T>(cacheKey);
    if (cached !== null) return cached;

    // Check result slot
    const result = await cacheGetJson<T>(resultKey);
    if (result !== null) return result;
  }

  // Timeout — fall through to direct fetch as last resort
  logger.warn("singleFlight: timed out waiting for result");
  throw new Error("singleFlight timeout");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
