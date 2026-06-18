import type { Genre } from "@/lib/types";
import { buildCacheKey, cacheJson } from "@/lib/cache/request-cache";
import { genreToTmdbId } from "./genres";
import type {
  TmdbMovieDetail,
  TmdbPagedResponse,
  TmdbMovieListItem,
  TmdbMultiSearchItem,
  TmdbSeasonDetail,
  TmdbTvDetail,
  TmdbTvListItem,
  TmdbTvSeasonsResponse,
} from "./types";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_LIST_TTL_MS = 6 * 60 * 60 * 1000;
const TMDB_SEARCH_TTL_MS = 60 * 60 * 1000;
const TMDB_DETAIL_TTL_MS = 24 * 60 * 60 * 1000;

function getApiKey(): string | undefined {
  return process.env.TMDB_API_KEY;
}

export function isTmdbConfigured(): boolean {
  return Boolean(getApiKey());
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const key = getApiKey();
  if (!key) throw new Error("TMDB_API_KEY is not configured");

  const search = new URLSearchParams({ api_key: key, language: "en-US", ...params });
  const url = `${TMDB_BASE}${path}?${search}`;
  const cacheKey = buildCacheKey("tmdb", path, { language: "en-US", ...params });
  const ttlMs = getTmdbCacheTtl(path, params);

  return cacheJson(cacheKey, ttlMs, async () => {
    const res = await fetch(url, {
      cache: "force-cache",
      next: { revalidate: Math.max(60, Math.floor(ttlMs / 1000)) },
    });

    if (!res.ok) throw new Error(`TMDB request failed (${res.status})`);
    return res.json() as Promise<T>;
  });
}

function getTmdbCacheTtl(path: string, params: Record<string, string>): number {
  if (path.includes("/search/")) return TMDB_SEARCH_TTL_MS;
  if (path.includes("/movie/") || path.includes("/tv/")) {
    if (path.includes("/similar") || path.includes("/season/")) return TMDB_LIST_TTL_MS;
    if (Object.prototype.hasOwnProperty.call(params, "append_to_response")) return TMDB_DETAIL_TTL_MS;
    if (/\d+$/.test(path)) return TMDB_DETAIL_TTL_MS;
  }
  if (path.includes("/discover/") || path.includes("/trending/")) return TMDB_LIST_TTL_MS;
  return TMDB_LIST_TTL_MS;
}

export async function fetchTvTopRated(page = 1) {
  return tmdbFetch<TmdbPagedResponse<TmdbTvListItem>>("/tv/top_rated", {
    page: String(page),
  });
}

export async function fetchTvOnTheAir(page = 1) {
  return tmdbFetch<TmdbPagedResponse<TmdbTvListItem>>("/tv/on_the_air", {
    page: String(page),
  });
}

export async function discoverTv(options: {
  page?: number;
  genre?: Genre;
  sortBy?: string;
}) {
  const params: Record<string, string> = {
    page: String(options.page ?? 1),
    sort_by: options.sortBy ?? "popularity.desc",
    include_adult: "false",
  };

  if (options.genre) {
    params.with_genres = String(genreToTmdbId(options.genre));
  }

  return tmdbFetch<TmdbPagedResponse<TmdbTvListItem>>("/discover/tv", params);
}

export async function fetchTvBrowsePage(
  page: number,
  options: { genre?: Genre; sort?: BrowseSort } = {}
) {
  const sort = options.sort ?? "popular";

  if (sort === "top_rated") {
    return fetchTvTopRated(page);
  }

  if (sort === "now_playing") {
    return fetchTvOnTheAir(page);
  }

  if (options.genre) {
    return discoverTv({ page, genre: options.genre, sortBy: "popularity.desc" });
  }

  return fetchTvPopular(page);
}

export async function fetchPopular(page = 1) {
  return tmdbFetch<TmdbPagedResponse<TmdbMovieListItem>>("/movie/popular", {
    page: String(page),
  });
}

