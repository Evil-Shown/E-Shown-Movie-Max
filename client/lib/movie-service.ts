import {
  allGenres,
  getFeaturedMovie,
  getMovieById as getLocalMovieById,
  getMoviesByGenre as getLocalMoviesByGenre,
  getNewReleases,
  getTrendingMovies,
  movies as localMovies,
  searchMovies as searchLocalMovies,
  getSimilarMovies as getLocalSimilarMovies,
} from "@/lib/movies";
import type { Genre, MediaType, Movie } from "@/lib/types";
import { fetchOmdbByImdbId, isOmdbConfigured, searchOmdb, searchOmdbSeries } from "@/lib/omdb/client";
import { mapOmdbDetail, mapOmdbSearchItem } from "@/lib/omdb/map";
import {
  discoverMovies,
  discoverSinhalaCinema,
  fetchBrowsePage,
  fetchNowPlaying,
  fetchPopular,
  fetchSimilarMovies,
  fetchSimilarTv,
  fetchTmdbMovie,
  fetchTmdbTv,
  fetchTopRated,
  fetchTrendingDay,
  fetchTvPopular,
  isTmdbConfigured,
  searchTmdbMovies,
  searchTmdbMulti,
  searchTmdbTv,
  type BrowseSort,
} from "@/lib/tmdb/client";
import { mapTmdbDetail, mapTmdbListItem, mapTmdbMultiItem, mapTmdbTvDetail, mapTmdbTvListItem } from "@/lib/tmdb/map";

export type { BrowseSort } from "@/lib/tmdb/client";

export type CatalogSource = "local" | "tmdb" | "omdb" | "mixed";

export type SearchMediaFilter = MediaType | "all";

export interface PagedCatalog {
  movies: Movie[];
  source: CatalogSource;
  page: number;
  totalPages: number;
  totalResults: number;
}

export interface CatalogStats {
  filmCount: number;
  genreCount: number;
  avgRating: number;
}

export interface HomeCatalog {
  featured: Movie;
  heroMovies: Movie[];
  trending: Movie[];
  trendingDay: Movie[];
  newReleases: Movie[];
  topRated: Movie[];
  popularTv: Movie[];
  sinhalaCinema: Movie[];
  sciFi: Movie[];
  drama: Movie[];
  source: CatalogSource;
  stats: CatalogStats;
}

function computeAvgRating(movies: Movie[]): number {
  if (!movies.length) return 0;
  const sum = movies.reduce((acc, movie) => acc + movie.rating, 0);
  return Math.round((sum / movies.length) * 10) / 10;
}

function uniqueMovies(movies: Movie[]): Movie[] {
  const seen = new Set<string>();
  return movies.filter((movie) => {
    if (seen.has(movie.id)) return false;
    seen.add(movie.id);
    return true;
  });
}

function buildLocalStats(): CatalogStats {
  return {
    filmCount: localMovies.length,
    genreCount: allGenres.length,
    avgRating: computeAvgRating(localMovies),
  };
}

function emptyPage(movies: Movie[], source: CatalogSource = "local"): PagedCatalog {
  return {
    movies,
    source,
    page: 1,
    totalPages: 1,
    totalResults: movies.length,
  };
}

export async function resolveMovie(id: string): Promise<Movie | null> {
  const local = getLocalMovieById(id);
  if (local) return local;

  if (id.startsWith("tv-") && isTmdbConfigured()) {
    const tvId = Number(id.slice(3));
    if (Number.isFinite(tvId)) {
      try {
        const detail = await fetchTmdbTv(tvId);
        return mapTmdbTvDetail(detail);
      } catch {
        return null;
      }
    }
  }

  if (/^\d+$/.test(id) && isTmdbConfigured()) {
    try {
      const detail = await fetchTmdbMovie(Number(id));
      return mapTmdbDetail(detail);
    } catch {
      return null;
    }
  }

  if (isOmdbConfigured() && /^tt\d+$/.test(id)) {
    try {
      const detail = await fetchOmdbByImdbId(id);
      if (detail.Response !== "True") return null;
      return mapOmdbDetail(detail);
    } catch {
      return null;
    }
  }

  return null;
}

export async function getSimilarMovies(movie: Movie, limit = 8): Promise<Movie[]> {
  const isTv = movie.mediaType === "tv" || movie.id.startsWith("tv-");

  if (isTv && isTmdbConfigured()) {
    const tvId = Number(movie.id.replace(/^tv-/, ""));
    if (Number.isFinite(tvId)) {
      try {
        const response = await fetchSimilarTv(tvId);
        return response.results.slice(0, limit).map(mapTmdbTvListItem);
      } catch {
        return getLocalSimilarMovies(movie, limit);
      }
    }
  }

  if (/^\d+$/.test(movie.id) && isTmdbConfigured()) {
    try {
      const response = await fetchSimilarMovies(Number(movie.id));
      return response.results.slice(0, limit).map(mapTmdbListItem);
    } catch {
      return getLocalSimilarMovies(movie, limit);
    }
  }

  return getLocalSimilarMovies(movie, limit);
}

