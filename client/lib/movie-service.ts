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
import { cache } from "react";
import { fetchOmdbByImdbId, isOmdbConfigured } from "@/lib/omdb/client";
import { mapOmdbDetail } from "@/lib/omdb/map";
import {
  discoverMovies,
  discoverAnimeMovies,
  discoverAnimeTv,
  discoverSinhalaCinema,
  discoverTv,
  fetchAnimeTrending,
  fetchAnimeTrendingMovies,
  fetchAnimeTrendingTv,
  fetchBrowsePage,
  fetchNowPlaying,
  fetchPopular,
  fetchSimilarMovies,
  fetchSimilarTv,
  fetchTmdbMovie,
  fetchTmdbTv,
  fetchTopRated,
  fetchTrendingDay,
  fetchTvBrowsePage,
  fetchTvPopular,
  isTmdbConfigured,
  searchTmdbMovies,
  searchTmdbMulti,
  searchTmdbTv,
  type AnimeSort,
  type BrowseSort,
} from "@/lib/tmdb/client";
import { mapTmdbDetail, mapTmdbListItem, mapTmdbMultiItem, mapTmdbTvDetail, mapTmdbTvListItem } from "@/lib/tmdb/map";
import type { TmdbMovieListItem, TmdbTvListItem } from "@/lib/tmdb/types";

export type { BrowseSort, AnimeSort } from "@/lib/tmdb/client";

export type CatalogSource = "local" | "tmdb" | "omdb" | "mixed";

export type SearchMediaFilter = MediaType | "all" | "anime";

export type SearchSort = "popular" | "top_rated" | "newest";

export interface SearchFilterOptions {
  genre?: Genre | null;
  year?: number | null;
  sort?: SearchSort;
  minRating?: number | null;
}

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
      const movie = mapTmdbDetail(detail);
      if (!movie.imdbId || !isOmdbConfigured()) return movie;

      try {
        const omdb = await fetchOmdbByImdbId(movie.imdbId);
        if (omdb.Response !== "True") return movie;
        const enriched = mapOmdbDetail(omdb);
        return {
          ...movie,
          externalRatings: enriched.externalRatings,
        };
      } catch {
        return movie;
      }
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

export const getHomeCatalog = cache(async function getHomeCatalog(): Promise<HomeCatalog> {
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
});

export const getHomeCatalogEssential = cache(async function getHomeCatalogEssential() {
  if (!isTmdbConfigured()) {
    return {
      heroMovies: getTrendingMovies().slice(0, 5),
      trending: getTrendingMovies(),
      trendingDay: getTrendingMovies(),
    };
  }

  try {
    const [nowPlaying, trendingDayRes, popular] = await Promise.all([
      fetchNowPlaying(1),
      fetchTrendingDay(1),
      fetchPopular(1),
    ]);

    const trending = popular.results.map(mapTmdbListItem);
    const heroMovies = nowPlaying.results.slice(0, 7).map(mapTmdbListItem);
    const trendingDay = trendingDayRes.results
      .map(mapTmdbMultiItem)
      .filter((item): item is Movie => item !== null)
      .slice(0, 12);

    return {
      heroMovies: heroMovies.length ? heroMovies : trending.slice(0, 5),
      trending,
      trendingDay: trendingDay.length ? trendingDay : trending,
    };
  } catch {
    const fallback = getHomeCatalogFallback();
    return {
      heroMovies: fallback.heroMovies,
      trending: fallback.trending,
      trendingDay: fallback.trendingDay,
    };
  }
});

