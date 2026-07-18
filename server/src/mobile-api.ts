import { Router, type Request, type Response, type NextFunction } from "express";
import axios from "axios";
import { env } from "./config/env";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

interface TMDBConfig {
  apiKey: string;
  language: string;
  region: string;
}

interface TMDBMovie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  adult?: boolean;
  original_language?: string;
  popularity?: number;
  media_type?: string;
  genres?: Array<{ id: number; name: string }>;
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: Array<{
    id: number;
    season_number: number;
    name: string;
    overview: string;
    poster_path: string | null;
    air_date: string;
    episode_count: number;
  }>;
  production_companies?: Array<{ id: number; name: string; logo_path: string | null; origin_country: string }>;
  production_countries?: Array<{ iso_3166_1: string; name: string }>;
  spoken_languages?: Array<{ english_name: string; iso_639_1: string; name: string }>;
  status?: string;
  tagline?: string;
  homepage?: string;
  external_ids?: Record<string, string | number>;
  credits?: {
    cast: Array<{ id: number; name: string; character: string; profile_path: string | null }>;
    crew: Array<{ id: number; name: string; job: string; profile_path: string | null }>;
  };
  videos?: { results: Array<{ key: string; name: string; site: string; type: string }> };
  "watch/providers"?: { results: Record<string, unknown> };
}

interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

interface TMDBVideoResponse {
  results: Array<{ key: string; name: string; site: string; type: string }>;
}

interface TMDBGenre {
  id: number;
  name: string;
}

interface TMDBGenresResponse {
  genres: TMDBGenre[];
}

function getTMDBConfig(): TMDBConfig {
  const apiKey = env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB_API_KEY not configured on server");
  }
  return {
    apiKey,
    language: "en-US",
    region: "US",
  };
}

function tmdbParams(extra: Record<string, string> = {}): Record<string, string> {
  const cfg = getTMDBConfig();
  return {
    api_key: cfg.apiKey,
    language: cfg.language,
    region: cfg.region,
    ...extra,
  };
}

async function tmdbGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const cfg = getTMDBConfig();
  const response = await axios.get<T>(`${TMDB_BASE}${path}`, {
    params: tmdbParams(params),
    timeout: 10000,
  });
  return response.data;
}

function sanitizeQuery(query: unknown): string {
  if (typeof query !== "string") return "";
  return query.replace(/\s+/g, " ").trim();
}

function parsePositiveInt(value: unknown, fallback: number, max: number): number {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function getImageUrl(path: string | null | undefined, size: string = "w500"): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

function mapMovie(data: any): any {
  return {
    id: String(data.id),
    tmdbId: String(data.id),
    title: data.title || data.name || "Unknown",
    overview: data.overview || "",
    posterPath: data.poster_path,
    backdropPath: data.backdrop_path,
    releaseDate: data.release_date || data.first_air_date,
    voteAverage: data.vote_average || 0,
    voteCount: data.vote_count || 0,
    genreIds: data.genre_ids || [],
    adult: data.adult || false,
    originalLanguage: data.original_language,
    popularity: data.popularity || 0,
    mediaType: data.media_type || (data.name ? "tv" : "movie"),
  };
}

function mapMovieDetail(data: any): any {
  return {
    ...mapMovie(data),
    runtime: data.runtime || data.episode_run_time?.[0],
    numberOfSeasons: data.number_of_seasons,
    numberOfEpisodes: data.number_of_episodes,
    seasons:
      data.seasons?.map((s: any) => ({
        id: s.id,
        seasonNumber: s.season_number,
        name: s.name,
        overview: s.overview,
        posterPath: s.poster_path,
        airDate: s.air_date,
        episodeCount: s.episode_count,
      })) || [],
    productionCompanies:
      data.production_companies?.map((c: any) => ({
        id: c.id,
        name: c.name,
        logoPath: c.logo_path,
        originCountry: c.origin_country,
      })) || [],
    productionCountries:
      data.production_countries?.map((c: any) => ({
        iso3166_1: c.iso_3166_1,
        name: c.name,
      })) || [],
    spokenLanguages:
      data.spoken_languages?.map((l: any) => ({
        englishName: l.english_name,
        iso639_1: l.iso_639_1,
        name: l.name,
      })) || [],
    status: data.status,
    tagline: data.tagline,
    homepage: data.homepage,
  };
}

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "mobile-api" });
});

