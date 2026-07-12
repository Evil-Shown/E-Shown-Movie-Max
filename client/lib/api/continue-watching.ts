import { api } from "../api";
import type { ContinueWatchingItem } from "@/lib/storage/types";

export interface ContinueWatchingApiItem {
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
  updatedAt: string;
}

export function continueWatchingApi(token: string) {
  return {
    getAll: () => api.get<ContinueWatchingApiItem[]>("/api/v1/continue", token),
    upsert: (item: ContinueWatchingItem) =>
      api.post<ContinueWatchingApiItem>(
        "/api/v1/continue",
        {
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
        },
        token
      ),
    remove: (id: string) => api.delete(`/api/v1/continue/${id}`, token),
    clear: () => api.delete("/api/v1/continue", token),
  };
}
