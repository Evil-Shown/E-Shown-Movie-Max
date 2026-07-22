import BrowseCatalog from "@/components/BrowseCatalog";
import BrowseSortTabs from "@/components/BrowseSortTabs";
import GenrePills from "@/components/GenrePills";
import TmdbSetupBanner from "@/components/TmdbSetupBanner";
import { allGenres } from "@/lib/movies";
import { browseCatalog, browseTvCatalog, isTmdbConfigured, type BrowseSort } from "@/lib/movie-service";
import type { Genre, MediaType } from "@/lib/types";

const INITIAL_PAGES = 2;

export const revalidate = 3600;

interface BrowsePageProps {
  searchParams: Promise<{ genre?: string; sort?: string; type?: string }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const { genre, sort: sortParam, type: typeParam } = await searchParams;
  const mediaType: MediaType = typeParam === "tv" ? "tv" : "movie";
  const isSeries = mediaType === "tv";
  const activeGenre = genre && allGenres.includes(genre as Genre) ? (genre as Genre) : null;
  const sort = (["popular", "top_rated", "now_playing"].includes(sortParam ?? "")
    ? sortParam
    : "popular") as BrowseSort;
  const tmdbReady = isTmdbConfigured();

  const browseFn = isSeries ? browseTvCatalog : browseCatalog;
  const { movies, totalPages, totalResults, source, lastLoadedPage } = await browseFn({
    genre: activeGenre,
    page: 1,
    pages: tmdbReady ? INITIAL_PAGES : 1,
    sort,
  });

  return (
    <div>
      <section className="browse-hero-bg px-4 py-8 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-[1280px] rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-sm)] sm:p-8">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent-cool)]">
            {isSeries ? "TV Library" : "Movie Library"}
          </p>
          <h1 className="font-[var(--font-playfair)] text-[26px] font-bold text-[var(--text-primary)] sm:text-[32px]">
            {isSeries ? "Browse Series" : "Browse Movies"}
          </h1>
          <p className="mt-2 text-[14px] leading-[1.6] text-[var(--text-secondary)] sm:mt-3 sm:text-[15px] sm:leading-[1.7]">
            {tmdbReady
              ? `${totalResults.toLocaleString()} ${isSeries ? "series" : "movies"} available — scroll or tap load more`
              : `${totalResults} curated titles — connect TMDB for the full catalog`}
          </p>

          <BrowseSortTabs activeSort={sort} genre={activeGenre} mediaType={mediaType} />

          <div className="mt-6">
            <GenrePills
              genres={allGenres}
              activeGenre={activeGenre}
              activeSort={sort}
              basePath={isSeries ? "/browse?type=tv" : "/browse"}
              scrollable
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-16">
        {!tmdbReady && <TmdbSetupBanner />}
        <BrowseCatalog
          initialMovies={movies}
          lastLoadedPage={lastLoadedPage}
          totalPages={totalPages}
          totalResults={totalResults}
          genre={activeGenre}
          sort={sort}
          source={source}
          mediaType={mediaType}
        />
      </div>
    </div>
  );
}
