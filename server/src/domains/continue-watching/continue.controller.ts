import type { Request, Response, NextFunction } from "express";
import { success } from "../../utils/response";
import * as continueService from "./continue.service";
import type { ContinueWatchingInput } from "./continue.types";

export async function getContinueWatching(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
      return;
    }
    const items = await continueService.getContinueWatching(req.user.id);
    success(res, items);
  } catch (error) {
    next(error);
  }
}

export async function upsertContinueWatching(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
      return;
    }
    const item = await continueService.upsertContinueWatching(req.user.id, req.body as ContinueWatchingInput);
    success(res, item);
  } catch (error) {
    next(error);
  }
}

export async function removeContinueWatching(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
      return;
    }
    await continueService.removeContinueWatching(req.user.id, req.params.id);
    success(res, { message: "Removed from continue watching" });
  } catch (error) {
    next(error);
  }
}

export async function clearContinueWatching(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
      return;
    }
    await continueService.clearContinueWatching(req.user.id);
    success(res, { message: "Continue watching cleared" });
  } catch (error) {
    next(error);
  }
}
