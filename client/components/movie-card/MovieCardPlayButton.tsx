"use client";

import { useVideoPlayer } from "@/components/VideoPlayerProvider";
import { prefetchMovieStream } from "@/lib/stream-prefetch";
import type { Movie } from "@/lib/types";
import type { MouseEvent } from "react";

interface MovieCardPlayButtonProps {
  movie: Movie;
  className?: string;
}

export default function MovieCardPlayButton({ movie, className }: MovieCardPlayButtonProps) {
  const { openMovie } = useVideoPlayer();

  return (
    <button
      type="button"
      aria-label={`Play ${movie.title}`}
      onMouseEnter={() => prefetchMovieStream(movie)}
      onFocus={() => prefetchMovieStream(movie)}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        openMovie(movie);
      }}
      className={className}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
        <path d="M8 5v14l11-7z" />
      </svg>
      Watch
    </button>
  );
}
