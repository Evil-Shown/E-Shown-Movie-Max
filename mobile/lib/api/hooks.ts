import { useQuery } from "@tanstack/react-query";

import {
  fetchBrowseCatalog,
  fetchHomeCatalog,
  fetchMovieDetail,
  fetchSimilarMovies,
  fetchTvEpisodes,
  fetchTvSeasons,
  searchMovies,
} from "./movies";
import { fetchLiveTvChannels } from "./live-tv";
import type { BrowseSort, SearchMediaFilter } from "./types";
import type { Genre } from "@chithra/core/types";

export function useHomeCatalog() {
  return useQuery({
    queryKey: ["home"],
    queryFn: fetchHomeCatalog,
  });
}

export function useBrowseCatalog(params: { page?: number; genre?: Genre | null; sort?: BrowseSort }) {
  return useQuery({
    queryKey: ["browse", params.page ?? 1, params.genre ?? null, params.sort ?? "popular"],
    queryFn: () => fetchBrowseCatalog(params),
  });
}

export function useMovieSearch(query: string, page = 1, media: SearchMediaFilter = "all") {
  return useQuery({
    queryKey: ["search", query, page, media],
    queryFn: () => searchMovies(query, page, media),
    enabled: query.trim().length >= 2,
  });
}

export function useMovieDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["movie", id],
    queryFn: () => fetchMovieDetail(id as string),
    enabled: Boolean(id),
  });
}

export function useSimilarMovies(id: string | undefined, limit = 8) {
  return useQuery({
    queryKey: ["movie", id, "similar", limit],
    queryFn: () => fetchSimilarMovies(id as string, limit),
    enabled: Boolean(id),
  });
}

export function useTvSeasons(tvId: string | undefined) {
  return useQuery({
    queryKey: ["tv", tvId, "seasons"],
    queryFn: () => fetchTvSeasons(tvId as string),
    enabled: Boolean(tvId),
  });
}

export function useTvEpisodes(tvId: string | undefined, season: number | undefined) {
  return useQuery({
    queryKey: ["tv", tvId, "season", season],
    queryFn: () => fetchTvEpisodes(tvId as string, season as number),
    enabled: Boolean(tvId) && Boolean(season),
  });
}

export function useLiveTvChannels() {
  return useQuery({
    queryKey: ["live-tv", "channels"],
    queryFn: fetchLiveTvChannels,
    staleTime: 1000 * 60 * 60,
  });
}
