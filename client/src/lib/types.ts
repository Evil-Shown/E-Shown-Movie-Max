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
}
