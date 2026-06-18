type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

type GlobalCacheStore = {
  entries: Map<string, CacheEntry<unknown>>;
  inFlight: Map<string, Promise<unknown>>;
};

function getStore(): GlobalCacheStore {
  const globalAny = globalThis as typeof globalThis & {
    __chithraRequestCache?: GlobalCacheStore;
  };

  if (!globalAny.__chithraRequestCache) {
    globalAny.__chithraRequestCache = {
      entries: new Map(),
      inFlight: new Map(),
    };
  }

  return globalAny.__chithraRequestCache;
}

export async function cacheJson<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const store = getStore();
  const now = Date.now();
  const cached = store.entries.get(key) as CacheEntry<T> | undefined;

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const inFlight = store.inFlight.get(key) as Promise<T> | undefined;
  if (inFlight) {
    return inFlight;
  }

  const promise = loader()
    .then((value) => {
      store.entries.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
      });
      return value;
    })
    .finally(() => {
      store.inFlight.delete(key);
    });

  store.inFlight.set(key, promise as Promise<unknown>);
  return promise;
}

export function buildCacheKey(namespace: string, path: string, params: Record<string, string>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params).sort(([a], [b]) => a.localeCompare(b))) {
    search.set(key, value);
  }
  return `${namespace}::${path}?${search.toString()}`;
}
