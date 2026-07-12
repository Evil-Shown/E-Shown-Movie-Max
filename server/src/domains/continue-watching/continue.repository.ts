import { prisma } from "../../infrastructure/prisma";
import type { ContinueWatchingInput } from "./continue.types";

export async function findByUser(userId: string) {
  return prisma.continueWatching.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function upsert(userId: string, data: ContinueWatchingInput) {
  return prisma.continueWatching.upsert({
    where: {
      userId_tmdbId_season_episode: {
        userId,
        tmdbId: data.tmdbId,
        season: data.season ?? null,
        episode: data.episode ?? null,
      },
    },
    update: {
      title: data.title,
      posterPath: data.posterPath,
      currentTime: data.currentTime,
      duration: data.duration,
      progress: data.progress,
      provider: data.provider,
      updatedAt: new Date(),
    },
    create: {
      userId,
      tmdbId: data.tmdbId,
      mediaType: data.mediaType,
      title: data.title,
      posterPath: data.posterPath,
      season: data.season,
      episode: data.episode,
      currentTime: data.currentTime,
      duration: data.duration,
      progress: data.progress,
      provider: data.provider,
    },
  });
}

export async function remove(userId: string, id: string) {
  return prisma.continueWatching.deleteMany({
    where: { id, userId },
  });
}

export async function clear(userId: string) {
  return prisma.continueWatching.deleteMany({
    where: { userId },
  });
}