export const getHomeCatalogExtended = cache(async function getHomeCatalogExtended() {
  if (!isTmdbConfigured()) {
    const topRated = [...localMovies].sort((a, b) => b.rating - a.rating).slice(0, 8);
    return {
      trending: getTrendingMovies(),
      newReleases: getNewReleases(),
      topRated,
      popularTv: [] as Movie[],
      sinhalaCinema: [] as Movie[],
      sciFi: getLocalMoviesByGenre("Sci-Fi"),
      drama: getLocalMoviesByGenre("Drama"),
      stats: buildLocalStats(),
    };
  }

  try {
    const [popular, nowPlaying, topRatedRes, sciFiRes, dramaRes, tvPopularRes, sinhalaRes] =
      await Promise.all([
        fetchPopular(1),
        fetchNowPlaying(1),
        fetchTopRated(1),
        discoverMovies({ genre: "Sci-Fi", page: 1 }),
        discoverMovies({ genre: "Drama", page: 1 }),
        fetchTvPopular(1),
        discoverSinhalaCinema(1).catch(() => ({ results: [], page: 1, total_pages: 0, total_results: 0 })),
      ]);

    const trending = popular.results.map(mapTmdbListItem);
    const newReleases = nowPlaying.results.map(mapTmdbListItem);
    const topRated = topRatedRes.results.slice(0, 8).map(mapTmdbListItem);
    const popularTv = tvPopularRes.results.map(mapTmdbTvListItem);
    const sinhalaCinema = sinhalaRes.results.map(mapTmdbListItem);
    const sciFi = sciFiRes.results.map(mapTmdbListItem);
    const drama = dramaRes.results.map(mapTmdbListItem);
    const sampled = uniqueMovies([...trending, ...newReleases, ...topRated, ...sciFi, ...drama]);

    return {
      trending,
      newReleases,
      topRated,
      popularTv,
      sinhalaCinema,
      sciFi,
      drama,
      stats: {
        filmCount: popular.total_results,
        genreCount: allGenres.length,
        avgRating: computeAvgRating(sampled),
      },
    };
  } catch {
    const fallback = getHomeCatalogFallback();
    return {
      trending: fallback.trending,
      newReleases: fallback.newReleases,
      topRated: fallback.topRated,
      popularTv: fallback.popularTv,
      sinhalaCinema: fallback.sinhalaCinema,
      sciFi: fallback.sciFi,
      drama: fallback.drama,
      stats: fallback.stats,
    };
  }
});

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

export async function browseTvCatalog(options: {
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
          fetchTvBrowsePage(startPage + index, {
            genre: options.genre ?? undefined,
            sort,
          })
        )
      );

      const seen = new Set<string>();
      const movies: Movie[] = [];

      for (const response of responses) {
        for (const item of response.results) {
          const show = mapTmdbTvListItem(item);
          if (seen.has(show.id)) continue;
          seen.add(show.id);
          movies.push(show);
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
      return {
        movies: [],
        source: "tmdb",
        page: 1,
        totalPages: 1,
        totalResults: 0,
        lastLoadedPage: 1,
      };
    }
  }

  return {
    movies: [],
    source: "local",
    page: 1,
    totalPages: 1,
    totalResults: 0,
    lastLoadedPage: 1,
  };
}

export type AnimeMediaType = "movie" | "tv";

export interface AnimeCatalog {
  trending: Movie[];
  movies: Movie[];
  series: Movie[];
  topRated: Movie[];
  source: CatalogSource;
}

function getLocalAnimeFallback(): AnimeCatalog {
  const animation = getLocalMoviesByGenre("Animation");
  return {
    trending: animation.slice(0, 12),
    movies: animation.filter((m) => m.mediaType !== "tv").slice(0, 12),
    series: animation.filter((m) => m.mediaType === "tv").slice(0, 12),
    topRated: [...animation].sort((a, b) => b.rating - a.rating).slice(0, 12),
    source: "local",
  };
}

