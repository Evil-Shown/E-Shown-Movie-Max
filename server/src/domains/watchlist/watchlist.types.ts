export interface WatchlistItemInput {
  tmdbId: string;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string;
  year?: number;
  rating?: number;
  genres?: string;
}

export interface WatchlistItemResponse {
  id: string;
  tmdbId: string;
  mediaType: string;
  title: string;
  posterPath: string | null;
  year: number | null;
  rating: number | null;
  genres: string | null;
  addedAt: Date;
}
