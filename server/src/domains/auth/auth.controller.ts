import type { Request, Response, NextFunction } from "express";
import { success } from "../../utils/response";
import { logger } from "../../config/logger";
import * as authService from "./auth.service";
import { toAuthUser } from "./auth.types";
import type { LoginInput, RegisterInput, OAuthInput, ForgotPasswordInput, ResetPasswordInput } from "./auth.types";

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as RegisterInput;
    logger.info(
      { origin: req.headers.origin, platform: req.headers["x-platform"], email: body?.email },
      "auth.register request"
    );
    const result = await authService.register(body, req.ip);
    logger.info({ email: body?.email, userId: result.user?.id }, "auth.register success");
    success(res, result, 201);
  } catch (error) {
    logger.warn(
      { origin: req.headers.origin, err: error instanceof Error ? error.message : error },
      "auth.register failed"
    );
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as LoginInput;
    logger.info(
      { origin: req.headers.origin, platform: req.headers["x-platform"], email: body?.email },
      "auth.login request"
    );
    const result = await authService.login(body, req.ip);
    logger.info({ email: body?.email, userId: result.user?.id }, "auth.login success");
    success(res, result);
  } catch (error) {
    logger.warn(
      { origin: req.headers.origin, err: error instanceof Error ? error.message : error },
      "auth.login failed"
    );
    next(error);
  }
}

export async function oauth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.oauth(req.body as OAuthInput, req.ip);
    success(res, result);
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await authService.logout(req.user?.authUserId);
    success(res, { message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as ForgotPasswordInput;
    logger.info({ email: body?.email }, "auth.forgotPassword request");
    await authService.forgotPassword(body);
    success(res, { message: "If an account exists with this email, a password reset link has been sent" });
  } catch (error) {
    logger.warn({ err: error instanceof Error ? error.message : error }, "auth.forgotPassword failed");
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as ResetPasswordInput;
    logger.info({}, "auth.resetPassword request");
    await authService.resetPassword(body);
    success(res, { message: "Password has been reset successfully" });
  } catch (error) {
    logger.warn({ err: error instanceof Error ? error.message : error }, "auth.resetPassword failed");
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
