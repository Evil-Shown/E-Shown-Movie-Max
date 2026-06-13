import GenrePills from "@/components/GenrePills";
import MovieGrid from "@/components/MovieGrid";
import { allGenres, getMoviesByGenre, movies } from "@/lib/movies";
import type { Genre } from "@/lib/types";

interface BrowsePageProps {
  searchParams: Promise<{ genre?: string }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const { genre } = await searchParams;
  const activeGenre = genre && allGenres.includes(genre as Genre) ? genre : null;
  const filtered = activeGenre ? getMoviesByGenre(activeGenre as Genre) : movies;
  const sorted = [...filtered].sort((a, b) => b.rating - a.rating);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Browse Library</h1>
        <p className="mt-2 text-zinc-500">
          {sorted.length} title{sorted.length !== 1 ? "s" : ""}
          {activeGenre ? ` in ${activeGenre}` : " across all genres"}
        </p>
      </div>

      <div className="mb-8">
        <GenrePills genres={allGenres} activeGenre={activeGenre} />
      </div>

      <MovieGrid
        movies={sorted}
        emptyMessage={activeGenre ? `No movies in ${activeGenre} yet.` : "No movies found."}
      />
    </div>
  );
}
