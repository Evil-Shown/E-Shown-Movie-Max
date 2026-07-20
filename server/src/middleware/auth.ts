import type { Request, Response, NextFunction } from "express";
import { prisma } from "../infrastructure/prisma";
import { supabaseAnon } from "../infrastructure/supabase";
import { AppError } from "../utils/response";
import { logger } from "../config/logger";

export async function authMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }

    const token = authHeader.slice(7);
    if (!token) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }

    const { data, error } = await supabaseAnon.auth.getUser(token);

    if (error || !data.user) {
      logger.warn({ error: error?.message, hint: (error as { hint?: string })?.hint, tokenPrefix: token.slice(0, 15) }, "Auth middleware — token validation failed");
      throw new AppError(401, "INVALID_TOKEN", error?.message || "Invalid or expired token");
    }

    const localUser = await prisma.user.findUnique({
      where: { authUserId: data.user.id },
      include: { settings: true },
    });

    if (!localUser) {
      logger.warn({ authUserId: data.user.id }, "Authenticated Supabase user not found in local database");
      throw new AppError(401, "USER_NOT_FOUND", "User account not found");
    }

    req.user = localUser;
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
}

export function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.slice(7);
  supabaseAnon.auth
    .getUser(token)
    .then(async ({ data, error }) => {
      if (!error && data.user) {
        const localUser = await prisma.user.findUnique({
          where: { authUserId: data.user.id },
          include: { settings: true },
        });
        if (localUser) {
          req.user = localUser;
          req.token = token;
        }
      }
      next();
    })
    .catch((err) => {
      logger.warn({ err }, "optionalAuthMiddleware failed");
      next();
    });
}
