import type { Movie } from "@/lib/types";
import MovieCard from "./MovieCard";

interface MovieRowProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  priorityFirst?: boolean;
}

export default function MovieRow({
  title,
  subtitle,
  movies,
  priorityFirst = false,
}: MovieRowProps) {
  if (movies.length === 0) return null;

  return (
    <section className="py-8">
      <div className="mx-auto mb-5 max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
      </div>
      <div className="movie-row-scroll flex gap-4 overflow-x-auto px-4 pb-2 sm:px-6 lg:px-8">
        {movies.map((movie, i) => (
          <div key={movie.id} className="w-[140px] sm:w-[160px] md:w-[180px]">
            <MovieCard movie={movie} priority={priorityFirst && i < 4} />
          </div>
        ))}
      </div>
    </section>
  );
}