router.get("/home", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [trending, popular, topRated, nowPlaying, popularTv, topRatedTv, onTheAir] = await Promise.all([
      tmdbGet<TMDBPaginatedResponse<TMDBMovie>>("/trending/all/week", { page: "1" }),
      tmdbGet<TMDBPaginatedResponse<TMDBMovie>>("/movie/popular", { page: "1" }),
      tmdbGet<TMDBPaginatedResponse<TMDBMovie>>("/movie/top_rated", { page: "1" }),
      tmdbGet<TMDBPaginatedResponse<TMDBMovie>>("/movie/now_playing", { page: "1" }),
      tmdbGet<TMDBPaginatedResponse<TMDBMovie>>("/tv/popular", { page: "1" }),
      tmdbGet<TMDBPaginatedResponse<TMDBMovie>>("/tv/top_rated", { page: "1" }),
      tmdbGet<TMDBPaginatedResponse<TMDBMovie>>("/tv/on_the_air", { page: "1" }),
    ]);

    const featured = trending.results[0] || popular.results[0];

    const catalog = {
      featured: mapMovieDetail(featured),
      heroMovies: trending.results.slice(0, 10).map(mapMovie),
      trending: trending.results.slice(0, 20).map(mapMovie),
      trendingDay: trending.results.slice(0, 10).map(mapMovie),
      newReleases: nowPlaying.results.slice(0, 20).map(mapMovie),
      topRated: topRated.results.slice(0, 20).map(mapMovie),
      popularTv: popularTv.results.slice(0, 20).map(mapMovie),
      sinhalaCinema: [], // Placeholder for local content
      sciFi: trending.results
        .filter((m: any) => m.genre_ids?.includes(878))
        .slice(0, 20)
        .map(mapMovie),
      drama: trending.results
        .filter((m: any) => m.genre_ids?.includes(18))
        .slice(0, 20)
        .map(mapMovie),
      source: "tmdb",
      stats: {
        filmCount: 0,
        genreCount: 0,
        avgRating: 0,
      },
    };

    res.json(catalog);
  } catch (error) {
    next(error);
  }
});

router.get("/browse", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parsePositiveInt(req.query.page, 1, 500);
    const genre = sanitizeQuery(req.query.genre);
    const sort = sanitizeQuery(req.query.sort) || "popular";

    let endpoint = "/discover/movie";
    const params: Record<string, string> = { page: String(page) };

    if (genre) params.with_genres = genre;

    switch (sort) {
      case "top_rated":
        params.sort_by = "vote_average.desc";
        params.vote_count_gte = "100";
        break;
      case "now_playing":
        endpoint = "/movie/now_playing";
        break;
      case "popular":
      default:
        params.sort_by = "popularity.desc";
        break;
    }

    const data = await tmdbGet<TMDBPaginatedResponse<TMDBMovie>>(endpoint, params);

    const result = {
      movies: data.results.map(mapMovie),
      source: "tmdb",
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      lastLoadedPage: data.page,
    };

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/search", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = sanitizeQuery(req.query.q);
    const page = parsePositiveInt(req.query.page, 1, 500);
    const media = sanitizeQuery(req.query.media) || "multi";

    if (!query || query.length < 2) {
      res.status(400).json({ error: "Query must be at least 2 characters" });
      return;
    }

    const data = await tmdbGet<TMDBPaginatedResponse<TMDBMovie>>(`/search/${media}`, { query, page: String(page) });

    const result = {
      movies: data.results.map(mapMovie),
      source: "tmdb",
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      lastLoadedPage: data.page,
    };

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/movie/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = sanitizeQuery(req.params.id);
    const data = await tmdbGet<TMDBMovie>(`/movie/${id}`, { append_to_response: "credits,videos,images,similar" });
    res.json(mapMovieDetail(data));
  } catch (error) {
    next(error);
  }
});

router.get("/movie/:id/similar", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = sanitizeQuery(req.params.id);
    const limit = parsePositiveInt(req.query.limit, 8, 20);
    const data = await tmdbGet<TMDBPaginatedResponse<TMDBMovie>>(`/movie/${id}/similar`, { page: "1" });
    res.json({ movies: data.results.slice(0, limit).map(mapMovie) });
  } catch (error) {
    next(error);
  }
});

router.get("/tv/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = sanitizeQuery(req.params.id);
    const data = await tmdbGet<TMDBMovie>(`/tv/${id}`, { append_to_response: "credits,videos,images" });
    res.json(mapMovieDetail(data));
  } catch (error) {
    next(error);
  }
});

router.get("/tv/:id/seasons", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = sanitizeQuery(req.params.id);
    const data = await tmdbGet<TMDBMovie>(`/tv/${id}`, { append_to_response: "credits" });
    res.json({
      seasons: (data.seasons || []).map((s: any) => ({
        id: s.id,
        season_number: s.season_number,
        name: s.name,
        overview: s.overview,
        poster_path: s.poster_path,
        air_date: s.air_date,
        episode_count: s.episode_count,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/tv/:id/season/:seasonNumber", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = sanitizeQuery(req.params.id);
    const seasonNumber = sanitizeQuery(req.params.seasonNumber);
    const data = await tmdbGet<any>(`/tv/${id}/season/${seasonNumber}`);
    res.json({
      episodes: (data.episodes || []).map((ep: any) => ({
        id: ep.id,
        episode_number: ep.episode_number,
        season_number: ep.season_number,
        name: ep.name,
        overview: ep.overview,
        still_path: ep.still_path,
        air_date: ep.air_date,
        runtime: ep.runtime,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/genres/movie", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await tmdbGet<TMDBGenresResponse>("/genre/movie/list");
    res.json({ genres: data.genres });
  } catch (error) {
    next(error);
  }
});

router.get("/genres/tv", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await tmdbGet<TMDBGenresResponse>("/genre/tv/list");
    res.json({ genres: data.genres });
  } catch (error) {
    next(error);
  }
});

router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Mobile API error:", err.message);
  if (err.message.includes("TMDB_API_KEY")) {
    res.status(503).json({ error: "Movie data service unavailable" });
    return;
  }
  res.status(502).json({ error: "Upstream service error" });
});

export const mobileApiRouter = router;
