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
      <section className="relative flex h-[300px] flex-col items-center justify-center text-center">
        <span
          aria-hidden
          className="font-cinzel pointer-events-none absolute text-[8rem] font-bold text-[var(--text-dim)] opacity-30 sm:text-[10rem]"
        >
          SEARCH
        </span>
        <div className="relative z-10 w-full max-w-2xl">
          <SearchBar defaultValue={query} large autoFocus />
        </div>
        <p className="font-cormorant relative z-10 mt-6 text-xl italic text-[var(--text-secondary)]">
          Find your next obsession.
        </p>
      </section>

      <div className="mt-12">
        <p className="mb-6 text-sm text-[var(--text-secondary)]">
          {query
            ? `Found ${results.length} title${results.length !== 1 ? "s" : ""} matching "${query}"`
            : "Showing all titles — start typing to filter"}
        </p>
        <MovieGrid
          movies={results}
          emptyMessage={`No results for "${query}". Try another search.`}
        />
      </div>
    </div>
  );
}