export async function getAnimeCatalog(): Promise<AnimeCatalog> {
  if (!isTmdbConfigured()) {
    return getLocalAnimeFallback();
  }

  try {
    const [trendingRaw, moviesRes, seriesRes, topMovies, topSeries] = await Promise.all([
      fetchAnimeTrending(1),
      discoverAnimeMovies({ page: 1, sort: "popular" }),
      discoverAnimeTv({ page: 1, sort: "popular" }),
      discoverAnimeMovies({ page: 1, sort: "top_rated" }),
      discoverAnimeTv({ page: 1, sort: "top_rated" }),
    ]);

    const trendingMapped = uniqueMovies([
      ...trendingRaw.movies.map(mapTmdbListItem),
      ...trendingRaw.tv.map(mapTmdbTvListItem),
    ]).slice(0, 16);

    const topRated = uniqueMovies([
      ...topMovies.results.map(mapTmdbListItem),
      ...topSeries.results.map(mapTmdbTvListItem),
    ])
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 16);

    return {
      trending: trendingMapped,
      movies: moviesRes.results.map(mapTmdbListItem).slice(0, 16),
      series: seriesRes.results.map(mapTmdbTvListItem).slice(0, 16),
      topRated,
      source: "tmdb",
    };
  } catch {
    return getLocalAnimeFallback();
  }
}

export async function browseAnimeCatalog(options: {
  mediaType: AnimeMediaType;
  page?: number;
  pages?: number;
  sort?: AnimeSort;
}): Promise<PagedCatalog & { lastLoadedPage: number }> {
  const startPage = Math.max(1, options.page ?? 1);
  const pageCount = Math.max(1, options.pages ?? 1);
  const sort = options.sort ?? "popular";
  const isTv = options.mediaType === "tv";

  if (isTmdbConfigured()) {
    try {
      const responses = await Promise.all(
        Array.from({ length: pageCount }, (_, index) => {
          const page = startPage + index;
          if (sort === "trending") {
            return isTv ? fetchAnimeTrendingTv(page) : fetchAnimeTrendingMovies(page);
          }
          return isTv ? discoverAnimeTv({ page, sort }) : discoverAnimeMovies({ page, sort });
        })
      );

      const seen = new Set<string>();
      const movies: Movie[] = [];

      for (const response of responses) {
        for (const item of response.results) {
          const mapped = isTv
            ? mapTmdbTvListItem(item as TmdbTvListItem)
            : mapTmdbListItem(item as TmdbMovieListItem);
          if (seen.has(mapped.id)) continue;
          seen.add(mapped.id);
          movies.push(mapped);
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
      // fall through
    }
  }

  const fallback = getLocalAnimeFallback();
  const pool = isTv ? fallback.series : fallback.movies;

  return {
    movies: pool,
    source: "local",
    page: 1,
    totalPages: 1,
    totalResults: pool.length,
    lastLoadedPage: 1,
  };
}

export { isTmdbConfigured };

function toAnimeSort(sort: SearchSort): AnimeSort {
  return sort === "top_rated" ? "top_rated" : "popular";
}

function searchUsesDiscover(
  query: string,
  filters: SearchFilterOptions,
  mediaFilter: SearchMediaFilter
): boolean {
  if (mediaFilter === "anime") return true;
  if (filters.genre || filters.year || filters.minRating) return true;
  if (filters.sort && filters.sort !== "popular") return true;
  if (!query.trim()) return true;
  return Boolean(query.trim() && (filters.genre || filters.year || filters.minRating));
}

function applyLocalSearchFilters(movies: Movie[], filters: SearchFilterOptions): Movie[] {
  let result = [...movies];

  if (filters.genre) {
    result = result.filter((movie) => movie.genres.includes(filters.genre!));
  }
  if (filters.year) {
    result = result.filter((movie) => movie.year === filters.year);
  }
  if (filters.minRating) {
    result = result.filter((movie) => movie.rating >= filters.minRating!);
  }

  if (filters.sort === "top_rated") {
    result.sort((a, b) => b.rating - a.rating);
  } else if (filters.sort === "newest") {
    result.sort((a, b) => b.year - a.year);
  }

  return result;
}

function filterLocalByMedia(movies: Movie[], mediaFilter: SearchMediaFilter): Movie[] {
  if (mediaFilter === "all") return movies;
  if (mediaFilter === "anime") {
    return movies.filter((movie) => movie.genres.includes("Animation"));
  }
  return movies.filter((movie) => (movie.mediaType ?? "movie") === mediaFilter);
}

async function searchCatalogDiscover(
  query: string,
  page: number,
  mediaFilter: SearchMediaFilter,
  filters: SearchFilterOptions
): Promise<PagedCatalog | null> {
  const discoverOpts = {
    page,
    genre: filters.genre ?? undefined,
    year: filters.year ?? undefined,
    minRating: filters.minRating ?? undefined,
    sort: filters.sort ?? "popular",
    query: query.trim() || undefined,
  };

  if (mediaFilter === "anime") {
    const animeSort = toAnimeSort(discoverOpts.sort as SearchSort);
    const [moviesRes, tvRes] = await Promise.all([
      discoverAnimeMovies({ ...discoverOpts, sort: animeSort }),
      discoverAnimeTv({ ...discoverOpts, sort: animeSort }),
    ]);
    const movies = uniqueMovies([
      ...moviesRes.results.map(mapTmdbListItem),
      ...tvRes.results.map(mapTmdbTvListItem),
    ]);

    return {
      movies,
      source: "tmdb",
      page,
      totalPages: Math.max(moviesRes.total_pages, tvRes.total_pages),
      totalResults: moviesRes.total_results + tvRes.total_results,
    };
  }

  if (mediaFilter === "tv") {
    const response = await discoverTv(discoverOpts);
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
      discoverMovies(discoverOpts),
      discoverTv(discoverOpts),
    ]);
    const movies = uniqueMovies([
      ...moviesRes.results.map(mapTmdbListItem),
      ...tvRes.results.map(mapTmdbTvListItem),
    ]);

    return {
      movies,
      source: "tmdb",
      page,
      totalPages: Math.max(moviesRes.total_pages, tvRes.total_pages),
      totalResults: moviesRes.total_results + tvRes.total_results,
    };
  }

  const response = await discoverMovies(discoverOpts);
  return {
    movies: response.results.map(mapTmdbListItem),
    source: "tmdb",
    page: response.page,
    totalPages: response.total_pages,
    totalResults: response.total_results,
  };
}

