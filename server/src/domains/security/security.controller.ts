import type { Request, Response, NextFunction } from "express";
import { success } from "../../utils/response";
import * as securityService from "./security.service";

export async function virusTotalReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hash = String(req.query.hash || "")
      .toLowerCase()
      .trim();
    const report = await securityService.getVirusTotalReport(hash, req.platform);
    success(res, report);
  } catch (error) {
    next(error);
  }
}
