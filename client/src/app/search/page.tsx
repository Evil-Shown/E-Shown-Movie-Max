import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import { searchCatalog } from "@/lib/movie-service";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const { movies: results, source, totalResults } = await searchCatalog(query);
  const showingRemote = source === "omdb" || source === "mixed";

  return (
    <div className="section-base min-h-full">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="relative flex min-h-[320px] flex-col items-center justify-center rounded-[2rem] border border-white/10 bg-[rgba(32,38,54,0.36)] px-5 text-center shadow-[0_24px_70px_rgba(0,0,0,0.14)] backdrop-blur-sm">
          <span aria-hidden className="search-bg-text absolute select-none">
            SEARCH
          </span>
          <span aria-hidden className="search-bg-text-secondary absolute select-none">
            EXPLORE
          </span>
          <div className="relative z-10 w-full max-w-2xl">
            <SearchBar defaultValue={query} large autoFocus />
          </div>
          <p className="font-cormorant relative z-10 mt-6 text-xl italic text-[var(--text-secondary)]">
            Find your next obsession.
          </p>
        </section>
      </div>

      <div className="section-alt border-t border-[var(--divider)] px-4 pb-12 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SearchResults
            movies={results}
            query={query}
            emptyMessage={`No results for "${query}". Try another search.`}
            source={showingRemote ? source : undefined}
            totalResults={totalResults}
          />
        </div>
      </div>
    </div>
  );
}
