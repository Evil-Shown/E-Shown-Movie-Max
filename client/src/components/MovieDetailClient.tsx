"use client";

import type { Movie } from "@/lib/types";
import { formatRuntime, posterUrl } from "@/lib/movies";
import FloatingCard from "@/components/3d/FloatingCard";
import PlayButton from "@/components/PlayButton";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

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
          className={`inline-block text-sm ${i < filled ? "text-[var(--gold-primary)]" : "text-[var(--text-dim)]"}`}
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
    <div ref={ref} className="mt-2 h-1 w-32 overflow-hidden rounded-full bg-[rgba(212,168,67,0.15)]">
      <motion.div
        className="h-full bg-gradient-to-r from-[var(--gold-primary)] to-[var(--gold-bright)]"
        initial={prefersReducedMotion ? { width: `${pct}%` } : { width: 0 }}
        animate={inView ? { width: `${pct}%` } : undefined}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export default function MovieDetailClient({ movie }: MovieDetailClientProps) {
  return (
    <div
      className="relative pb-8"
      style={{
        background: "linear-gradient(to bottom, transparent, var(--bg-base) 15%)",
      }}
    >
      <div className="relative -mt-40 rounded-[2rem] border border-white/10 bg-[rgba(32,38,54,0.38)] p-5 shadow-[0_26px_80px_rgba(0,0,0,0.2)] backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end">
          <div className="mx-auto shrink-0 lg:mx-0 lg:w-1/3">
            <FloatingCard>
              <div className="animate-float">
                <div className="card-surface mx-auto h-[390px] w-[260px] overflow-hidden rounded-2xl shadow-[0_22px_60px_rgba(0,0,0,0.26)]">
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
            <p className="mb-3 text-[10px] uppercase tracking-[0.4em] text-[var(--gold-bright)]">
              Now Viewing
            </p>
            <Link
              href="/browse"
              data-cursor="link"
              className="mb-4 inline-flex items-center gap-1 rounded-full border border-white/10 bg-[rgba(32,38,54,0.42)] px-3 py-1 text-sm text-[var(--text-secondary)] transition hover:border-[var(--border-mid)] hover:text-[var(--gold-primary)] active:scale-95"
            >
              ← Back to browse
            </Link>
            <h1 className="font-cinzel text-cinema-glow text-4xl text-[var(--text-primary)] sm:text-5xl lg:text-7xl">
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
              <AnimatedStarRating rating={movie.rating} />
              <RatingBar rating={movie.rating} />
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
                  data-cursor="link"
                  className="rounded-full border border-[var(--border-mid)] bg-[rgba(32,38,54,0.46)] px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)] transition hover:border-[var(--border-hot)] hover:bg-[rgba(212,168,67,0.12)] hover:text-[var(--gold-primary)] active:scale-95"
                >
                  {genre}
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
              <PlayButton movie={movie} label="Play Film" />
              <button
                type="button"
                data-cursor="link"
                className="inline-flex h-12 items-center rounded-full border border-[var(--border-mid)] bg-[rgba(32,38,54,0.45)] px-10 text-sm font-medium uppercase tracking-wider text-[var(--text-secondary)] transition hover:border-[var(--border-hot)] hover:bg-[rgba(212,168,67,0.08)] hover:text-[var(--text-primary)] active:scale-95"
              >
                + Collection
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="section-alt mt-10 rounded-[2rem] border border-[var(--divider)] p-8 shadow-[0_18px_52px_rgba(0,0,0,0.14)]">
        <h2 className="font-cinzel text-xl text-[var(--text-primary)]">Synopsis</h2>
        <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
          {movie.overview}
        </p>
      </div>

      <section className="section-surface mt-8 rounded-[2rem] border border-[var(--divider)] px-8 py-6 shadow-[0_18px_52px_rgba(0,0,0,0.12)]">
        <h2 className="font-cinzel border-l-4 border-[var(--gold-primary)] pl-4 text-2xl text-[var(--text-primary)]">
          Cast
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {movie.cast.map((member) => (
            <div key={member.name} className="glass-panel flex items-center gap-3 rounded-lg p-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--gold-dim)] to-[var(--bg-elevated)] ring-1 ring-[var(--border-mid)]">
                <span className="cast-initials font-cinzel text-sm font-semibold">
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
    </div>
  );
}