export async function getHomeCatalog(): Promise<HomeCatalog> {
  if (!isTmdbConfigured()) {
    const topRated = [...localMovies].sort((a, b) => b.rating - a.rating).slice(0, 8);
    const heroMovies = getTrendingMovies().slice(0, 5);
    return {
      featured: getFeaturedMovie(),
      heroMovies,
      trending: getTrendingMovies(),
      trendingDay: getTrendingMovies(),
      newReleases: getNewReleases(),
      topRated,
      popularTv: [],
      sinhalaCinema: [],
      sciFi: getLocalMoviesByGenre("Sci-Fi"),
      drama: getLocalMoviesByGenre("Drama"),
      source: "local",
      stats: buildLocalStats(),
    };
  }

  try {
    const [popular, nowPlaying, topRatedRes, sciFiRes, dramaRes, trendingDayRes, tvPopularRes, sinhalaRes] =
      await Promise.all([
      fetchPopular(1),
      fetchNowPlaying(1),
      fetchTopRated(1),
      discoverMovies({ genre: "Sci-Fi", page: 1 }),
      discoverMovies({ genre: "Drama", page: 1 }),
      fetchTrendingDay(1),
      fetchTvPopular(1),
      discoverSinhalaCinema(1).catch(() => ({ results: [], page: 1, total_pages: 0, total_results: 0 })),
    ]);

    const trending = popular.results.map(mapTmdbListItem);
    const heroMovies = nowPlaying.results.slice(0, 7).map(mapTmdbListItem);
    const featured = heroMovies[0] ?? trending[0] ?? getFeaturedMovie();
    const newReleases = nowPlaying.results.map(mapTmdbListItem);
    const topRated = topRatedRes.results.slice(0, 8).map(mapTmdbListItem);
    const trendingDay = trendingDayRes.results
      .map(mapTmdbMultiItem)
      .filter((item): item is Movie => item !== null)
      .slice(0, 12);
    const popularTv = tvPopularRes.results.map(mapTmdbTvListItem);
    const sinhalaCinema = sinhalaRes.results.map(mapTmdbListItem);
    const sciFi = sciFiRes.results.map(mapTmdbListItem);
    const drama = dramaRes.results.map(mapTmdbListItem);
    const sampled = uniqueMovies([...trending, ...newReleases, ...topRated, ...sciFi, ...drama]);

    return {
      featured,
      heroMovies: heroMovies.length ? heroMovies : [featured],
      trending,
      trendingDay,
      newReleases,
      topRated,
      popularTv,
      sinhalaCinema,
      sciFi,
      drama,
      source: "tmdb",
      stats: {
        filmCount: popular.total_results,
        genreCount: allGenres.length,
        avgRating: computeAvgRating(sampled),
      },
    };
  } catch {
    return getHomeCatalogFallback();
  }
}

function getHomeCatalogFallback(): HomeCatalog {
  const topRated = [...localMovies].sort((a, b) => b.rating - a.rating).slice(0, 8);
  const heroMovies = getTrendingMovies().slice(0, 5);
  return {
    featured: getFeaturedMovie(),
    heroMovies,
    trending: getTrendingMovies(),
    trendingDay: getTrendingMovies(),
    newReleases: getNewReleases(),
    topRated,
    popularTv: [],
    sinhalaCinema: [],
    sciFi: getLocalMoviesByGenre("Sci-Fi"),
    drama: getLocalMoviesByGenre("Drama"),
    source: "local",
    stats: buildLocalStats(),
  };
}

export async function browseCatalog(options: {
  genre?: Genre | null;
  page?: number;
  pages?: number;
  sort?: BrowseSort;
}): Promise<PagedCatalog & { lastLoadedPage: number }> {
  const startPage = Math.max(1, options.page ?? 1);
  const pageCount = Math.max(1, options.pages ?? 1);
  const sort = options.sort ?? "popular";

  if (isTmdbConfigured()) {
    try {
      const responses = await Promise.all(
        Array.from({ length: pageCount }, (_, index) =>
          fetchBrowsePage(startPage + index, {
            genre: options.genre ?? undefined,
            sort,
          })
        )
      );

      const seen = new Set<string>();
      const movies: Movie[] = [];

      for (const response of responses) {
        for (const item of response.results) {
          const movie = mapTmdbListItem(item);
          if (seen.has(movie.id)) continue;
          seen.add(movie.id);
          movies.push(movie);
        }
      }

      const last = responses[responses.length - 1];

      return {
        movies,
        source: "tmdb",
        page: startPage,
        totalPages: last.total_pages,
        totalResults: last.total_results,
        lastLoadedPage: startPage + pageCount - 1,
      };
    } catch {
      // fall through to local
    }
  }

  const filtered = options.genre ? getLocalMoviesByGenre(options.genre) : localMovies;
  const sorted = [...filtered].sort((a, b) => b.rating - a.rating);

  return {
    movies: sorted,
    source: "local",
    page: 1,
    totalPages: 1,
    totalResults: sorted.length,
    lastLoadedPage: 1,
  };
}

