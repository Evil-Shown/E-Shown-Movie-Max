import MovieDetailHero from "@/components/MovieDetailHero";
import MovieRow from "@/components/MovieRow";
import FloatingCard from "@/components/3d/FloatingCard";
import {
  backdropUrl,
  formatRuntime,
  getMovieById,
  getSimilarMovies,
  posterUrl,
} from "@/lib/movies";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const { movies } = await import("@/lib/movies");
  return movies.map((movie) => ({ id: movie.id }));
}

export async function generateMetadata({ params }: MoviePageProps) {
  const { id } = await params;
  const movie = getMovieById(id);
  if (!movie) return { title: "Movie Not Found" };
  return {
    title: `${movie.title} | E-Shown Movie Max`,
    description: movie.overview,
  };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const movie = getMovieById(id);
  if (!movie) notFound();

  const similar = getSimilarMovies(movie);

  return (
    <>
      <MovieDetailHero backdropSrc={backdropUrl(movie.backdropPath)} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-40 pb-8">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end">
            <div className="mx-auto shrink-0 lg:mx-0 lg:w-1/3">
              <FloatingCard>
                <div className="animate-float">
                  <div className="relative mx-auto aspect-[2/3] w-[220px] overflow-hidden rounded-xl ring-1 ring-[var(--border-mid)] sm:w-[260px]">
                    <Image
                      src={posterUrl(movie.posterPath, "w500")}
                      alt={movie.title}
                      fill
                      sizes="260px"
                      priority
                      className="object-cover"
                    />
                  </div>
                  <div className="poster-reflection relative mx-auto mt-2 h-20 w-[220px] overflow-hidden sm:w-[260px]">
                    <Image
                      src={posterUrl(movie.posterPath, "w500")}
                      alt=""
                      fill
                      sizes="260px"
                      className="object-cover"
                    />
                  </div>
                </div>
              </FloatingCard>
            </div>

            <div className="flex-1 text-center lg:text-left">
              <p className="mb-3 text-[10px] uppercase tracking-[0.4em] text-[var(--gold-primary)]">
                Now Viewing
              </p>
              <Link
                href="/browse"
                className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] transition hover:text-[var(--gold-primary)]"
              >
                ← Back to browse
              </Link>
              <h1 className="font-cinzel text-4xl text-[var(--text-primary)] sm:text-5xl lg:text-7xl">
                {movie.title}
              </h1>
              <p className="font-cormorant mt-3 text-xl italic text-[var(--gold-bright)]">
                {movie.tagline}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <span className="font-cinzel text-2xl text-[var(--gold-primary)]">
                  ★ {movie.rating.toFixed(1)}
                </span>
                <span className="text-[var(--text-secondary)]">{movie.year}</span>
                <span className="text-[var(--text-dim)]">·</span>
                <span className="text-[var(--text-secondary)]">{formatRuntime(movie.runtime)}</span>
              </div>

              <div className="mt-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-dim)]">
                  Directed by
                </p>
                <p className="mt-1 text-lg text-[var(--text-primary)]">{movie.director}</p>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
                {movie.genres.map((genre) => (
                  <Link
                    key={genre}
                    href={`/browse?genre=${encodeURIComponent(genre)}`}
                    className="border border-[var(--border-mid)] px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)] transition hover:border-[var(--border-hot)] hover:text-[var(--gold-primary)]"
                  >
                    {genre}
                  </Link>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
                <button
                  type="button"
                  className="font-cinzel inline-flex items-center gap-3 bg-[var(--gold-primary)] px-10 py-4 text-sm font-bold uppercase tracking-wider text-black transition hover:bg-[var(--gold-bright)]"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Play Film
                </button>
                <button
                  type="button"
                  className="inline-flex items-center border border-[var(--border-mid)] px-10 py-4 text-sm font-medium uppercase tracking-wider text-[var(--text-secondary)] transition hover:border-[var(--border-hot)] hover:text-[var(--text-primary)]"
                >
                  + Collection
                </button>
              </div>

              <p className="mt-8 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] lg:mx-0 mx-auto">
                {movie.overview}
              </p>
            </div>
          </div>
        </div>

        <section className="border-t border-[var(--border-subtle)] py-12">
          <h2 className="font-cinzel border-l-4 border-[var(--gold-primary)] pl-4 text-2xl text-[var(--text-primary)]">
            Cast
          </h2>
          <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
            {movie.cast.map((member) => (
              <div
                key={member.name}
                className="min-w-[180px] shrink-0 border border-[var(--border-mid)] bg-[var(--bg-surface)] p-4"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--gold-primary)] text-sm font-bold text-black">
                  {initials(member.name)}
                </div>
                <p className="text-center text-sm font-bold text-[var(--text-primary)]">{member.name}</p>
                <p className="font-cormorant text-center text-sm italic text-[var(--text-secondary)]">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {similar.length > 0 && (
        <div className="border-t border-[var(--border-subtle)]">
          <MovieRow title="You May Also Like" movies={similar} />
        </div>
      )}
    </>
  );
}
