import type { Request, Response, NextFunction } from "express";
import { success } from "../../utils/response";
import * as watchlistService from "./watchlist.service";
import type { WatchlistItemInput } from "./watchlist.types";

export async function getWatchlist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
      return;
    }
    const items = await watchlistService.getWatchlist(req.user.id);
    success(res, items);
  } catch (error) {
    next(error);
  }
}

export async function addToWatchlist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
      return;
    }
    const item = await watchlistService.addToWatchlist(req.user.id, req.body as WatchlistItemInput);
    success(res, item, 201);
  } catch (error) {
    next(error);
  }
}

export async function removeFromWatchlist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
      return;
    }
    await watchlistService.removeFromWatchlist(req.user.id, req.params.id);
    success(res, { message: "Removed from watchlist" });
  } catch (error) {
    next(error);
  }
}
