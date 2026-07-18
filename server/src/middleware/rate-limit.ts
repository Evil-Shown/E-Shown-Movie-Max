import type { Request, Response, NextFunction } from "express";
import { rateLimit } from "express-rate-limit";
import { cacheIncr } from "../infrastructure/redis";
import { AppError } from "../utils/response";
import { logger } from "../config/logger";

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 60;

const inMemoryCounts = new Map<string, { count: number; expiresAt: number }>();

async function inMemoryIncr(key: string, windowSeconds: number): Promise<number> {
  const now = Date.now();
  const entry = inMemoryCounts.get(key);

  if (!entry || now >= entry.expiresAt) {
    inMemoryCounts.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
    return 1;
  }

  entry.count += 1;
  return entry.count;
}

export async function redisRateLimit(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    const key = `chithra:ratelimit:server:api:${ip}`;

    let count: number;
    try {
      count = await cacheIncr(key, RATE_LIMIT_WINDOW_SECONDS);
    } catch {
      count = await inMemoryIncr(key, RATE_LIMIT_WINDOW_SECONDS);
    }

    if (count > RATE_LIMIT_MAX_REQUESTS) {
      next(new AppError(429, "RATE_LIMITED", "Too many requests. Please try again shortly."));
      return;
    }

    next();
  } catch (err) {
    logger.error({ err }, "Rate limiter critical failure");
    next(new AppError(429, "RATE_LIMITED", "Too many requests. Please try again shortly."));
  }
}

export const strictRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests. Please try again shortly.",
    },
  },
});
