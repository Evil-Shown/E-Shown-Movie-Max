import type { Request, Response, NextFunction } from "express";
import { omdbGet } from "../../lib/omdb";

function str(val: unknown): string {
  return String(val ?? "");
}

export async function search(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = str(req.query.q).trim();
    const page = str(req.query.page) || "1";
    const data = await omdbGet<any>({ s: query, type: "movie", page, r: "json" }, { platform: req.platform });
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function searchSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = str(req.query.q).trim();
    const page = str(req.query.page) || "1";
    const data = await omdbGet<any>({ s: query, type: "series", page, r: "json" }, { platform: req.platform });
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function byImdbId(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const imdbId = req.params.id as string;
    const data = await omdbGet<any>({ i: imdbId, plot: "full", r: "json" }, { platform: req.platform });
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function byTitle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const title = str(req.query.title).trim();
    const year = typeof req.query.year === "string" ? req.query.year : undefined;
    const params: Record<string, string> = { t: title, plot: "full", r: "json" };
    if (year) params.y = year;
    const data = await omdbGet<any>(params, { platform: req.platform });
    res.json(data);
  } catch (error) {
    next(error);
  }
}
