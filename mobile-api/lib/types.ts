/**
 * Core domain types for the mobile-api backend.
 *
 * Reconstructed from usage across lib/movie-service.ts, lib/tmdb/*.ts, and
 * lib/omdb/*.ts (the original lib/types.ts wasn't recoverable from build
 * source maps — type-only files get erased before bundling). Genre is a
 * string literal union here, confirmed by lib/tmdb/genres.ts using it as
 * `Record<Genre, number>` keys against the twelve TMDB genres the app
 * filters on.
 */

export type MediaType = 'movie' | 'tv';

export type Genre =
  | 'Action'
  | 'Adventure'
  | 'Animation'
  | 'Comedy'
  | 'Crime'
  | 'Drama'
  | 'Fantasy'
  | 'Horror'
  | 'Mystery'
  | 'Romance'
  | 'Sci-Fi'
  | 'Thriller';

export interface CastMember {
  name: string;
  role: string;
}

export interface Movie {
  /** TMDB id as a string for movies; "tv-<id>" prefix for TV shows. */
  id: string;
  /** Defaults to "movie" when absent — only set explicitly for TV results. */
  mediaType?: MediaType;
  title: string;
  tagline: string;
  overview: string;
  /** TMDB poster path fragment, e.g. "/abc123.jpg" — empty string if none. */
  posterPath: string;
  backdropPath: string;
  /** 0-10, rounded to 1 decimal. */
  rating: number;
  year: number;
  /** Minutes. 0 if unknown (e.g. list items before detail fetch). */
  runtime: number;
  genres: Genre[];
  director: string;
  cast: CastMember[];
  /** YouTube video key for the trailer, if one was found. */
  trailerKey?: string;
  /** IMDb id (tt...), present on detail fetches, used for OMDb fallback. */
  imdbId?: string;
  /** Curated local-dataset flags — used only by lib/movies.ts fallback data. */
  featured?: boolean;
  trending?: boolean;
  newRelease?: boolean;
}
