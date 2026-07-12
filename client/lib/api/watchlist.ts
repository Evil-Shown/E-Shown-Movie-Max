import { api } from "../api";
import type { WatchlistItem } from "@/lib/storage/types";

export interface WatchlistApiItem {
  id: string;
  tmdbId: string;
  mediaType: string;
  title: string;
  posterPath: string | null;
  year: number | null;
  rating: number | null;
  genres: string | null;
  addedAt: string;
}

export function watchlistApi(token: string) {
  return {
    getAll: () => api.get<WatchlistApiItem[]>("/api/v1/watchlist", token),
    add: (item: WatchlistItem) =>
      api.post<WatchlistApiItem>(
        "/api/v1/watchlist",
        {
          tmdbId: item.tmdbId,
          mediaType: item.mediaType,
          title: item.title,
          posterPath: item.posterPath,
          year: item.year,
          rating: item.rating,
          genres: item.genres?.join(","),
        },
        token
      ),
    remove: (id: string) => api.delete(`/api/v1/watchlist/${id}`, token),
  };
}
