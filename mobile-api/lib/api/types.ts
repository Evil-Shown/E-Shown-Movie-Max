import type { Movie } from '../tmdb-types';

export type CatalogSource = 'local' | 'tmdb' | 'omdb' | 'mixed';
export type BrowseSort = 'popular' | 'top_rated' | 'now_playing';
export type SearchMediaFilter = 'movie' | 'tv' | 'all';

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

export interface PagedCatalog {
  movies: Movie[];
  source: CatalogSource;
  page: number;
  totalPages: number;
  totalResults: number;
}

export interface BrowseResult extends PagedCatalog {
  lastLoadedPage: number;
}

export interface SimilarMoviesResult {
  movies: Movie[];
}

export interface TvSeasonSummary {
  id: number;
  season_number: number;
  name: string;
  overview?: string;
  poster_path?: string | null;
  air_date?: string;
  episode_count?: number;
}

export interface TvSeasonsResult {
  seasons: TvSeasonSummary[];
}

export interface TvEpisode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview?: string;
  still_path?: string | null;
  air_date?: string;
  runtime?: number;
}

export interface TvEpisodesResult {
  episodes: TvEpisode[];
}