export async function searchCatalog(
  query: string,
  page = 1,
  mediaFilter: SearchMediaFilter = "movie",
  filters: SearchFilterOptions = {}
): Promise<PagedCatalog> {
  const trimmed = query.trim();
  const safePage = Math.max(1, page);
  const normalizedFilters: SearchFilterOptions = {
    genre: filters.genre ?? null,
    year: filters.year ?? null,
    sort: filters.sort ?? "popular",
    minRating: filters.minRating ?? null,
  };

  if (isTmdbConfigured()) {
    try {
      if (searchUsesDiscover(trimmed, normalizedFilters, mediaFilter)) {
        const result = await searchCatalogDiscover(trimmed, safePage, mediaFilter, normalizedFilters);
        if (result) return result;
      } else {
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

        if (mediaFilter === "anime") {
          const result = await searchCatalogDiscover(trimmed, safePage, "anime", normalizedFilters);
          if (result) return result;
        } else {
          const response = await searchTmdbMovies(trimmed, safePage);
          return {
            movies: response.results.map(mapTmdbListItem),
            source: "tmdb",
            page: response.page,
            totalPages: response.total_pages,
            totalResults: response.total_results,
          };
        }
      }
    } catch {
      // fall through to local
    }
  }

  const base = trimmed ? searchLocalMovies(trimmed) : [...localMovies];
  const filtered = applyLocalSearchFilters(filterLocalByMedia(base, mediaFilter), normalizedFilters);

  if (!isOmdbConfigured()) {
    return emptyPage(filtered);
  }

  return {
    movies: filtered,
    source: "local",
    page: safePage,
    totalPages: 1,
    totalResults: filtered.length,
  };
}
