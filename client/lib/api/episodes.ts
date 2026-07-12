import { api } from "../api";

export interface WatchedEpisodeApiItem {
  id: string;
  tvdbId: string;
  season: number;
  episode: number;
  watchedAt: string;
}

export function episodesApi(token: string) {
  return {
    getAll: (tvdbId: string) =>
      api.get<WatchedEpisodeApiItem[]>(`/api/v1/episodes?tvdbId=${encodeURIComponent(tvdbId)}`, token),
    markWatched: (tvdbId: string, season: number, episode: number) =>
      api.post<WatchedEpisodeApiItem>("/api/v1/episodes/mark-watched", { tvdbId, season, episode }, token),
    unmarkWatched: (tvdbId: string, season: number, episode: number) =>
      api.post("/api/v1/episodes/unmark-watched", { tvdbId, season, episode }, token),
  };
}
