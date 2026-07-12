import type { Request, Response, NextFunction } from "express";
import { success } from "../../utils/response";
import * as userService from "./user.service";
import type { UpdatePreferencesInput, UpdateProfileInput } from "./user.types";

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
      return;
    }
    const profile = await userService.getProfile(req.user.id);
    success(res, profile);
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
      return;
    }
    const profile = await userService.updateProfile(req.user.id, req.body as UpdateProfileInput);
    success(res, profile);
  } catch (error) {
    next(error);
  }
}

export async function updateAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
      return;
    }
    const { avatarUrl } = req.body as { avatarUrl?: string };
    if (!avatarUrl) {
      res.status(400).json({
        success: false,
        error: { code: "MISSING_AVATAR", message: "avatarUrl is required" },
      });
      return;
    }
    const profile = await userService.updateAvatar(req.user.id, avatarUrl);
    success(res, profile);
  } catch (error) {
    next(error);
  }
}

export async function updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
      return;
    }
    const profile = await userService.updatePreferences(req.user.id, req.body as UpdatePreferencesInput);
    success(res, profile);
  } catch (error) {
    next(error);
  }
}
