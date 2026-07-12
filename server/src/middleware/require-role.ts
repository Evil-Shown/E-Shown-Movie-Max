import type { Request, Response, NextFunction } from "express";
import type { Role } from "../../generated/prisma";
import { AppError } from "../utils/response";

const roleHierarchy: Record<Role, number> = {
  USER: 0,
  SUPPORT: 1,
  MODERATOR: 2,
  CONTENT_MANAGER: 3,
  ADMIN: 4,
  DEVELOPER: 5,
  OWNER: 6,
};

export function requireRole(minRole: Role) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
      return;
    }

    const userLevel = roleHierarchy[req.user.role];
    const requiredLevel = roleHierarchy[minRole];

    if (userLevel < requiredLevel) {
      next(new AppError(403, "FORBIDDEN", "You do not have permission to perform this action"));
      return;
    }

    next();
  };
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
    return;
  }
  next();
}
