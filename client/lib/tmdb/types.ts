export interface TmdbPagedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbMovieListItem {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids?: number[];
}

export interface TmdbTvListItem {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  genre_ids?: number[];
}

export interface TmdbMultiSearchItem {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids?: number[];
}

export interface TmdbCastMember {
  name: string;
  character: string;
  order: number;
}

export interface TmdbCrewMember {
  name: string;
  job: string;
}

export interface TmdbCredits {
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

export interface TmdbVideo {
  key: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TmdbVideos {
  results: TmdbVideo[];
}

export interface TmdbMovieDetail extends TmdbMovieListItem {
  tagline?: string;
  runtime: number;
  genres: TmdbGenre[];
  credits?: TmdbCredits;
  videos?: TmdbVideos;
  imdb_id?: string | null;
}

export interface TmdbTvDetail extends TmdbTvListItem {
  tagline?: string;
  episode_run_time?: number[];
  genres: TmdbGenre[];
  credits?: TmdbCredits;
  videos?: TmdbVideos;
  created_by?: { name: string }[];
}
