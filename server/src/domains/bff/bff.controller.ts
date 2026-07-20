import type { Request, Response, NextFunction } from "express";
import { tmdbGet, getTmdbImageUrl } from "../../lib/tmdb";
import { cacheGetJson, cacheSetJson, redisKey } from "../../infrastructure/redis";
import { singleFlight } from "../../infrastructure/single-flight";
import { withCircuitBreaker, tmdbCircuit } from "../../infrastructure/circuit-breaker";
import { logger } from "../../config/logger";

interface TmdbMovieDetail {
  id: number;
  title: string;
  tagline: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number;
  vote_average: number;
  vote_count: number;
  genres: { id: number; name: string }[];
  credits?: { cast: { name: string; character: string }[] };
  similar?: { results: TmdbMovieSummary[] };
  videos?: { results: { key: string; type: string; site: string }[] };
}

interface TmdbMovieSummary {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
}

/** Single movie summary (used for similar, trending, etc.) */
type MovieSummary = {
  id: string;
  title: string;
  posterUrl: string | null;
  year: number;
  rating: number;
  genres: string[];
};

interface MoviePagePayload {
  movie: {
    id: string;
    title: string;
    tagline: string;
    overview: string;
    posterUrl: string | null;
    backdropUrl: string | null;
    year: number;
    runtime: number;
    rating: number;
    genres: string[];
    director: string;
    cast: { name: string; role: string }[];
    trailerKey: string | null;
    mediaType: "movie";
  };
  similar: MovieSummary[];
  meta: {
    cached: boolean;
    fetchedAt: string;
  };
}

/** Map TMDB genre IDs to names */
const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
};

function mapGenreIds(ids: number[]): string[] {
  return ids.map((id) => GENRE_MAP[id] ?? "Unknown").filter(Boolean);
}

/**
 * GET /api/v1/movie-page/:id
 *
 * BFF aggregation endpoint: returns movie details + similar movies + trailer
 * in a single response. Uses Redis SWR cache and circuit breaker protection.
 */
export async function getMoviePage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, error: { code: "MISSING_ID", message: "Movie ID required" } });
      return;
    }

    const cacheKey = `movie-page:${id}`;
    const cached = await cacheGetJson<{ data: MoviePagePayload; storedAt: number }>(redisKey("bff", cacheKey));

    // Serve stale data immediately if available
    if (cached) {
      const age = Date.now() - cached.storedAt;
      const isStale = age > 15 * 60 * 1000; // 15 minutes

      res.setHeader("X-Cache", isStale ? "STALE" : "HIT");
      res.setHeader("Cache-Control", "public, max-age=900, stale-while-revalidate=86400");
      res.json({ success: true, data: cached.data });

      if (!isStale) return;
    }

    // Fetch fresh data using single-flight (only 1 request per movie ID)
    const payload = await singleFlight(
      `bff:movie-page:${id}`,
      () => fetchMoviePageData(id),
      900 // 15 min TTL
    );

    res.setHeader("X-Cache", cached ? "REVALIDATED" : "MISS");
    res.setHeader("Cache-Control", "public, max-age=900, stale-while-revalidate=86400");
    res.json({ success: true, data: payload });
  } catch (error) {
    logger.error({ err: error, id: req.params.id }, "BFF movie-page failed");
    next(error);
  }
}

/**
 * Fetch all movie page data concurrently using Promise.all.
 */
