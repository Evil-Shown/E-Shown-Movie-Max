import { AppError } from "../../utils/response";
import { prisma } from "../../infrastructure/prisma";
import { logger } from "../../config/logger";
import * as watchlistRepository from "./watchlist.repository";
import type { WatchlistItemInput, WatchlistItemResponse } from "./watchlist.types";

function mapItem(item: Awaited<ReturnType<typeof watchlistRepository.findByUser>>[number]): WatchlistItemResponse {
  return {
    id: item.id,
    tmdbId: item.tmdbId,
    mediaType: item.mediaType,
    title: item.title,
    posterPath: item.posterPath,
    year: item.year,
    rating: item.rating,
    genres: item.genres,
    addedAt: item.addedAt,
  };
}

async function createAuditLog(userId: string, action: string, metadata?: Record<string, unknown>) {
  try {
    await prisma.auditLog.create({ data: { userId, action, metadata } });
  } catch (error) {
    logger.warn({ error, userId, action }, "Failed to create audit log");
  }
}

export async function getWatchlist(userId: string): Promise<WatchlistItemResponse[]> {
  const items = await watchlistRepository.findByUser(userId);
  return items.map(mapItem);
}

export async function addToWatchlist(userId: string, input: WatchlistItemInput): Promise<WatchlistItemResponse> {
  const item = await watchlistRepository.create(userId, input);
  await createAuditLog(userId, "WATCHLIST_ADDED", { tmdbId: input.tmdbId, title: input.title });
  return mapItem(item);
}

export async function removeFromWatchlist(userId: string, id: string): Promise<void> {
  const result = await watchlistRepository.remove(userId, id);
  if (result.count === 0) {
    throw new AppError(404, "NOT_FOUND", "Watchlist item not found");
  }
  await createAuditLog(userId, "WATCHLIST_REMOVED", { id });
}

export async function removeFromWatchlistByTmdb(userId: string, tmdbId: string): Promise<void> {
  await watchlistRepository.removeByTmdb(userId, tmdbId);
  await createAuditLog(userId, "WATCHLIST_REMOVED", { tmdbId });
}
