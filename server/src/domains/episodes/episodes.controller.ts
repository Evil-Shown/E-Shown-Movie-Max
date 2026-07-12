import type { Request, Response, NextFunction } from "express";
import { success } from "../../utils/response";
import * as episodesService from "./episodes.service";
import type { WatchedEpisodeInput } from "./episodes.types";

export async function getWatchedEpisodes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
      return;
    }
    const tvdbId = req.query.tvdbId as string;
    const episodes = await episodesService.getWatchedEpisodes(req.user.id, tvdbId);
    success(res, episodes);
  } catch (error) {
    next(error);
  }
}

export async function markEpisodeWatched(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
      return;
    }
    const episode = await episodesService.markEpisodeWatched(req.user.id, req.body as WatchedEpisodeInput);
    success(res, episode);
  } catch (error) {
    next(error);
  }
}

export async function unmarkEpisodeWatched(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
      return;
    }
    await episodesService.unmarkEpisodeWatched(req.user.id, req.body as WatchedEpisodeInput);
    success(res, { message: "Episode marked as unwatched" });
  } catch (error) {
    next(error);
  }
}
