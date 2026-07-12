import * as episodesRepository from "./episodes.repository";
import type { WatchedEpisodeInput, WatchedEpisodeResponse } from "./episodes.types";

function mapEpisode(
  ep: Awaited<ReturnType<typeof episodesRepository.findByUserAndShow>>[number]
): WatchedEpisodeResponse {
  return {
    id: ep.id,
    tvdbId: ep.tvdbId,
    season: ep.season,
    episode: ep.episode,
    watchedAt: ep.watchedAt,
  };
}

export async function getWatchedEpisodes(userId: string, tvdbId: string): Promise<WatchedEpisodeResponse[]> {
  const episodes = await episodesRepository.findByUserAndShow(userId, tvdbId);
  return episodes.map(mapEpisode);
}

export async function markEpisodeWatched(userId: string, input: WatchedEpisodeInput): Promise<WatchedEpisodeResponse> {
  const episode = await episodesRepository.markWatched(userId, input.tvdbId, input.season, input.episode);
  return mapEpisode(episode);
}

export async function unmarkEpisodeWatched(userId: string, input: WatchedEpisodeInput): Promise<void> {
  await episodesRepository.unmarkWatched(userId, input.tvdbId, input.season, input.episode);
}
