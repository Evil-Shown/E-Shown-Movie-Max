"use client";

import HomeSection from "@/components/HomeSection";
import MovieRowClient from "@/components/movie-row/MovieRowClient";
import { buildTasteProfile } from "@/lib/recommendations/taste-profile";
import type { Movie } from "@/lib/types";
import { useEffect, useState } from "react";

function PickedForYouSkeleton() {
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

export default function PickedForYouRow() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [hasSignals, setHasSignals] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const profile = buildTasteProfile();

    fetch("/api/recommendations/for-you", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    })
      .then((res) => (res.ok ? res.json() : { movies: [], hasSignals: false }))
      .then((data: { movies?: Movie[]; hasSignals?: boolean }) => {
        if (cancelled) return;
        setMovies(data.movies ?? []);
        setHasSignals(Boolean(data.hasSignals ?? profile.hasSignals));
      })
      .catch(() => {
        if (!cancelled) setMovies([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <PickedForYouSkeleton />;
  if (!movies.length) return null;

  return (
    <HomeSection className="section-surface py-6 sm:py-12">
      <MovieRowClient
        embedded
        eyebrow="Personalized"
        title={hasSignals ? "Picked for You" : "Popular Picks"}
        subtitle={
          hasSignals
            ? "Based on your watchlist, searches, and browsing"
            : "Keep watching and exploring — we'll learn your taste"
        }
        movies={movies}
        priorityFirst
        seeAllHref="/browse"
      />
    </HomeSection>
  );
}
