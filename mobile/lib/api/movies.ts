import { apiGet, apiPost } from "./client";
import type {
  BrowseResult,
  BrowseSort,
  HomeCatalog,
  SearchMediaFilter,
  SimilarMoviesResult,
  TvEpisodesResult,
  TvSeasonsResult,
} from "./types";
import type { SourcesResponse } from "@chithra/core/providers";
import type { Genre, Movie } from "@chithra/core/types";

const MOBILE_API_PREFIX = "/api/mobile";

export async function fetchHomeCatalog(): Promise<HomeCatalog> {
  return apiGet<HomeCatalog>(`${MOBILE_API_PREFIX}/home`);
}

export async function fetchBrowseCatalog(params: {
  page?: number;
  genre?: Genre | null;
  sort?: BrowseSort;
}): Promise<BrowseResult> {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.genre) search.set("genre", params.genre);
  if (params.sort) search.set("sort", params.sort);
  return apiGet<BrowseResult>(`${MOBILE_API_PREFIX}/browse?${search.toString()}`);
}

export async function searchMovies(query: string, page = 1, media: SearchMediaFilter = "all"): Promise<BrowseResult> {
  const search = new URLSearchParams({ q: query, page: String(page), media });
  return apiGet<BrowseResult>(`${MOBILE_API_PREFIX}/search?${search.toString()}`);
}

export async function fetchMovieDetail(id: string): Promise<Movie> {
  return apiGet<Movie>(`${MOBILE_API_PREFIX}/movie/${encodeURIComponent(id)}`);
}

export async function fetchSimilarMovies(id: string, limit = 8): Promise<Movie[]> {
  const result = await apiGet<SimilarMoviesResult>(
    `${MOBILE_API_PREFIX}/movie/${encodeURIComponent(id)}/similar?limit=${limit}`
  );
  return result.movies;
}

export interface SourceOptions {
  type?: "movie" | "tv";
  season?: number;
  episode?: number;
  seek?: number;
  subtitleLang?: string;
  subtitleFile?: string;
  subtitleLabel?: string;
}

export async function fetchMovieSources(id: string, options: SourceOptions = {}): Promise<SourcesResponse> {
  const search = new URLSearchParams();
  if (options.type) search.set("type", options.type);
  if (options.season !== undefined) search.set("season", String(options.season));
  if (options.episode !== undefined) search.set("episode", String(options.episode));
  if (options.seek !== undefined) search.set("seek", String(options.seek));
  if (options.subtitleLang) search.set("subtitleLang", options.subtitleLang);
  if (options.subtitleFile) search.set("subtitleFile", options.subtitleFile);
  if (options.subtitleLabel) search.set("subtitleLabel", options.subtitleLabel);

  const query = search.toString();
  return apiGet<SourcesResponse>(`/api/sources/${encodeURIComponent(id)}${query ? `?${query}` : ""}`);
}

export async function fetchTvSeasons(tvId: string): Promise<TvSeasonsResult> {
  return apiGet<TvSeasonsResult>(`${MOBILE_API_PREFIX}/tv/${encodeURIComponent(tvId)}/seasons`);
}

export async function fetchTvEpisodes(tvId: string, season: number): Promise<TvEpisodesResult> {
  return apiGet<TvEpisodesResult>(`${MOBILE_API_PREFIX}/tv/${encodeURIComponent(tvId)}/season/${season}`);
}
