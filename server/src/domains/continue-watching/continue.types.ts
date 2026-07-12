export interface ContinueWatchingInput {
  tmdbId: string;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string;
  season?: number;
  episode?: number;
  currentTime?: number;
  duration?: number;
  progress?: number;
  provider?: string;
}

export interface ContinueWatchingResponse {
  id: string;
  tmdbId: string;
  mediaType: string;
  title: string;
  posterPath: string | null;
  season: number | null;
  episode: number | null;
  currentTime: number;
  duration: number;
  progress: number;
  provider: string | null;
  updatedAt: Date;
}
