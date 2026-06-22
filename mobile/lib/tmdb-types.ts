/**
 * Core domain types — reconstructed from usage across the recovered web app
 * source (lib/tmdb/map.ts, lib/omdb/map.ts, lib/movie-service.ts, and every
 * component that consumes `Movie`). The original lib/types.ts file itself
 * wasn't recoverable from build source maps (types-only files often get
 * fully erased before bundling, leaving no JS chunk to map back to), so this
 * is a faithful reconstruction rather than a byte-for-byte copy.
 *
 * If you find a field mismatch against the live web app, treat this file as
 * the thing to fix — not the components using it.
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
  /** Curated local-dataset flags — used only by the fallback dataset. */
  featured?: boolean;
  trending?: boolean;
  newRelease?: boolean;
}
