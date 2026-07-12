import type { Request, Response, NextFunction } from "express";
import { success } from "../../utils/response";
import * as authService from "./auth.service";
import { toAuthUser } from "./auth.types";
import type { LoginInput, RegisterInput } from "./auth.types";

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.register(req.body as RegisterInput, req.ip);
    success(res, result, 201);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.login(req.body as LoginInput, req.ip);
    success(res, result);
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await authService.logout(req.token);
    success(res, { message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      // This should never happen because authMiddleware is required, but guard anyway
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
      return;
    }
    success(res, { user: toAuthUser(req.user) });
  } catch (error) {
    next(error);
  }
}
