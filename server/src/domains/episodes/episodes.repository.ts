import { prisma } from "../../infrastructure/prisma";

export async function findByUserAndShow(userId: string, tvdbId: string) {
  return prisma.watchedEpisode.findMany({
    where: { userId, tvdbId },
    orderBy: [{ season: "asc" }, { episode: "asc" }],
  });
}

export async function markWatched(userId: string, tvdbId: string, season: number, episode: number) {
  return prisma.watchedEpisode.upsert({
    where: {
      userId_tvdbId_season_episode: {
        userId,
        tvdbId,
        season,
        episode,
      },
    },
    update: { watchedAt: new Date() },
    create: {
      userId,
      tvdbId,
      season,
      episode,
    },
  });
}

export async function unmarkWatched(userId: string, tvdbId: string, season: number, episode: number) {
  return prisma.watchedEpisode.deleteMany({
    where: {
      userId,
      tvdbId,
      season,
      episode,
    },
  });
}
