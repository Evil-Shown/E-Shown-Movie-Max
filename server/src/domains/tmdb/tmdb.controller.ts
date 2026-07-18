import type { Request, Response, NextFunction } from "express";
import { tmdbGet } from "../../lib/tmdb";

export async function proxy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const urlParts = req.url.split("?");
    const tmdbPath = urlParts[0];
    const params: Record<string, string> = {};

    if (urlParts[1]) {
      const usp = new URLSearchParams(urlParts[1]);
      usp.forEach((value, key) => {
        params[key] = value;
      });
    }

    const data = await tmdbGet<unknown>(tmdbPath, params, { platform: req.platform });
    res.json(data);
  } catch (error) {
    next(error);
  }
}
