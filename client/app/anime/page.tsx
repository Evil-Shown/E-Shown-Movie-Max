import AnimeMediaTabs from "@/components/AnimeMediaTabs";
import AnimeSortTabs from "@/components/AnimeSortTabs";
import BrowseCatalog from "@/components/BrowseCatalog";
import HomeSection from "@/components/HomeSection";
import MovieRow from "@/components/MovieRow";
import TmdbSetupBanner from "@/components/TmdbSetupBanner";
import {
  browseAnimeCatalog,
  getAnimeCatalog,
  isTmdbConfigured,
  type AnimeMediaType,
  type AnimeSort,
} from "@/lib/movie-service";

export const revalidate = 3600;

const INITIAL_PAGES = 2;

interface AnimePageProps {
  searchParams: Promise<{ type?: string; sort?: string }>;
}

function parseMediaType(value?: string): "overview" | AnimeMediaType {
  if (value === "tv") return "tv";
  if (value === "movie") return "movie";
  return "overview";
}

function parseAnimeSort(value?: string): AnimeSort {
  if (value === "top_rated" || value === "trending") return value;
  return "popular";
}

export default async function AnimePage({ searchParams }: AnimePageProps) {
  const { type: typeParam, sort: sortParam } = await searchParams;
  const view = parseMediaType(typeParam);
  const sort = parseAnimeSort(sortParam);
  const tmdbReady = isTmdbConfigured();

  const isBrowse = view === "movie" || view === "tv";

  const catalog = isBrowse
    ? await browseAnimeCatalog({
        mediaType: view,
        page: 1,
        pages: tmdbReady ? INITIAL_PAGES : 1,
        sort,
      })
    : null;

  const overview = !isBrowse ? await getAnimeCatalog() : null;

  const browseLabel = view === "tv" ? "Anime Series" : "Anime Movies";
  const browseCount = catalog?.totalResults ?? 0;

  return (
    <div>
      <section className="browse-hero-bg px-6 py-16">
        <div className="mx-auto max-w-[1280px] rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent-cool)]">
            Japanese Animation
          </p>
          <h1 className="font-[var(--font-playfair)] text-[32px] font-bold text-[var(--text-primary)]">
            Anime
          </h1>
          <p className="mt-3 text-[15px] leading-[1.7] text-[var(--text-secondary)]">
            {isBrowse
              ? tmdbReady
                ? `${browseCount.toLocaleString()} ${view === "tv" ? "series" : "films"} — scroll or load more`
                : `${browseCount} curated titles — connect TMDB for the full anime catalog`
              : "Trending anime movies and series from Japan — browse by movies, series, or explore rows below"}
          </p>

          <div className="mt-6">
            <AnimeMediaTabs activeView={view} sort={isBrowse ? sort : undefined} />
          </div>

          {isBrowse && <AnimeSortTabs activeSort={sort} mediaType={view} />}
        </div>
      </section>

      {isBrowse && catalog ? (
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          {!tmdbReady && <TmdbSetupBanner />}
          <BrowseCatalog
            initialMovies={catalog.movies}
            lastLoadedPage={catalog.lastLoadedPage}
            totalPages={catalog.totalPages}
            totalResults={catalog.totalResults}
            genre={null}
            sort="popular"
            source={catalog.source}
            mediaType={view}
            loadMorePath="/api/anime/browse"
            loadMoreParams={{ mediaType: view, sort }}
          />
        </div>
      ) : (
        overview && (
          <>
            {!tmdbReady && (
              <div className="mx-auto max-w-[1280px] px-6 pt-10">
                <TmdbSetupBanner />
              </div>
            )}

            {overview.trending.length > 0 && (
              <HomeSection className="section-alt py-12">
                <MovieRow
                  embedded
                  eyebrow="Hot Today"
                  title="Trending Anime"
                  subtitle="What anime fans are watching right now"
                  movies={overview.trending}
                  seeAllHref="/anime?type=tv&sort=trending"
                />
              </HomeSection>
            )}

            {overview.movies.length > 0 && (
              <HomeSection className="section-base py-12">
                <MovieRow
                  embedded
                  eyebrow="Feature Films"
                  title="Anime Movies"
                  subtitle="Japanese animated films from TMDB"
                  movies={overview.movies}
                  seeAllHref="/anime?type=movie"
                />
              </HomeSection>
            )}

            {overview.series.length > 0 && (
              <HomeSection className="section-alt py-12">
                <MovieRow
                  embedded
                  eyebrow="Episodes & Seasons"
                  title="Anime Series"
                  subtitle="Binge-worthy anime TV from Japan"
                  movies={overview.series}
                  seeAllHref="/anime?type=tv"
                />
              </HomeSection>
            )}

            {overview.topRated.length > 0 && (
              <HomeSection className="section-base py-12">
                <MovieRow
                  embedded
                  eyebrow="Critics & Fans"
                  title="Top Rated Anime"
                  subtitle="Highest rated Japanese animation"
                  movies={overview.topRated}
                  seeAllHref="/anime?type=movie&sort=top_rated"
                />
              </HomeSection>
            )}
          </>
        )
      )}
    </div>
  );
}
