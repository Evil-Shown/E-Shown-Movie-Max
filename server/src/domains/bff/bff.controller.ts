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
  similar: {
    id: string;
    title: string;
    posterUrl: string | null;
    year: number;
    rating: number;
    genres: string[];
  }[];
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
