import CatalogPagination from "@/components/CatalogPagination";
import SearchBar from "@/components/SearchBar";
import SearchMediaTabs from "@/components/SearchMediaTabs";
import SearchResults from "@/components/SearchResults";
import { searchCatalog, type SearchMediaFilter } from "@/lib/movie-service";
import { Suspense } from "react";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string; type?: string }>;
}

function parseMediaFilter(value?: string): SearchMediaFilter {
  if (value === "tv" || value === "all") return value;
  return "movie";
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page: pageParam, type: typeParam } = await searchParams;
  const query = q?.trim() ?? "";
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const mediaFilter = parseMediaFilter(typeParam);
  const { movies: results, source, totalResults, totalPages } = await searchCatalog(query, page, mediaFilter);

  const heading =
    mediaFilter === "tv" ? "Search TV Series" : mediaFilter === "all" ? "Search Titles" : "Search Movies";
  const subtitle =
    mediaFilter === "tv"
      ? "Find series from TMDB — movies are filtered out"
      : mediaFilter === "all"
        ? "Browse movies and TV series separately using the tabs below"
        : "Search movies from TMDB — TV series are filtered out";

  return (
    <div className="section-base min-h-full">
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <section className="relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-12 text-center shadow-[var(--shadow-sm)]">
          <span aria-hidden className="search-bg-text">
            SEARCH
          </span>
          <p className="relative z-10 mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent-cool)]">Discover</p>
          <h1 className="relative z-10 font-[var(--font-playfair)] text-[32px] font-bold text-[var(--text-primary)]">{heading}</h1>
          <div className="relative z-10 mt-6 w-full max-w-3xl">
            <Suspense fallback={null}>
              <SearchBar defaultValue={query} large autoFocus />
            </Suspense>
          </div>
          <div className="relative z-10 mt-5">
            <SearchMediaTabs activeFilter={mediaFilter} query={query} />
          </div>
          <p className="relative z-10 mt-4 text-[13px] text-[var(--text-secondary)]">{subtitle}</p>
        </section>
      </div>

      <div className="section-alt border-t border-[var(--border)] px-6 pb-16 pt-10">
        <div className="mx-auto max-w-[1280px]">
          <SearchResults
            movies={results}
            query={query}
            page={page}
            totalPages={totalPages}
            emptyMessage={`No ${mediaFilter === "tv" ? "TV series" : mediaFilter === "all" ? "titles" : "movies"} found for "${query}". Try another search.`}
            source={source}
            totalResults={totalResults}
            mediaFilter={mediaFilter}
          />
          <CatalogPagination
            page={page}
            totalPages={totalPages}
            basePath="/search"
            query={{ q: query || undefined, type: mediaFilter !== "movie" ? mediaFilter : undefined }}
          />
        </div>
      </div>
    </div>
  );
}
