export interface WatchedEpisodeInput {
  tvdbId: string;
  season: number;
  episode: number;
}

export interface WatchedEpisodeResponse {
  id: string;
  tvdbId: string;
  season: number;
  episode: number;
  watchedAt: Date;
}