export { isTmdbConfigured };

export async function searchCatalog(
  query: string,
  page = 1,
  mediaFilter: SearchMediaFilter = "movie"
): Promise<PagedCatalog> {
  const trimmed = query.trim();
  const safePage = Math.max(1, page);

  if (!trimmed) {
    if (isTmdbConfigured()) {
      try {
        if (mediaFilter === "tv") {
          const response = await fetchTvPopular(safePage);
          return {
            movies: response.results.map(mapTmdbTvListItem),
            source: "tmdb",
            page: response.page,
            totalPages: response.total_pages,
            totalResults: response.total_results,
          };
        }

        if (mediaFilter === "all") {
          const [moviesRes, tvRes] = await Promise.all([
            fetchPopular(safePage),
            fetchTvPopular(safePage),
          ]);
          const movies = [
            ...moviesRes.results.map(mapTmdbListItem),
            ...tvRes.results.map(mapTmdbTvListItem),
          ];

          return {
            movies,
            source: "tmdb",
            page: safePage,
            totalPages: Math.max(moviesRes.total_pages, tvRes.total_pages),
            totalResults: moviesRes.total_results + tvRes.total_results,
          };
        }

        const response = await fetchPopular(safePage);
        return {
          movies: response.results.map(mapTmdbListItem),
          source: "tmdb",
          page: response.page,
          totalPages: response.total_pages,
          totalResults: response.total_results,
        };
      } catch {
        return emptyPage(localMovies);
      }
    }
    return emptyPage(localMovies);
  }

  if (isTmdbConfigured()) {
    try {
      if (mediaFilter === "tv") {
        const response = await searchTmdbTv(trimmed, safePage);
        return {
          movies: response.results.map(mapTmdbTvListItem),
          source: "tmdb",
          page: response.page,
          totalPages: response.total_pages,
          totalResults: response.total_results,
        };
      }

      if (mediaFilter === "all") {
        const response = await searchTmdbMulti(trimmed, safePage);
        const movies = response.results
          .map(mapTmdbMultiItem)
          .filter((item): item is Movie => item !== null);

        return {
          movies,
          source: "tmdb",
          page: response.page,
          totalPages: response.total_pages,
          totalResults: response.total_results,
        };
      }

      const response = await searchTmdbMovies(trimmed, safePage);
      return {
        movies: response.results.map(mapTmdbListItem),
        source: "tmdb",
        page: response.page,
        totalPages: response.total_pages,
        totalResults: response.total_results,
      };
    } catch {
      // fall through
    }
  }

  const local = searchLocalMovies(trimmed).filter((movie) =>
    mediaFilter === "all" ? true : (movie.mediaType ?? "movie") === mediaFilter
  );

  if (!isOmdbConfigured()) {
    return emptyPage(local);
  }

  try {
    if (mediaFilter === "all") {
      const [moviesRes, seriesRes] = await Promise.all([
        searchOmdb(trimmed, safePage).catch(() => null),
        searchOmdbSeries(trimmed, safePage).catch(() => null),
      ]);

      const remote = [
        ...(moviesRes?.Response === "True" ? moviesRes.Search ?? [] : []),
        ...(seriesRes?.Response === "True" ? seriesRes.Search ?? [] : []),
      ].map(mapOmdbSearchItem);

      const seen = new Set<string>();
      const merged: Movie[] = [];

      for (const movie of [...local, ...remote]) {
        if (seen.has(movie.id)) continue;
        seen.add(movie.id);
        merged.push(movie);
      }

      const movieTotal = Number.parseInt(moviesRes?.totalResults ?? "0", 10) || 0;
      const seriesTotal = Number.parseInt(seriesRes?.totalResults ?? "0", 10) || 0;
      const totalResults = movieTotal + seriesTotal || merged.length;

      return {
        movies: merged,
        source: local.length ? "mixed" : "omdb",
        page: safePage,
        totalPages: Math.max(1, Math.ceil(totalResults / 10)),
        totalResults,
      };
    }

    const omdbSearch = mediaFilter === "tv" ? searchOmdbSeries : searchOmdb;

    const response = await omdbSearch(trimmed, safePage);
    if (response.Response !== "True" || !response.Search?.length) {
      return emptyPage(local, local.length ? "mixed" : "local");
    }

    const allowedTypes =
      mediaFilter === "tv" ? new Set(["series"]) : new Set(["movie"]);

    const remote = response.Search.filter((item) => allowedTypes.has(item.Type)).map(mapOmdbSearchItem);
    const seen = new Set<string>();
    const merged: Movie[] = [];

    for (const movie of [...local, ...remote]) {
      if (seen.has(movie.id)) continue;
      seen.add(movie.id);
      merged.push(movie);
    }

    const totalResults = Number.parseInt(response.totalResults ?? "0", 10) || merged.length;

    return {
      movies: merged,
      source: local.length ? "mixed" : "omdb",
      page: safePage,
      totalPages: Math.max(1, Math.ceil(totalResults / 10)),
      totalResults,
    };
  } catch {
    return emptyPage(local);
  }
}
