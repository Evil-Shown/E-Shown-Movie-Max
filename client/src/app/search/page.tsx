import MovieGrid from "@/components/MovieGrid";
import SearchBar from "@/components/SearchBar";
import { movies, searchMovies } from "@/lib/movies";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? searchMovies(query) : movies;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Search</h1>
        <p className="mt-2 text-zinc-500">Find movies by title, actor, director, or genre</p>
        <div className="mt-8">
          <SearchBar defaultValue={query} large autoFocus />
        </div>
      </div>

      <div className="mt-12">
        {query ? (
          <p className="mb-6 text-sm text-zinc-500">
            {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
        ) : (
          <p className="mb-6 text-sm text-zinc-500">Showing all titles — start typing to filter</p>
        )}
        <MovieGrid
          movies={results}
          emptyMessage={`No results for "${query}". Try another search.`}
        />
      </div>
    </div>
  );
}