export async function fetchTvPopular(page = 1) {
  return tmdbFetch<TmdbPagedResponse<TmdbTvListItem>>("/tv/popular", {
    page: String(page),
  });
}

export async function fetchNowPlaying(page = 1) {
  return tmdbFetch<TmdbPagedResponse<TmdbMovieListItem>>("/movie/now_playing", {
    page: String(page),
  });
}

export async function fetchTopRated(page = 1) {
  return tmdbFetch<TmdbPagedResponse<TmdbMovieListItem>>("/movie/top_rated", {
    page: String(page),
  });
}

export async function discoverMovies(options: {
  page?: number;
  genre?: Genre;
  sortBy?: string;
}) {
  const params: Record<string, string> = {
    page: String(options.page ?? 1),
    sort_by: options.sortBy ?? "popularity.desc",
    include_adult: "false",
    include_video: "false",
  };

  if (options.genre) {
    params.with_genres = String(genreToTmdbId(options.genre));
  }

  return tmdbFetch<TmdbPagedResponse<TmdbMovieListItem>>("/discover/movie", params);
}

export async function searchTmdbMovies(query: string, page = 1) {
  return tmdbFetch<TmdbPagedResponse<TmdbMovieListItem>>("/search/movie", {
    query: query.trim(),
    page: String(page),
    include_adult: "false",
  });
}

export async function searchTmdbTv(query: string, page = 1) {
  return tmdbFetch<TmdbPagedResponse<TmdbTvListItem>>("/search/tv", {
    query: query.trim(),
    page: String(page),
    include_adult: "false",
  });
}

export async function searchTmdbMulti(query: string, page = 1) {
  return tmdbFetch<TmdbPagedResponse<TmdbMultiSearchItem>>("/search/multi", {
    query: query.trim(),
    page: String(page),
    include_adult: "false",
  });
}

export async function fetchTmdbMovie(id: number) {
  return tmdbFetch<TmdbMovieDetail>(`/movie/${id}`, {
    append_to_response: "credits,videos",
  });
}

export async function fetchTmdbTv(id: number) {
  return tmdbFetch<TmdbTvDetail>(`/tv/${id}`, {
    append_to_response: "credits,videos",
  });
}

export async function fetchSimilarMovies(id: number, page = 1) {
  return tmdbFetch<TmdbPagedResponse<TmdbMovieListItem>>(`/movie/${id}/similar`, {
    page: String(page),
  });
}

export async function fetchSimilarTv(id: number, page = 1) {
  return tmdbFetch<TmdbPagedResponse<TmdbTvListItem>>(`/tv/${id}/similar`, {
    page: String(page),
  });
}

export type BrowseSort = "popular" | "top_rated" | "now_playing";

export async function fetchTrendingDay(page = 1) {
  return tmdbFetch<TmdbPagedResponse<TmdbMultiSearchItem>>("/trending/all/day", {
    page: String(page),
  });
}

export async function discoverSinhalaCinema(page = 1) {
  return tmdbFetch<TmdbPagedResponse<TmdbMovieListItem>>("/discover/movie", {
    page: String(page),
    sort_by: "popularity.desc",
    with_original_language: "si",
    include_adult: "false",
  });
}

export async function fetchTvSeasons(tvId: number) {
  return tmdbFetch<TmdbTvSeasonsResponse>(`/tv/${tvId}`, {});
}

export async function fetchTvSeason(tvId: number, season: number) {
  return tmdbFetch<TmdbSeasonDetail>(`/tv/${tvId}/season/${season}`, {});
}

export async function fetchBrowsePage(
  page: number,
  options: { genre?: Genre; sort?: BrowseSort } = {}
) {
  const sort = options.sort ?? "popular";

  if (sort === "top_rated") {
    return fetchTopRated(page);
  }

  if (sort === "now_playing") {
    return fetchNowPlaying(page);
  }

  if (options.genre) {
    return discoverMovies({ page, genre: options.genre, sortBy: "popularity.desc" });
  }

  return fetchPopular(page);
}
