import type { Request, Response, NextFunction } from "express";
import { AppError, success } from "../../utils/response";
import * as searchService from "./search.service";

export async function resolveMagnet(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const name = searchService.sanitizeQuery(req.body?.name);
    const providerHint = searchService.sanitizeQuery(req.body?.providerHint);
    const existingMagnet = searchService.sanitizeQuery(req.body?.magnet);

    const magnet = await searchService.resolveMagnet(name, providerHint, existingMagnet);
    success(res, { magnet });
  } catch (error) {
    next(error);
  }
}

export async function search(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = searchService.sanitizeQuery(req.query.q);
    const limit = searchService.parsePositiveInt(req.query.limit, 60, 120);

    if (!query || query.length < 2) {
      throw new AppError(400, "INVALID_QUERY", "Query parameter 'q' must be at least 2 characters.");
    }

    if (query.length > 120) {
      throw new AppError(400, "QUERY_TOO_LONG", "Query is too long. Maximum 120 characters.");
    }

    const results = await searchService.getSearchResults(query, limit);
    success(res, results);
  } catch (error) {
    next(error);
  }
}

export async function suggest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = searchService.sanitizeQuery(req.query.q);

    if (!query || query.length < 2) {
      success(res, []);
      return;
    }

    const suggestions = await searchService.getSuggestions(query);
    success(res, suggestions);
  } catch (error) {
    next(error);
  }
}

export async function trending(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    success(res, searchService.getTrending());
  } catch (error) {
    next(error);
  }
}

export async function providers(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    success(res, searchService.getProviders());
  } catch (error) {
    next(error);
  }
}
