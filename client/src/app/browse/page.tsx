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
      <section className="noise-texture relative h-[200px] overflow-hidden bg-[var(--bg-surface)]">
        <GlowOrb color="rgba(201,168,76,0.15)" size={200} x="80%" y="30%" blur={70} opacity={0.5} />
        <GlowOrb color="rgba(26,143,255,0.12)" size={180} x="10%" y="70%" blur={60} opacity={0.4} />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
          <h1 className="font-cinzel text-4xl tracking-[0.1em] text-[var(--text-primary)] sm:text-5xl">
            The Library
          </h1>
          <p className="font-cormorant mt-2 text-lg italic text-[var(--text-secondary)]">
            {sorted.length} title{sorted.length !== 1 ? "s" : ""}
            {activeGenre ? ` in ${activeGenre}` : " across all genres"}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <GenrePills genres={allGenres} activeGenre={activeGenre} />
        </div>

        <MovieGrid
          movies={sorted}
          countLabel={`${sorted.length} titles`}
          emptyMessage={activeGenre ? `No movies in ${activeGenre} yet.` : "No movies found."}
        />
      </div>
    </div>
  );
}
