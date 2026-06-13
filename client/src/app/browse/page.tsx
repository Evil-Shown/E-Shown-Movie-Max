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
      <section className="noise-texture relative overflow-hidden bg-[var(--bg-surface)] px-4 py-16 sm:px-6 lg:px-8">
        <GlowOrb color="rgba(201,168,76,0.15)" size={240} x="85%" y="35%" blur={80} opacity={0.5} />
        <GlowOrb color="rgba(26,143,255,0.12)" size={200} x="8%" y="65%" blur={70} opacity={0.4} />

        <div className="relative mx-auto max-w-7xl">
          <h1
            className="font-cinzel text-5xl text-transparent sm:text-6xl"
            style={{
              background: "linear-gradient(135deg, var(--gold-primary), var(--gold-bright))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
            }}
          >
            The Library
          </h1>
          <div className="mt-4 h-px w-[120px] bg-[var(--gold-primary)]" />
          <p className="font-cormorant mt-4 text-lg italic text-[var(--text-secondary)]">
            {sorted.length} title{sorted.length !== 1 ? "s" : ""}
            {activeGenre ? ` in ${activeGenre}` : " across all genres"}
          </p>

          <div className="mt-8">
            <GenrePills genres={allGenres} activeGenre={activeGenre} scrollable />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <MovieGrid
          movies={sorted}
          countLabel={`Showing ${sorted.length} titles`}
          emptyMessage={activeGenre ? `No movies in ${activeGenre} yet.` : "No movies found."}
        />
      </div>
    </div>
  );
}
