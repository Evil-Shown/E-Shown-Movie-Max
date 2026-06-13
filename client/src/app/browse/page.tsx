import GenrePills from "@/components/GenrePills";
import MovieGrid from "@/components/MovieGrid";
import GlowOrb from "@/components/3d/GlowOrb";
import { allGenres, getMoviesByGenre, movies } from "@/lib/movies";
import type { Genre } from "@/lib/types";

interface BrowsePageProps {
  searchParams: Promise<{ genre?: string }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const { genre } = await searchParams;
  const activeGenre = genre && allGenres.includes(genre as Genre) ? genre : null;
  const filtered = activeGenre ? getMoviesByGenre(activeGenre as Genre) : movies;
  const sorted = [...filtered].sort((a, b) => b.rating - a.rating);

  return (
    <div>
      <section className="browse-hero-bg surface-texture relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
        <GlowOrb color="rgba(212,168,67,0.2)" size={200} x="85%" y="35%" blur={70} opacity={0.28} />
        <GlowOrb color="rgba(74,144,217,0.15)" size={180} x="8%" y="65%" blur={60} opacity={0.2} />

        <div className="relative mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-[rgba(32,38,54,0.34)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.16)] backdrop-blur-sm sm:p-8">
          <h1 className="font-cinzel text-cinema-glow text-5xl text-[var(--gold-primary)] sm:text-6xl">
            The Library
          </h1>
          <div className="mt-4 h-px w-[160px] bg-gradient-to-r from-[var(--gold-primary)] to-transparent" />
          <p className="font-cormorant mt-4 text-lg italic text-[var(--text-secondary)]">
            {sorted.length} title{sorted.length !== 1 ? "s" : ""}
            {activeGenre ? ` in ${activeGenre}` : " across all genres"}
          </p>

          <div className="mt-8">
            <GenrePills genres={allGenres} activeGenre={activeGenre} scrollable />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <MovieGrid
          movies={sorted}
          countLabel={`Showing ${sorted.length} titles`}
          emptyMessage={activeGenre ? `No movies in ${activeGenre} yet.` : "No movies found."}
        />
      </div>
    </div>
  );
}
