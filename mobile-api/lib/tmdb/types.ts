/**
 * TMDB API response shapes — reconstructed from usage in tmdb/client.ts and
 * tmdb/map.ts (original file not recoverable from build source maps), cross
 * checked against TMDB's public API field naming conventions.
 */

export interface TmdbPagedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbMovieListItem {
  id: number;
  title: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  vote_average?: number;
  genre_ids?: number[];
}

export interface TmdbTvListItem {
  id: number;
  name: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
}

export interface TmdbMultiSearchItem {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
}

export interface TmdbVideo {
  key: string;
  site: string;
  type: string;
  official?: boolean;
}

export interface TmdbCastMember {
  name: string;
  character: string;
}

export interface TmdbCrewMember {
  name: string;
  job: string;
}

export interface TmdbGenreObject {
  id: number;
  name: string;
}

export interface TmdbMovieDetail {
  id: number;
  title: string;
  tagline?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  release_date?: string;
  runtime?: number;
  genres?: TmdbGenreObject[];
  imdb_id?: string | null;
  credits?: {
    cast?: TmdbCastMember[];
    crew?: TmdbCrewMember[];
  };
  videos?: {
    results?: TmdbVideo[];
  };
}

export interface TmdbCreatedBy {
  name: string;
}

export interface TmdbTvDetail {
  id: number;
  name: string;
  tagline?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  first_air_date?: string;
  episode_run_time?: number[];
  genres?: TmdbGenreObject[];
  created_by?: TmdbCreatedBy[];
  credits?: {
    cast?: TmdbCastMember[];
  };
  videos?: {
    results?: TmdbVideo[];
  };
}

export interface TmdbSeasonSummary {
  id: number;
  season_number: number;
  name: string;
  overview?: string;
  poster_path?: string | null;
  air_date?: string;
  episode_count?: number;
}

export interface TmdbTvSeasonsResponse {
  id: number;
  seasons: TmdbSeasonSummary[];
}

export interface TmdbEpisode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview?: string;
  still_path?: string | null;
  air_date?: string;
  runtime?: number;
}

export interface TmdbSeasonDetail {
  id: number;
  season_number: number;
  episodes: TmdbEpisode[];
}