async function fetchMoviePageData(id: string): Promise<MoviePagePayload> {
  const numericId = /^\d+$/.test(id) ? Number(id) : null;
  if (!numericId) {
    throw new Error(`Invalid TMDB movie ID: ${id}`);
  }

  // Fetch movie details + similar + videos concurrently, protected by circuit breaker
  const [detail, similarResponse] = await Promise.all([
    withCircuitBreaker(tmdbCircuit, () =>
      tmdbGet<TmdbMovieDetail>(`/movie/${numericId}`, {
        append_to_response: "credits,videos",
      })
    ),
    withCircuitBreaker(tmdbCircuit, () =>
      tmdbGet<{ results: TmdbMovieSummary[] }>(`/movie/${numericId}/similar`)
    ).catch(() => ({ results: [] })),
  ]);

  // Extract director from credits
  const director =
    detail.credits?.cast?.[0]?.name ?? // Sometimes cast[0] is the director in TMDB
    "Unknown";

  // Find trailer
  const trailer = detail.videos?.results?.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  );

  // Map movie data
  const movie: MoviePagePayload["movie"] = {
    id: String(detail.id),
    title: detail.title,
    tagline: detail.tagline ?? "",
    overview: detail.overview ?? "",
    posterUrl: getTmdbImageUrl(detail.poster_path, "w500"),
    backdropUrl: getTmdbImageUrl(detail.backdrop_path, "original"),
    year: detail.release_date ? new Date(detail.release_date).getFullYear() : 0,
    runtime: detail.runtime ?? 0,
    rating: Math.round((detail.vote_average ?? 0) * 10) / 10,
    genres: detail.genres?.map((g) => g.name) ?? [],
    director,
    cast: (detail.credits?.cast ?? []).slice(0, 20).map((c) => ({
      name: c.name,
      role: c.character,
    })),
    trailerKey: trailer?.key ?? null,
    mediaType: "movie",
  };

  // Map similar movies
  const similar: MoviePagePayload["similar"] = (similarResponse.results ?? [])
    .slice(0, 12)
    .map((m) => ({
      id: String(m.id),
      title: m.title,
      posterUrl: getTmdbImageUrl(m.poster_path, "w500"),
      year: m.release_date ? new Date(m.release_date).getFullYear() : 0,
      rating: Math.round((m.vote_average ?? 0) * 10) / 10,
      genres: mapGenreIds(m.genre_ids ?? []),
    }));

  const payload: MoviePagePayload = {
    movie,
    similar,
    meta: {
      cached: false,
      fetchedAt: new Date().toISOString(),
    },
  };

  // Store in Redis cache
  await cacheSetJson(
    redisKey("bff", `movie-page:${id}`),
    { data: payload, storedAt: Date.now() },
    15 * 60 // 15 min
  );

  return payload;
}

// ── Home Page BFF ─────────────────────────────────────────────────

interface TmdbListResponse {
  results: TmdbMovieSummary[];
  total_pages: number;
  total_results: number;
}

interface HomePagePayload {
  hero: MoviePagePayload["movie"][];
  trending: MovieSummary[];
  trendingDay: MovieSummary[];
  newReleases: MovieSummary[];
  topRated: MovieSummary[];
  popularTv: MovieSummary[];
  meta: { cached: boolean; fetchedAt: string };
}

function mapSummary(m: TmdbMovieSummary): MovieSummary {
  return {
    id: String(m.id),
    title: m.title,
    posterUrl: getTmdbImageUrl(m.poster_path, "w500"),
    year: m.release_date ? new Date(m.release_date).getFullYear() : 0,
    rating: Math.round((m.vote_average ?? 0) * 10) / 10,
    genres: mapGenreIds(m.genre_ids ?? []),
  };
}

/**
 * GET /api/v1/home-page
 *
 * Aggregates all home page data into a single response:
 * - Hero movies (now playing)
 * - Trending movies
 * - Trending today
 * - New releases
 * - Top rated
 * - Popular TV
 */
export async function getHomePage(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cacheKey = "home-page";
    const cached = await cacheGetJson<{ data: HomePagePayload; storedAt: number }>(redisKey("bff", cacheKey));

    if (cached) {
      const age = Date.now() - cached.storedAt;
      const isStale = age > 15 * 60 * 1000;

      res.setHeader("X-Cache", isStale ? "STALE" : "HIT");
      res.setHeader("Cache-Control", "public, max-age=900, stale-while-revalidate=86400");
      res.json({ success: true, data: cached.data });
      if (!isStale) return;
    }

    const payload = await singleFlight("bff:home-page", fetchHomePageData, 900);

    res.setHeader("X-Cache", cached ? "REVALIDATED" : "MISS");
    res.setHeader("Cache-Control", "public, max-age=900, stale-while-revalidate=86400");
    res.json({ success: true, data: payload });
  } catch (error) {
    logger.error({ err: error }, "BFF home-page failed");
    next(error);
  }
}

