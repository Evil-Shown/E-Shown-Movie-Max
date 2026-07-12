import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/response";
import { logger } from "../config/logger";
import { env } from "../config/env";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.toApiError(),
    });
    return;
  }

  if (err.name === "UnauthorizedError") {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
    return;
  }

  logger.error({ err }, "Unhandled error");

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: env.NODE_ENV === "development" ? err.message : "Something went wrong",
      ...(env.NODE_ENV === "development" && err.stack ? { stack: err.stack } : {}),
    },
  });
}
