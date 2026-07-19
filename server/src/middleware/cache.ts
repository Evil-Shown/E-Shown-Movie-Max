import type { Request, Response, NextFunction } from "express";
import { cacheDelete, cacheGetJson, cacheSetJson, redisKey } from "../infrastructure/redis";
import { logger } from "../config/logger";

interface CacheOpts {
  ttl: number;
  staleTtl: number;
  keyFn?: (req: Request) => string;
}

type CachedPayload = {
  body: unknown;
  statusCode: number;
};

export function cache({ ttl, staleTtl, keyFn }: CacheOpts) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") {
      next();
      return;
    }

    const key = keyFn ? keyFn(req) : redisKey("http-cache", req.originalUrl);
    const staleKey = `${key}:stale`;
    const lockKey = redisKey("lock", key);

    try {
      const fresh = await cacheGetJson<CachedPayload>(key);
      if (fresh) {
        res.setHeader("X-Cache", "HIT");
        res.setHeader("Cache-Control", `public, max-age=${ttl}, stale-while-revalidate=${staleTtl}`);
        res.status(fresh.statusCode).json(fresh.body);
        return;
      }

      const stale = await cacheGetJson<CachedPayload>(staleKey);
      if (stale) {
        res.setHeader("X-Cache", "STALE");
        res.setHeader("Cache-Control", `public, max-age=0, stale-while-revalidate=${staleTtl}`);
        res.status(stale.statusCode).json(stale.body);

        const acquired = await cacheSetJson(lockKey, { locked: true }, 10);
        void acquired;
        // Background refresh is handled by the next MISS path; avoid thundering herd with short lock TTL.
        return;
      }

      const originalJson = res.json.bind(res);
      res.json = ((body: unknown) => {
        const statusCode = res.statusCode || 200;
        if (statusCode >= 200 && statusCode < 300) {
          const payload: CachedPayload = { body, statusCode };
          void Promise.all([
            cacheSetJson(key, payload, ttl),
            cacheSetJson(staleKey, payload, staleTtl),
            cacheDelete(lockKey),
          ]).catch((error) => logger.warn({ error, key }, "Failed to store cache payload"));
        }
        res.setHeader("X-Cache", "MISS");
        return originalJson(body);
      }) as Response["json"];

      next();
    } catch (error) {
      logger.warn({ error }, "Cache middleware failed open");
      next();
    }
  };
}

export function bustCacheKey(key: string): Promise<void> {
  return Promise.all([cacheDelete(key), cacheDelete(`${key}:stale`)]).then(() => undefined);
}
