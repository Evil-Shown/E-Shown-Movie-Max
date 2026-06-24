/**
 * OMDb API response shapes — reconstructed from usage in omdb/client.ts and
 * omdb/map.ts (original file not recoverable from build source maps), cross
 * checked against OMDb's documented response field names (PascalCase,
 * "N/A" string sentinel for missing values).
 */

export interface OmdbSearchItem {
  Title: string;
  Year: string;
  imdbID: string;
  Type: 'movie' | 'series' | 'episode';
  Poster: string;
}

export interface OmdbSearchResponse {
  Search?: OmdbSearchItem[];
  totalResults?: string;
  Response: 'True' | 'False';
  Error?: string;
}

export interface OmdbMovieResponse {
  Title: string;
  Year: string;
  Rated?: string;
  Released?: string;
  Runtime?: string;
  Genre?: string;
  Director?: string;
  Writer?: string;
  Actors?: string;
  Plot?: string;
  Language?: string;
  Country?: string;
  Awards?: string;
  Poster: string;
  imdbRating?: string;
  imdbVotes?: string;
  imdbID: string;
  Type: 'movie' | 'series' | 'episode';
  Response: 'True' | 'False';
  Error?: string;
}
