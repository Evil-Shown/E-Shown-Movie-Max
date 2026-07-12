import { Redis } from "@upstash/redis";
import { env } from "../config/env";
import { logger } from "../config/logger";

const inMemoryCache = new Map<string, { value: unknown; expiresAt: number }>();

function isRedisConfigured(): boolean {
  return Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
}

const redis = isRedisConfigured()
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

if (redis) {
  logger.info("Using Upstash Redis for caching");
} else {
  logger.warn("Upstash Redis not configured; using in-memory cache fallback");
}

export function redisKey(...parts: string[]): string {
  return ["chithra", ...parts].join(":");
}

export async function cacheGetJson<T>(key: string): Promise<T | null> {
  try {
    if (redis) {
      const value = await redis.get<T>(key);
      return value ?? null;
    }

    const entry = inMemoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      inMemoryCache.delete(key);
      return null;
    }
    return entry.value as T;
  } catch (error) {
    logger.warn({ error, key }, "cacheGetJson failed");
    return null;
  }
}

export async function cacheSetJson<T>(key: string, value: T, ttlSeconds = 60): Promise<void> {
  try {
    if (redis) {
      await redis.set(key, value, { ex: ttlSeconds });
      return;
    }

    inMemoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  } catch (error) {
    logger.warn({ error, key }, "cacheSetJson failed");
  }
}

export async function cacheDelete(key: string): Promise<void> {
  try {
    if (redis) {
      await redis.del(key);
      return;
    }
    inMemoryCache.delete(key);
  } catch (error) {
    logger.warn({ error, key }, "cacheDelete failed");
  }
}

export async function cacheIncr(key: string, ttlSeconds = 60): Promise<number> {
  try {
    if (redis) {
      const count = await redis.incr(key);
      await redis.expire(key, ttlSeconds);
      return count;
    }

    const entry = inMemoryCache.get(key);
    const count = entry && Date.now() <= entry.expiresAt ? ((entry.value as number) ?? 0) + 1 : 1;
    inMemoryCache.set(key, {
      value: count,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
    return count;
  } catch (error) {
    logger.warn({ error, key }, "cacheIncr failed");
    return 1;
  }
}
