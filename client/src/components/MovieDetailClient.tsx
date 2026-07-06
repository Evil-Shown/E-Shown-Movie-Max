"use client";

import type { Movie } from "@/lib/types";
import { formatRuntime, posterUrl } from "@/lib/movies";
import FloatingCard from "@/components/3d/FloatingCard";
import PlayButton from "@/components/PlayButton";
import Link from "next/link";

interface MovieDetailClientProps {
  movie: Movie;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StarRating({ rating }: { rating: number }) {
  const filled = Math.round(rating / 2);
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-sm ${i < filled ? "text-[var(--gold-primary)]" : "text-[var(--text-dim)]"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function MovieDetailClient({ movie }: MovieDetailClientProps) {
  return (
    <>
      <div className="relative -mt-40 pb-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end">
          <div className="mx-auto shrink-0 lg:mx-0 lg:w-1/3">
            <FloatingCard>
              <div className="animate-float">
                <div className="mx-auto h-[390px] w-[260px] overflow-hidden rounded-xl ring-1 ring-[var(--border-mid)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={posterUrl(movie.posterPath, "w500")}
                    alt={movie.title}
                    width={260}
                    height={390}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="poster-reflection relative mx-auto mt-2 h-20 w-[260px] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={posterUrl(movie.posterPath, "w500")}
                    alt=""
                    width={260}
                    height={80}
                    className="h-full w-full object-cover"
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

            <div className="mt-8 flex flex-col items-center gap-2 lg:items-start">
              <div className="flex items-end gap-3">
                <span className="text-2xl text-[var(--gold-primary)]">★</span>
                <span className="font-cinzel text-6xl leading-none text-[var(--gold-primary)]">
                  {movie.rating.toFixed(1)}
                </span>
              </div>
              <StarRating rating={movie.rating} />
              <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--text-dim)]">
                IMDb Rating
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm lg:justify-start">
              <span className="text-[var(--text-secondary)]">{movie.year}</span>
              <span className="text-[var(--text-dim)]">·</span>
              <span className="text-[var(--text-secondary)]">{formatRuntime(movie.runtime)}</span>
            </div>

            <div className="mt-4">
              <p className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-[var(--text-dim)]">
                Directed by
              </p>
              <p className="mt-1 text-lg text-[var(--text-primary)]">{movie.director}</p>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
              {movie.genres.map((genre) => (
                <Link
                  key={genre}
                  href={`/browse?genre=${encodeURIComponent(genre)}`}
                  className="border border-[var(--border-mid)] px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)] transition hover:border-[var(--border-hot)] hover:bg-[rgba(201,168,76,0.12)] hover:text-[var(--gold-primary)]"
                >
                  {genre}
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
              <PlayButton movie={movie} label="Play Film" />
              <button
                type="button"
                className="inline-flex h-12 items-center border border-[var(--border-mid)] px-10 text-sm font-medium uppercase tracking-wider text-[var(--text-secondary)] transition hover:border-[var(--border-hot)] hover:text-[var(--text-primary)]"
              >
                + Collection
              </button>
            </div>

            <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] lg:mx-0">
              {movie.overview}
            </p>
          </div>
        </div>
      </div>

      <section className="border-t border-[var(--border-subtle)] py-12">
        <h2 className="font-cinzel border-l-4 border-[var(--gold-primary)] pl-4 text-2xl text-[var(--text-primary)]">
          Cast
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {movie.cast.map((member) => (
            <div key={member.name} className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--gold-dim)] to-[var(--bg-elevated)] ring-1 ring-[var(--border-mid)]">
                <span className="font-cinzel text-sm text-[var(--gold-primary)]">
                  {initials(member.name)}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{member.name}</p>
                <p className="font-cormorant text-[13px] italic text-[var(--text-secondary)]">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
