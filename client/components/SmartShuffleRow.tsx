"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import HomeSection from "@/components/HomeSection";
import MovieCardClient from "@/components/movie-card/MovieCardClient";
import MovieRowScroller from "@/components/movie-row/MovieRowScroller";
import { buildTasteProfile } from "@/lib/recommendations/taste-profile";
import type { Movie } from "@/lib/types";
import { getShuffleLimit, recordShuffle } from "@/lib/shuffle-rate-limit";
import type { ShuffleLimitInfo } from "@/lib/shuffle-rate-limit";
import styles from "./MovieRow.module.css";

function ShuffleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 animate-spin">
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  );
}

function SmartShuffleSkeleton() {
  return (
    <HomeSection className="section-surface py-6 sm:py-12">
      <div className="mx-auto max-w-7xl animate-pulse px-4 sm:px-6 lg:px-8">
        <div className="mb-5 h-3 w-24 rounded bg-[var(--bg-secondary)]" />
        <div className="mb-2 h-8 w-48 rounded bg-[var(--bg-secondary)]" />
        <div className="mb-6 h-4 w-72 rounded bg-[var(--bg-secondary)]" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 w-36 shrink-0 rounded-xl bg-[var(--bg-secondary)]" />
          ))}
        </div>
      </div>
    </HomeSection>
  );
}

export default function SmartShuffleRow() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [hasSignals, setHasSignals] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shuffling, setShuffling] = useState(false);
  const [limitInfo, setLimitInfo] = useState<ShuffleLimitInfo>(getShuffleLimit);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const cancelledRef = useRef(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (limitInfo.cooldownMs > 0) {
      cooldownTimerRef.current = setInterval(() => {
        setLimitInfo(getShuffleLimit());
      }, 1000);
      return () => {
        if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
      };
    }
  }, [limitInfo.cooldownMs]);

  const fetchShuffle = useCallback(async (extraExclude: string[] = []) => {
    const profile = buildTasteProfile();

    const res = await fetch("/api/recommendations/smart-shuffle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...profile,
        extraExcludeIds: extraExclude,
      }),
    });

    if (!res.ok) return { movies: [], hasSignals: false };
    return res.json() as Promise<{ movies?: Movie[]; hasSignals?: boolean }>;
  }, []);

  useEffect(() => {
    cancelledRef.current = false;

    fetchShuffle()
      .then((data) => {
        if (cancelledRef.current) return;
        const fetched = data.movies ?? [];
        setMovies(fetched);
        setHasSignals(Boolean(data.hasSignals));
        fetched.forEach((m) => seenIdsRef.current.add(m.id));
      })
      .catch(() => {
        if (!cancelledRef.current) setMovies([]);
      })
      .finally(() => {
        if (!cancelledRef.current) setLoading(false);
      });

    return () => {
      cancelledRef.current = true;
    };
  }, [fetchShuffle]);

  const handleShuffle = useCallback(async () => {
    const info = getShuffleLimit();
    if (!info.canShuffle) {
      setLimitInfo(info);
      return;
    }

    setShuffling(true);
    const extraExclude = [...seenIdsRef.current];

    try {
      const data = await fetchShuffle(extraExclude);
      if (cancelledRef.current) return;
      const fetched = data.movies ?? [];
      if (fetched.length > 0) {
        setMovies(fetched);
        setHasSignals(Boolean(data.hasSignals));
        fetched.forEach((m) => seenIdsRef.current.add(m.id));
        if (seenIdsRef.current.size > 100) {
          const ids = [...seenIdsRef.current];
          seenIdsRef.current = new Set(ids.slice(ids.length - 50));
        }
        const newLimit = recordShuffle();
        setLimitInfo(newLimit);
      }
    } catch {
      if (!cancelledRef.current) setMovies([]);
    } finally {
      if (!cancelledRef.current) setShuffling(false);
    }
  }, [fetchShuffle]);

  if (loading) return <SmartShuffleSkeleton />;
  if (!movies.length) return null;

  const buttonDisabled = shuffling || !limitInfo.canShuffle;
  const buttonLabel = shuffling
    ? "Shuffling..."
    : limitInfo.canShuffle
      ? limitInfo.statusMessage
      : limitInfo.statusMessage;

  const subtitleText = hasSignals
    ? "Based on your taste — shuffle for fresh picks"
    : "Discover something new — shuffle to explore";

  return (
    <HomeSection className="section-surface py-6 sm:py-12">
      <section className={`${styles.row} group/row`}>
        <div className={styles.header}>
          <div className={styles.headerInner}>
            <div>
              <p className={styles.eyebrow}>Smart Shuffle</p>
              <h2 className={styles.title}>Surprise Me</h2>
              <p className={styles.subtitle}>{subtitleText}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleShuffle}
                disabled={buttonDisabled}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 disabled:cursor-not-allowed"
                style={{
                  color: buttonDisabled ? "var(--text-muted)" : "var(--accent-primary)",
                  background: buttonDisabled
                    ? "color-mix(in srgb, var(--text-muted) 8%, transparent)"
                    : "color-mix(in srgb, var(--accent-primary) 12%, transparent)",
                  opacity: buttonDisabled ? 0.5 : 1,
                }}
              >
                {shuffling ? <SpinnerIcon /> : <ShuffleIcon />}
                {buttonLabel}
              </button>
              <a href="/browse" className={styles.seeAll}>
                See all →
              </a>
            </div>
          </div>
        </div>

        <MovieRowScroller>
          {movies.map((movie, index) => (
            <div key={`smart-shuffle-${movie.id}`} className={styles.cardSlot}>
              <MovieCardClient movie={movie} priority={index < 4} />
            </div>
          ))}
        </MovieRowScroller>
      </section>
    </HomeSection>
  );
}
