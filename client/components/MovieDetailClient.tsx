"use client";

import type { Movie } from "@/lib/types";
import { formatRuntime, posterUrl } from "@/lib/movies";
import { isTvShow } from "@/lib/streaming";
import FloatingCard from "@/components/3d/FloatingCard";
import PlayButton from "@/components/PlayButton";
import ProviderSwitcher from "@/components/ProviderSwitcher";
import TrailerButton from "@/components/TrailerButton";
import TvSeasonPicker from "@/components/TvSeasonPicker";
import WatchlistButton from "@/components/WatchlistButton";
import RatingRing from "@/components/RatingRing";
import { recordTitleView } from "@/lib/storage/taste-signals";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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

function AnimatedStarRating({ rating }: { rating: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const prefersReducedMotion = useReducedMotion();
  const filled = Math.round(rating / 2);

  return (
    <div ref={ref} className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.span
          key={i}
          initial={prefersReducedMotion ? false : { opacity: 0, scaleX: 0 }}
          animate={inView ? { opacity: 1, scaleX: 1 } : undefined}
          transition={{ delay: i * 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{ originX: 0 }}
          className={`inline-block text-sm ${i < filled ? "text-[var(--accent-warm)]" : "text-[var(--text-muted)]"}`}
        >
          ★
        </motion.span>
      ))}
    </div>
  );
}

function RatingBar({ rating }: { rating: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const prefersReducedMotion = useReducedMotion();
  const pct = (rating / 10) * 100;

  return (
    <div ref={ref} className="mt-2 h-1 w-32 overflow-hidden rounded-full bg-[rgba(232,164,74,0.15)]">
      <motion.div
        className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-warm)]"
        initial={prefersReducedMotion ? { width: `${pct}%` } : { width: 0 }}
        animate={inView ? { width: `${pct}%` } : undefined}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export default function MovieDetailClient({ movie }: MovieDetailClientProps) {
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const showTv = isTvShow(movie);

  useEffect(() => {
    recordTitleView({
      id: movie.id,
      title: movie.title,
      genres: movie.genres,
      mediaType: movie.mediaType,
    });
  }, [movie.id, movie.title, movie.genres, movie.mediaType]);

  return (
    <div
      className="relative pb-8"
      style={{
        background: "linear-gradient(to bottom, transparent, var(--bg-base) 15%)",
      }}
    >
      <div className="relative -mt-40 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-sm)] sm:p-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end">
          <div className="mx-auto shrink-0 lg:mx-0 lg:w-1/3">
            <FloatingCard>
              <div className="animate-float">
                <div className="mx-auto h-[390px] w-[260px] overflow-hidden rounded-xl bg-[var(--bg-secondary)] shadow-[0_24px_64px_rgba(28,25,23,0.2)]">
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
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent-primary)]">
              Now Viewing
            </p>
            <Link
              href="/browse"
              data-cursor="link"
              className="mb-4 inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1 text-sm text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--accent-primary)] active:scale-95"
            >
              ← Back to browse
            </Link>
            <h1 className="font-[var(--font-playfair)] text-4xl font-bold text-[var(--text-primary)] sm:text-5xl lg:text-7xl">
              {movie.title}
            </h1>
            {movie.mediaType === "tv" && (
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent-cool)]">
                TV Series
              </p>
            )}
            <p className="mt-3 font-[var(--font-playfair)] text-xl italic text-[var(--text-secondary)]">
              {movie.tagline}
            </p>

            <div className="mt-8 flex flex-col items-center gap-2 lg:items-start">
              <RatingRing rating={movie.rating} size={72} />
              <AnimatedStarRating rating={movie.rating} />
              <RatingBar rating={movie.rating} />
              <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--text-dim)]">
                TMDB Score
              </p>
            </div>

            {movie.externalRatings ? (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                {typeof movie.externalRatings.imdb === "number" ? (
                  <div className="rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2 text-xs text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--text-primary)]">IMDb</span> {movie.externalRatings.imdb.toFixed(1)}
                  </div>
                ) : null}
                {typeof movie.externalRatings.rottenTomatoes === "number" ? (
                  <div className="rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2 text-xs text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--text-primary)]">Rotten Tomatoes</span> {movie.externalRatings.rottenTomatoes}%
                  </div>
                ) : null}
                {typeof movie.externalRatings.metascore === "number" ? (
                  <div className="rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2 text-xs text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--text-primary)]">Metascore</span> {movie.externalRatings.metascore}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm lg:justify-start">
              <span className="text-[var(--text-secondary)]">{movie.year}</span>
              <span className="text-[var(--text-dim)]">·</span>
              <span className="text-[var(--text-secondary)]">{formatRuntime(movie.runtime)}</span>
            </div>

            <div className="mt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent-cool)]">
                Directed by
              </p>
              <p className="mt-1 text-lg text-[var(--text-primary)]">{movie.director}</p>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
              {movie.genres.map((genre) => (
                <Link
                  key={genre}
                  href={`/browse?genre=${encodeURIComponent(genre)}`}
                  data-cursor="link"
                  className="rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--accent-primary)] active:scale-95"
                >
                  {genre}
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
              <PlayButton movie={movie} label={showTv ? "Play S1 E1" : "Play Film"} />
              <TrailerButton movie={movie} label="Watch Trailer" />
              <WatchlistButton movie={movie} className="!h-12 !w-12" />
            </div>

            <div className="mt-6 max-w-xs">
              <ProviderSwitcher />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-[var(--shadow-sm)]">
        <h2 className="font-[var(--font-playfair)] text-xl text-[var(--text-primary)]">Synopsis</h2>
        <p className={`mt-4 text-base leading-relaxed text-[var(--text-secondary)] ${overviewExpanded ? "" : "line-clamp-4"}`}>
          {movie.overview}
        </p>
        {movie.overview.length > 220 && (
          <button
            type="button"
            onClick={() => setOverviewExpanded((v) => !v)}
            className="mt-2 text-sm font-medium text-[var(--accent-primary)] hover:underline"
          >
            {overviewExpanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      {showTv && <TvSeasonPicker movie={movie} />}

      <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-8 py-6 shadow-[var(--shadow-sm)]">
        <h2 className="border-l-2 border-[var(--accent-primary)] pl-4 font-[var(--font-playfair)] text-2xl text-[var(--text-primary)]">
          Cast
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {movie.cast.map((member) => (
            <div key={member.name} className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--bg-card)] ring-1 ring-[var(--border-strong)]">
                <span className="cast-initials font-[var(--font-playfair)] text-sm font-semibold">
                  {initials(member.name)}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{member.name}</p>
                <p className="text-[13px] italic text-[var(--text-secondary)]">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
