import MovieRow from "@/components/MovieRow";
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

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const movie = getMovieById(id);
  if (!movie) notFound();

  const similar = getSimilarMovies(movie);

  return (
    <>
      <section className="relative min-h-[50vh] overflow-hidden">
        <Image
          src={backdropUrl(movie.backdropPath)}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
      </section>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-32 flex flex-col gap-8 pb-12 md:flex-row md:items-end md:gap-10">
          <div className="relative mx-auto w-[200px] shrink-0 sm:w-[240px] md:mx-0">
            <div className="relative aspect-[2/3] overflow-hidden rounded-2xl shadow-2xl shadow-black/50 ring-1 ring-white/20">
              <Image
                src={posterUrl(movie.posterPath, "w500")}
                alt={movie.title}
                fill
                sizes="240px"
                priority
                className="object-cover"
              />
            </div>
          </div>

          <div className="flex-1 pb-4 text-center md:text-left">
            <Link
              href="/browse"
              className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 transition hover:text-amber-400"
            >
              ← Back to browse
            </Link>
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {movie.title}
            </h1>
            <p className="mt-2 font-display text-lg italic text-amber-200/70">
              {movie.tagline}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-300 md:justify-start">
              <span className="rounded-md bg-amber-500/20 px-2.5 py-1 font-bold text-amber-400">
                ★ {movie.rating.toFixed(1)}
              </span>
              <span>{movie.year}</span>
              <span className="text-zinc-600">·</span>
              <span>{formatRuntime(movie.runtime)}</span>
              <span className="text-zinc-600">·</span>
              <span>Directed by {movie.director}</span>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
              {movie.genres.map((genre) => (
                <Link
                  key={genre}
                  href={`/browse?genre=${encodeURIComponent(genre)}`}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400 transition hover:border-amber-500/40 hover:text-amber-400"
                >
                  {genre}
                </Link>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-3.5 text-sm font-bold text-black shadow-lg shadow-amber-500/30 transition hover:from-amber-400 hover:to-amber-500"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play Movie
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                + My List
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-10 border-t border-white/5 py-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-display text-xl font-semibold text-white">Synopsis</h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-400">{movie.overview}</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-white">Cast</h2>
            <ul className="mt-4 space-y-3">
              {movie.cast.map((member) => (
                <li
                  key={member.name}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
                >
                  <span className="font-medium text-white">{member.name}</span>
                  <span className="text-sm text-zinc-500">{member.role}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="border-t border-white/5">
          <MovieRow title="More Like This" movies={similar} />
        </div>
      )}
    </>
  );
}
