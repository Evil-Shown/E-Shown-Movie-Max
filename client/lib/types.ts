export type MediaType = "movie" | "tv";

export type Genre =
  | "Action"
  | "Adventure"
  | "Animation"
  | "Comedy"
  | "Crime"
  | "Drama"
  | "Fantasy"
  | "Horror"
  | "Mystery"
  | "Romance"
  | "Sci-Fi"
  | "Thriller";

export interface CastMember {
  name: string;
  role: string;
}

export interface Movie {
  id: string;
  mediaType?: MediaType;
  title: string;
  tagline: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  rating: number;
  year: number;
  runtime: number;
  genres: Genre[];
  director: string;
  cast: CastMember[];
  featured?: boolean;
  trending?: boolean;
  newRelease?: boolean;
  trailerKey?: string;
  imdbId?: string;
  externalRatings?: {
    imdb?: number;
    rottenTomatoes?: number;
    metascore?: number;
  };
}
