import type { Movie } from "@/lib/types";
import { backdropUrl, formatRuntime } from "@/lib/movies";
import Image from "next/image";
import Link from "next/link";

interface HeroBannerProps {
  movie: Movie;
}

export default function HeroBanner({ movie }: HeroBannerProps) {
  return (
    <section className="relative min-h-[85vh] overflow-hidden">
      <Image
        src={backdropUrl(movie.backdropPath)}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-top"
      />
      <div className="hero-overlay absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(245,158,11,0.12),_transparent_50%)]" />

      <div className="relative mx-auto flex min-h-[85vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <div className="max-w-2xl animate-fade-up">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Now Featured
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            {movie.title}
          </h1>
          <p className="mt-3 font-display text-lg italic text-amber-200/80 sm:text-xl">
            &ldquo;{movie.tagline}&rdquo;
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-zinc-300">
            <span className="flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 font-semibold text-amber-400">
              ★ {movie.rating.toFixed(1)}
            </span>
            <span>{movie.year}</span>
            <span className="text-zinc-600">·</span>
            <span>{formatRuntime(movie.runtime)}</span>
            <span className="text-zinc-600">·</span>
            <span>{movie.genres.join(", ")}</span>
          </div>
          <p className="mt-5 line-clamp-3 max-w-xl text-base leading-relaxed text-zinc-400">
            {movie.overview}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={`/movie/${movie.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-7 py-3.5 text-sm font-bold text-black shadow-xl shadow-amber-500/30 transition hover:from-amber-400 hover:to-amber-500"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch Now
            </Link>
            <Link
              href={`/movie/${movie.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              More Info
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
