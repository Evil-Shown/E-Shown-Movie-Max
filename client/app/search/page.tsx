import CatalogPagination from "@/components/CatalogPagination";
import SearchBar from "@/components/SearchBar";
import SearchFilters from "@/components/SearchFilters";
import SearchMediaTabs from "@/components/SearchMediaTabs";
import SearchResults from "@/components/SearchResults";
import {
  hasActiveSearchFilters,
  parseSearchPageParams,
  searchFiltersToQueryRecord,
  searchMediaLabel,
} from "@/lib/search-params";
import { searchCatalog } from "@/lib/movie-service";
import { Suspense } from "react";

export const revalidate = 3600;

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    type?: string;
    genre?: string;
    year?: string;
    sort?: string;
    rating?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const raw = await searchParams;
  const params = parseSearchPageParams(raw);
  const filtersActive = hasActiveSearchFilters(params);

  const { movies: results, source, totalResults, totalPages } = await searchCatalog(
    params.q,
    params.page,
    params.type,
    {
      genre: params.genre,
      year: params.year,
      sort: params.sort,
      minRating: params.minRating,
    }
  );

  const label = searchMediaLabel(params.type);
  const heading =
    params.type === "tv"
      ? "Search TV Series"
      : params.type === "all"
        ? "Search Titles"
        : params.type === "anime"
          ? "Search Anime"
          : "Search Movies";

  const subtitle = filtersActive
    ? `Refine by year, genre, rating, and sort — results update from TMDB discover`
    : params.type === "tv"
      ? "Find series from TMDB — use filters to narrow by year, genre, and rating"
      : params.type === "anime"
        ? "Japanese animation — filter by year, genre, and minimum rating"
        : "Search movies from TMDB — combine text search with filters below";

  const emptyMessage = params.q
    ? `No ${label} found for "${params.q}" with the current filters. Try adjusting filters or another search.`
    : `No ${label} match your filters. Try a different year, genre, or rating.`;

  return (
    <div className="section-base min-h-full">
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)]">
          <div className="search-hero-core relative flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
            <span aria-hidden className="search-bg-text">
              SEARCH
            </span>
            <p className="relative z-10 mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent-cool)]">
              Discover
            </p>
            <h1 className="relative z-10 font-[var(--font-playfair)] text-[32px] font-bold text-[var(--text-primary)]">
              {heading}
            </h1>
            <div className="relative z-10 mt-6 w-full max-w-3xl">
              <Suspense fallback={null}>
                <SearchBar defaultValue={params.q} large autoFocus />
              </Suspense>
            </div>
            <div className="relative z-10 mt-5">
              <SearchMediaTabs params={params} />
            </div>
          </div>

          <div className="relative z-10 border-t border-[var(--border)] px-6 py-8 text-center">
            <Suspense fallback={null}>
              <SearchFilters params={params} />
            </Suspense>
            <p className="relative z-10 mt-4 text-[13px] text-[var(--text-secondary)]">{subtitle}</p>
          </div>
        </section>
      </div>

      <div className="section-alt border-t border-[var(--border)] px-6 pb-16 pt-10">
        <div className="mx-auto max-w-[1280px]">
          <SearchResults
            movies={results}
            query={params.q}
            page={params.page}
            totalPages={totalPages}
            emptyMessage={emptyMessage}
            source={source}
            totalResults={totalResults}
            mediaFilter={params.type}
            filtersActive={filtersActive}
          />
          <CatalogPagination
            page={params.page}
            totalPages={totalPages}
            basePath="/search"
            query={{
              ...searchFiltersToQueryRecord(params),
              page: undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
}
