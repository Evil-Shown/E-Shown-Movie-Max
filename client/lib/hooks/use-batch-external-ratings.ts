"use client";

import type { Movie } from "@/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";

const BATCH_SIZE = 24;

function chunkMovies<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

export function useBatchExternalRatings<T extends HTMLElement = HTMLDivElement>(movies: Movie[]) {
  const containerRef = useRef<T | null>(null);
  const [ratings, setRatings] = useState<Record<string, NonNullable<Movie["externalRatings"]>>>({});
  const fetchedIdsRef = useRef(new Set<string>());
  const inFlightRef = useRef(false);
  const visibleRef = useRef(false);

  const getPendingMovies = useCallback(() => {
    return movies.filter(
      (movie) => !movie.externalRatings && !fetchedIdsRef.current.has(movie.id) && !ratings[movie.id]
    );
  }, [movies, ratings]);

  const fetchPending = useCallback(async () => {
    const pending = getPendingMovies();
    if (pending.length === 0 || inFlightRef.current) return;

    inFlightRef.current = true;

    for (const chunk of chunkMovies(pending, BATCH_SIZE)) {
      for (const movie of chunk) {
        fetchedIdsRef.current.add(movie.id);
      }

      try {
        const res = await fetch("/api/external-ratings/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: chunk.map((movie) => ({
              id: movie.id,
              title: movie.title,
              year: movie.year > 0 ? movie.year : undefined,
              imdbId: movie.imdbId,
            })),
          }),
        });

        if (!res.ok) continue;

        const data = (await res.json()) as { ratings?: Record<string, Movie["externalRatings"]> };
        if (!data.ratings) continue;

        setRatings((prev) => {
          const next = { ...prev };
          let changed = false;
          for (const [id, value] of Object.entries(data.ratings ?? {})) {
            if (!value || next[id]) continue;
            next[id] = value;
            changed = true;
          }
          return changed ? next : prev;
        });
      } catch {
        // Ignore batch failures; cards still render without external ratings.
      }
    }

    inFlightRef.current = false;
  }, [getPendingMovies]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const tryFetch = () => {
      if (!visibleRef.current) return;
      void fetchPending();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        visibleRef.current = entries[0]?.isIntersecting ?? false;
        tryFetch();
      },
      { rootMargin: "250px" }
    );

    observer.observe(node);
    tryFetch();

    return () => observer.disconnect();
  }, [fetchPending, movies]);

  const getRating = useCallback((movie: Movie) => movie.externalRatings ?? ratings[movie.id], [ratings]);

  return { containerRef, ratings, getRating };
}