async function fetchHomePageData(): Promise<HomePagePayload> {
  const [popular, nowPlaying, trendingDay, topRated, tvPopular] = await Promise.all([
    withCircuitBreaker(tmdbCircuit, () => tmdbGet<TmdbListResponse>("/movie/popular", { page: "1" })),
    withCircuitBreaker(tmdbCircuit, () => tmdbGet<TmdbListResponse>("/movie/now_playing", { page: "1" })),
    withCircuitBreaker(tmdbCircuit, () => tmdbGet<TmdbListResponse>("/trending/all/day", { page: "1" })),
    withCircuitBreaker(tmdbCircuit, () => tmdbGet<TmdbListResponse>("/movie/top_rated", { page: "1" })),
    withCircuitBreaker(tmdbCircuit, () => tmdbGet<TmdbListResponse>("/tv/popular", { page: "1" })).catch(() => ({
      results: [],
      total_results: 0,
    })),
  ]);

  const hero = nowPlaying.results.slice(0, 7).map((m) => ({
    id: String(m.id),
    title: m.title,
    tagline: "",
    overview: m.overview ?? "",
    posterUrl: getTmdbImageUrl(m.poster_path, "w500"),
    backdropUrl: getTmdbImageUrl(m.backdrop_path, "original"),
    year: m.release_date ? new Date(m.release_date).getFullYear() : 0,
    runtime: 0,
    rating: Math.round((m.vote_average ?? 0) * 10) / 10,
    genres: mapGenreIds(m.genre_ids ?? []),
    director: "Unknown",
    cast: [],
    trailerKey: null,
    mediaType: "movie" as const,
  }));

  const payload: HomePagePayload = {
    hero,
    trending: popular.results.slice(0, 20).map(mapSummary),
    trendingDay: trendingDay.results.slice(0, 12).map(mapSummary),
    newReleases: nowPlaying.results.slice(0, 20).map(mapSummary),
    topRated: topRated.results.slice(0, 8).map(mapSummary),
    popularTv: tvPopular.results.slice(0, 20).map(mapSummary),
    meta: { cached: false, fetchedAt: new Date().toISOString() },
  };

  await cacheSetJson(redisKey("bff", "home-page"), { data: payload, storedAt: Date.now() }, 15 * 60);
  return payload;
}

// ── Browse Page BFF ───────────────────────────────────────────────

interface BrowsePagePayload {
  movies: MovieSummary[];
  totalPages: number;
  totalResults: number;
  genre: string;
  sort: string;
  meta: { cached: boolean; fetchedAt: string };
}

/**
 * GET /api/v1/browse-page?genre=Action&sort=popular&page=1
 *
 * Aggregates browse/catalog data into a single response.
 */
export async function getBrowsePage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const genre = String(req.query.genre ?? "");
    const sort = String(req.query.sort ?? "popular");
    const page = String(req.query.page ?? "1");

    const cacheKey = `browse-page:${genre}:${sort}:${page}`;
    const cached = await cacheGetJson<{ data: BrowsePagePayload; storedAt: number }>(redisKey("bff", cacheKey));

    if (cached) {
      const age = Date.now() - cached.storedAt;
      const isStale = age > 15 * 60 * 1000;

      res.setHeader("X-Cache", isStale ? "STALE" : "HIT");
      res.setHeader("Cache-Control", "public, max-age=900, stale-while-revalidate=86400");
      res.json({ success: true, data: cached.data });
      if (!isStale) return;
    }

    const payload = await singleFlight(
      `bff:browse-page:${genre}:${sort}:${page}`,
      () => fetchBrowsePageData(genre, sort, page),
      900
    );

    res.setHeader("X-Cache", cached ? "REVALIDATED" : "MISS");
    res.setHeader("Cache-Control", "public, max-age=900, stale-while-revalidate=86400");
    res.json({ success: true, data: payload });
  } catch (error) {
    logger.error({ err: error }, "BFF browse-page failed");
    next(error);
  }
}

async function fetchBrowsePageData(genre: string, sort: string, page: string): Promise<BrowsePagePayload> {
  const params: Record<string, string> = { page };
  if (sort === "top_rated") params.sort_by = "vote_average.desc";
  else if (sort === "newest") params.sort_by = "primary_release_date.desc";
  else params.sort_by = "popularity.desc";

  // If genre is specified, use discover endpoint
  const tmdbPath = genre ? "/discover/movie" : "/movie/popular";
  if (genre) {
    // Map genre name to ID
    const genreId = Object.entries(GENRE_MAP).find(([, name]) => name.toLowerCase() === genre.toLowerCase())?.[0];
    if (genreId) params.with_genres = genreId;
  }

  const response = await withCircuitBreaker(tmdbCircuit, () =>
    tmdbGet<TmdbListResponse>(tmdbPath, params)
  );

  const payload: BrowsePagePayload = {
    movies: response.results.map(mapSummary),
    totalPages: response.total_pages ?? 1,
    totalResults: response.total_results ?? 0,
    genre,
    sort,
    meta: { cached: false, fetchedAt: new Date().toISOString() },
  };

  await cacheSetJson(redisKey("bff", `browse-page:${genre}:${sort}:${page}`), { data: payload, storedAt: Date.now() }, 15 * 60);
  return payload;
}
