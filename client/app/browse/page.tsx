import BrowseCatalog from "@/components/BrowseCatalog";
import BrowseSortTabs from "@/components/BrowseSortTabs";
import GenrePills from "@/components/GenrePills";
import TmdbSetupBanner from "@/components/TmdbSetupBanner";
import { allGenres } from "@/lib/movies";
import { browseCatalog, isTmdbConfigured, type BrowseSort } from "@/lib/movie-service";
import type { Genre } from "@/lib/types";

const INITIAL_PAGES = 5;

interface BrowsePageProps {
  searchParams: Promise<{ genre?: string; sort?: string }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const { genre, sort: sortParam } = await searchParams;
  const activeGenre = genre && allGenres.includes(genre as Genre) ? (genre as Genre) : null;
  const sort = (["popular", "top_rated", "now_playing"].includes(sortParam ?? "")
    ? sortParam
    : "popular") as BrowseSort;
  const tmdbReady = isTmdbConfigured();

  const { movies, totalPages, totalResults, source, lastLoadedPage } = await browseCatalog({
    genre: activeGenre,
    page: 1,
    pages: tmdbReady ? INITIAL_PAGES : 1,
    sort,
  });

  return (
    <div>
      <section className="browse-hero-bg px-6 py-16">
        <div className="mx-auto max-w-[1280px] rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent-cool)]">Library</p>
          <h1 className="font-[var(--font-playfair)] text-[32px] font-bold text-[var(--text-primary)]">Browse All</h1>
          <p className="mt-3 text-[15px] leading-[1.7] text-[var(--text-secondary)]">
            {tmdbReady
              ? `${totalResults.toLocaleString()} movies available - scroll or tap load more to keep browsing`
              : `${totalResults} curated titles - connect TMDB for the full catalog`}
          </p>

          <BrowseSortTabs activeSort={sort} genre={activeGenre} />

          <div className="mt-6">
            <GenrePills genres={allGenres} activeGenre={activeGenre} activeSort={sort} scrollable />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-6 py-16">
        {!tmdbReady && <TmdbSetupBanner />}
        <BrowseCatalog
          initialMovies={movies}
          lastLoadedPage={lastLoadedPage}
          totalPages={totalPages}
          totalResults={totalResults}
          genre={activeGenre}
          sort={sort}
          source={source}
        />
      </div>
    </div>
  );
}
