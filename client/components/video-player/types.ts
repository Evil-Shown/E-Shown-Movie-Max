import type { Movie } from "@/lib/types";
import type { StreamProvider } from "@/lib/providers";

export type PlayerMode = "movie" | "trailer";

export interface OpenMovieOptions {
  season?: number;
  episode?: number;
  provider?: StreamProvider;
  resumeSeconds?: number;
}

export interface ActivePlayer {
  movie: Movie;
  mode: PlayerMode;
  season?: number;
  episode?: number;
  provider: StreamProvider;
  resumeSeconds?: number;
}

export const NEXT_EPISODE_COUNTDOWN_SECONDS = 5;
