import type { Request, Response, NextFunction } from "express";
import { success } from "../../utils/response";
import { sanitizeQuery } from "../search/search.service";
import * as analyticsService from "./analytics.service";

export async function trackStream(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = sanitizeQuery(req.body?.query);
    await analyticsService.trackStream(query, req.user?.id, req.sessionId);
    success(res, { ok: true });
  } catch (error) {
    next(error);
  }
}

export async function trackDownload(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = sanitizeQuery(req.body?.query);
    await analyticsService.trackDownload(query, req.user?.id, req.sessionId);
    success(res, { ok: true });
  } catch (error) {
    next(error);
  }
}

export async function summary(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    success(res, analyticsService.getSummary());
  } catch (error) {
    next(error);
  }
}
