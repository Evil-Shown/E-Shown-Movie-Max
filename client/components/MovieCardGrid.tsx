import ExternalRatingsProvider from "@/components/external-ratings/ExternalRatingsProvider";
import MovieCard from "@/components/movie-card/MovieCard";
import type { Movie } from "@/lib/types";

interface MovieCardGridProps {
  movies: Movie[];
  className?: string;
}

export default function MovieCardGrid({ movies, className }: MovieCardGridProps) {
  return (
    <ExternalRatingsProvider movies={movies} className={className}>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </ExternalRatingsProvider>
  );
}
