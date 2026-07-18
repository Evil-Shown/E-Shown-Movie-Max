import type { Request, Response, NextFunction } from "express";
import { wyzieSearch } from "../../lib/wyzie";

export async function search(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tmdbId = String(req.query.tmdbId || "");
    const imdbId = String(req.query.imdbId || "");
    const season = String(req.query.season || "");
    const episode = String(req.query.episode || "");
    const language = String(req.query.language || "");

    const result = await wyzieSearch(
      {
        tmdbId: tmdbId || undefined,
        imdbId: imdbId || undefined,
        season: season || undefined,
        episode: episode || undefined,
        language: language || undefined,
      },
      { platform: req.platform }
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
}
