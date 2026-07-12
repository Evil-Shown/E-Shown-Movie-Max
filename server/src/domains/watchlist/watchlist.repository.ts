import { prisma } from "../../infrastructure/prisma";
import type { WatchlistItemInput } from "./watchlist.types";

export async function findByUser(userId: string) {
  return prisma.watchlistItem.findMany({
    where: { userId },
    orderBy: { addedAt: "desc" },
  });
}

export async function findByUserAndTmdb(userId: string, tmdbId: string) {
  return prisma.watchlistItem.findUnique({
    where: { userId_tmdbId: { userId, tmdbId } },
  });
}

export async function create(userId: string, data: WatchlistItemInput) {
  return prisma.watchlistItem.upsert({
    where: { userId_tmdbId: { userId, tmdbId: data.tmdbId } },
    update: {
      title: data.title,
      posterPath: data.posterPath,
      year: data.year,
      rating: data.rating,
      genres: data.genres,
    },
    create: {
      userId,
      tmdbId: data.tmdbId,
      mediaType: data.mediaType,
      title: data.title,
      posterPath: data.posterPath,
      year: data.year,
      rating: data.rating,
      genres: data.genres,
    },
  });
}

export async function remove(userId: string, id: string) {
  return prisma.watchlistItem.deleteMany({
    where: { id, userId },
  });
}

export async function removeByTmdb(userId: string, tmdbId: string) {
  return prisma.watchlistItem.deleteMany({
    where: { userId, tmdbId },
  });
}
