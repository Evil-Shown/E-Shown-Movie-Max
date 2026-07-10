import type { CacheJsonFn } from "../cache";
import { buildCacheKey } from "../cache";

let cacheJsonImpl: CacheJsonFn | null = null;

export function configureTmdbCache(cacheJson: CacheJsonFn): void {
  cacheJsonImpl = cacheJson;
}

export function getTmdbCacheJson(): CacheJsonFn {
  if (!cacheJsonImpl) {
    return async <T>(_key: string, _ttlMs: number, loader: () => Promise<T>) => loader();
  }
  return cacheJsonImpl;
}

export { buildCacheKey };
