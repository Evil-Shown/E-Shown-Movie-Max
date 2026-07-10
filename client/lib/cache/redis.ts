import { Redis } from "@upstash/redis";

const KEY_PREFIX = "chithra:";

type MemoryEntry = {
  value: string;
  expiresAt: number;
};

const memoryStore = new Map<string, MemoryEntry>();

let redisClient: Redis | null | undefined;

export function isRedisConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

export function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redisClient = url && token ? new Redis({ url, token }) : null;
  return redisClient;
}

export function redisKey(...parts: string[]): string {
  return `${KEY_PREFIX}${parts.join(":")}`;
}

function pruneMemoryStore(now = Date.now()): void {
  if (memoryStore.size < 5000) return;
  for (const [key, entry] of memoryStore) {
    if (entry.expiresAt <= now) memoryStore.delete(key);
  }
}

async function memoryGet(key: string): Promise<string | null> {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
}

async function memorySet(key: string, value: string, ttlSeconds: number): Promise<void> {
  pruneMemoryStore();
  memoryStore.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export async function cacheGetString(key: string): Promise<string | null> {
  const redis = getRedis();
  if (redis) {
    const value = await redis.get<string>(key);
    return value ?? null;
  }
  return memoryGet(key);
}

export async function cacheSetString(
  key: string,
  value: string,
  ttlSeconds: number
): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(key, value, { ex: ttlSeconds });
    return;
  }
  await memorySet(key, value, ttlSeconds);
}

export async function cacheGetJson<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (redis) {
    const value = await redis.get<T>(key);
    return value ?? null;
  }

  const raw = await memoryGet(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function cacheSetJson<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(key, value, { ex: ttlSeconds });
    return;
  }
  await memorySet(key, JSON.stringify(value), ttlSeconds);
}

export async function cacheIncr(key: string, ttlSeconds: number): Promise<number> {
  const redis = getRedis();
  if (redis) {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, ttlSeconds);
    }
    return count;
  }

  const raw = await memoryGet(key);
  const count = raw ? Number.parseInt(raw, 10) + 1 : 1;
  await memorySet(key, String(count), ttlSeconds);
  return count;
}
