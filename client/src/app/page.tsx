import HeroBanner from "@/components/HeroBanner";
import MovieRow from "@/components/MovieRow";
import GlowOrb from "@/components/3d/GlowOrb";
import {
  backdropUrl,
  getFeaturedMovie,
  getMoviesByGenre,
  getNewReleases,
  getTrendingMovies,
  movies,
} from "@/lib/movies";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const featured = getFeaturedMovie();
  const trending = getTrendingMovies();
  const newReleases = getNewReleases();
  const topRated = [...movies].sort((a, b) => b.rating - a.rating).slice(0, 8);
  const sciFi = getMoviesByGenre("Sci-Fi");
  const drama = getMoviesByGenre("Drama");
  const ctaBackdrop = backdropUrl(movies[2]?.backdropPath ?? featured.backdropPath);

  return (
    <>
      <HeroBanner movie={featured} />

      <div className="relative bg-[var(--bg-void)] pb-12">
        <MovieRow
          title="Trending"
          subtitle="What everyone is watching this week"
          movies={trending}
          priorityFirst
          showRank
        />
        <MovieRow
          title="New Releases"
          subtitle="Fresh arrivals on E-Shown Movie Max"
          movies={newReleases}
        />
        <MovieRow title="Top Rated" subtitle="Critically acclaimed favorites" movies={topRated} />
        <MovieRow title="Sci-Fi & Beyond" movies={sciFi} />
        <MovieRow title="Drama Collection" movies={drama} />

        <section className="relative mx-auto mt-8 h-[400px] max-w-7xl overflow-hidden px-4 sm:px-6 lg:px-8">
          <GlowOrb color="rgba(201,168,76,0.2)" size={280} x="15%" y="50%" blur={90} opacity={0.5} />
          <GlowOrb
            color="rgba(26,143,255,0.2)"
            size={320}
            x="85%"
            y="40%"
            blur={100}
            opacity={0.45}
            animationDelay="1.5s"
          />

          <div className="relative h-full overflow-hidden border border-[var(--border-subtle)]">
            <Image src={ctaBackdrop} alt="" fill className="object-cover blur-sm brightness-50" sizes="1280px" />
            <div className="absolute inset-0 bg-[var(--bg-void)]/75" />

            <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
              <p className="font-cinzel text-[10px] uppercase tracking-[0.4em] text-[var(--gold-primary)]">
                Unlimited Cinema
              </p>
              <h2 className="font-cinzel mt-4 text-4xl text-[var(--text-primary)] sm:text-5xl">
                Every Story. Every World.
              </h2>
              <p className="font-cormorant mt-4 max-w-lg text-lg italic text-[var(--text-secondary)]">
                From blockbusters to hidden gems — curated for the discerning viewer.
              </p>
              <span className="mt-6 border border-[var(--border-mid)] px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-[var(--gold-primary)]">
                {movies.length} curated films
              </span>
              <Link
                href="/browse"
                className="font-cinzel mt-8 bg-[var(--gold-primary)] px-10 py-4 text-sm font-bold uppercase tracking-[0.2em] text-black transition hover:bg-[var(--gold-bright)]"
              >
                Browse Library
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
