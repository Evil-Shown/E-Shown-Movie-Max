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
    const stats = telemetryService.getStats();
    success(res, stats);
  } catch (error) {
    next(error);
  }
}
