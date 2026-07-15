import type { Request, Response, NextFunction } from "express";
import { tmdbGet } from "../../lib/tmdb";

export async function proxy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tmdbPath = req.path;

    const params: Record<string, string> = {};
    const query = req.query as Record<string, unknown>;
    for (const [key, val] of Object.entries(query)) {
      if (typeof val === "string") {
        params[key] = val;
      } else if (Array.isArray(val)) {
        params[key] = val[0];
      }
    }

    const data = await tmdbGet<unknown>(tmdbPath, params);
    res.json(data);
  } catch (error) {
    next(error);
  }
}
