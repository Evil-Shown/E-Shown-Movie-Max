import type { Request, Response, NextFunction } from "express";
import { AppError, success } from "../../utils/response";
import * as telemetryService from "./telemetry.service";

export async function ping(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { clientId, version, platform } = req.body as {
      clientId?: string;
      version?: string;
      platform?: string;
    };

    if (!clientId) {
      throw new AppError(400, "MISSING_CLIENT_ID", "Missing clientId");
    }

    telemetryService.ping(clientId, version, platform);
    success(res, { ok: true });
  } catch (error) {
    next(error);
  }
}

export async function heartbeat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { clientId } = req.body as { clientId?: string };

    if (!clientId) {
      throw new AppError(400, "MISSING_CLIENT_ID", "Missing clientId");
    }

    telemetryService.heartbeat(clientId);
    success(res, { ok: true });
  } catch (error) {
    next(error);
  }
}

export async function stats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const providedSecret = req.query.secret || req.headers["x-admin-secret"];
    const stats = telemetryService.getStats(providedSecret);
    success(res, stats);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      next(new AppError(403, "FORBIDDEN", error.message));
      return;
    }
    next(error);
  }
}
