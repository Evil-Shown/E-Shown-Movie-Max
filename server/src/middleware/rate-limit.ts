import type { Request, Response, NextFunction } from "express";
import { rateLimit } from "express-rate-limit";
import { cacheIncr } from "../infrastructure/redis";
import { AppError } from "../utils/response";
import { logger } from "../config/logger";

const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 60;

export async function redisRateLimit(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    const key = `chithra:ratelimit:server:api:${ip}`;
    const count = await cacheIncr(key, RATE_LIMIT_WINDOW_SECONDS);

    if (count > RATE_LIMIT_MAX_REQUESTS) {
      next(new AppError(429, "RATE_LIMITED", "Too many requests. Please try again shortly."));
      return;
    }

    next();
  } catch (err) {
    logger.warn({ err }, "redisRateLimit failed");
    next();
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
