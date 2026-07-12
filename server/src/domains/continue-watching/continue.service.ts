import { prisma } from "../../infrastructure/prisma";
import { AppError } from "../../utils/response";
import * as continueRepository from "./continue.repository";
import type { ContinueWatchingInput, ContinueWatchingResponse } from "./continue.types";

function mapItem(item: Awaited<ReturnType<typeof continueRepository.findByUser>>[number]): ContinueWatchingResponse {
  return {
    id: item.id,
    tmdbId: item.tmdbId,
    mediaType: item.mediaType,
    title: item.title,
    posterPath: item.posterPath,
    season: item.season,
    episode: item.episode,
    currentTime: item.currentTime,
    duration: item.duration,
    progress: item.progress,
    provider: item.provider,
    updatedAt: item.updatedAt,
  };
}

export async function getContinueWatching(userId: string): Promise<ContinueWatchingResponse[]> {
  const items = await continueRepository.findByUser(userId);
  return items.map(mapItem);
}

export async function upsertContinueWatching(
  userId: string,
  input: ContinueWatchingInput
): Promise<ContinueWatchingResponse> {
  const item = await continueRepository.upsert(userId, input);
  return mapItem(item);
}

export async function removeContinueWatching(userId: string, id: string): Promise<void> {
  const result = await continueRepository.remove(userId, id);
  if (result.count === 0) {
    throw new AppError(404, "NOT_FOUND", "Continue watching item not found");
  }
}

export async function clearContinueWatching(userId: string): Promise<void> {
  await continueRepository.clear(userId);
}
