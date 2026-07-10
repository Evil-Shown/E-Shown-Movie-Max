import { cacheGetJson, cacheSetJson, redisKey } from "@/lib/cache/redis";

const inFlight = new Map<string, Promise<unknown>>();

export async function cacheJson<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>
): Promise<T> {
  const storeKey = redisKey("cache", key);
  const ttlSeconds = Math.max(1, Math.ceil(ttlMs / 1000));

  const cached = await cacheGetJson<T>(storeKey);
  if (cached !== null) {
    return cached;
  }

  const pending = inFlight.get(key) as Promise<T> | undefined;
  if (pending) {
    return pending;
  }

  const promise = loader()
    .then(async (value) => {
      await cacheSetJson(storeKey, value, ttlSeconds);
      return value;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, promise as Promise<unknown>);
  return promise;
}

export function buildCacheKey(namespace: string, path: string, params: Record<string, string>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params).sort(([a], [b]) => a.localeCompare(b))) {
    search.set(key, value);
  }
  return `${namespace}::${path}?${search.toString()}`;
}
