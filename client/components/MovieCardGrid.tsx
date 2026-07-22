import ExternalRatingsProvider from "@/components/external-ratings/ExternalRatingsProvider";
import MovieCard from "@/components/movie-card/MovieCard";
import type { Movie } from "@/lib/types";
import { memo } from "react";

interface MovieCardGridProps {
  movies: Movie[];
  className?: string;
}

function MovieCardGrid({ movies, className }: MovieCardGridProps) {
  return (
    <ExternalRatingsProvider movies={movies} className={className}>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </ExternalRatingsProvider>
  );
}

export default memo(MovieCardGrid);
