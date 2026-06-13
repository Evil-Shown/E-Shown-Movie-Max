import HeroBanner from "@/components/HeroBanner";
import MovieRow from "@/components/MovieRow";
import {
  getFeaturedMovie,
  getMoviesByGenre,
  getNewReleases,
  getTrendingMovies,
  movies,
} from "@/lib/movies";
import Link from "next/link";

export default function HomePage() {
  const featured = getFeaturedMovie();
  const trending = getTrendingMovies();
  const newReleases = getNewReleases();
  const topRated = [...movies].sort((a, b) => b.rating - a.rating).slice(0, 8);
  const sciFi = getMoviesByGenre("Sci-Fi");
  const drama = getMoviesByGenre("Drama");

  return (
    <>
      <HeroBanner movie={featured} />

      <div className="relative -mt-8 space-y-2 pb-12">
        <MovieRow
          title="Trending Now"
          subtitle="What everyone is watching this week"
          movies={trending}
          priorityFirst
        />
        <MovieRow
          title="New Releases"
          subtitle="Fresh arrivals on E-Shown Movie Max"
          movies={newReleases}
        />
        <MovieRow title="Top Rated" subtitle="Critically acclaimed favorites" movies={topRated} />
        <MovieRow title="Sci-Fi & Beyond" movies={sciFi} />
        <MovieRow title="Drama Collection" movies={drama} />

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10 p-8 sm:p-12">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="relative max-w-lg">
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Unlimited cinema, one subscription
              </h2>
              <p className="mt-4 text-zinc-400">
                Explore our full library of {movies.length}+ hand-picked titles spanning every
                genre. From blockbusters to hidden gems.
              </p>
              <Link
                href="/browse"
                className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
              >
                Browse Full Library
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
