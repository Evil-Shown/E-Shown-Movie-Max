"use client";

import type { Movie } from "@/lib/types";
import type { BrowseSort, CatalogSource } from "@/lib/movie-service";
import MovieCard from "@/components/MovieCard";
import { useCallback, useEffect, useRef, useState } from "react";

interface BrowseCatalogProps {
  initialMovies: Movie[];
  lastLoadedPage: number;
  totalPages: number;
  totalResults: number;
  genre: string | null;
  sort: BrowseSort;
  source: CatalogSource;
  mediaType?: "movie" | "tv";
}

function mergeMovies(existing: Movie[], incoming: Movie[]) {
  const seen = new Set(existing.map((m) => m.id));
  const merged = [...existing];
  for (const movie of incoming) {
    if (seen.has(movie.id)) continue;
    seen.add(movie.id);
    merged.push(movie);
  }
  return merged;
}

export default function BrowseCatalog({
  initialMovies,
  lastLoadedPage,
  totalPages,
  totalResults,
  genre,
  sort,
  source,
  mediaType = "movie",
}: BrowseCatalogProps) {
  const [movies, setMovies] = useState(initialMovies);
  const [loadedPage, setLoadedPage] = useState(lastLoadedPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMovies(initialMovies);
    setLoadedPage(lastLoadedPage);
    setError(null);
  }, [initialMovies, lastLoadedPage, genre, sort]);

  const hasMore = loadedPage < totalPages;

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || source !== "tmdb") return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(loadedPage + 1),
        sort,
      });
      if (genre) params.set("genre", genre);
      if (mediaType === "tv") params.set("type", "tv");

      const res = await fetch(`/api/browse?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load more movies");

      const data = await res.json();
      setMovies((prev) => mergeMovies(prev, data.movies));
      setLoadedPage(data.lastLoadedPage);
    } catch {
      setError("Could not load more movies. Try again.");
    } finally {
      setLoading(false);
    }
  }, [genre, hasMore, loadedPage, loading, sort, source, mediaType]);

  useEffect(() => {
    if (!hasMore || source !== "tmdb") return;

    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "400px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore, source]);

  return (
    <div>
      <p className="mb-5 text-xs text-[var(--text-secondary)]">
        Showing {movies.length.toLocaleString()} of {totalResults.toLocaleString()} titles
        {source === "tmdb" && totalPages > 1
          ? ` · loaded through page ${loadedPage} of ${totalPages.toLocaleString()}`
          : ""}
      </p>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-4 xl:grid-cols-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      <div ref={sentinelRef} className="h-4" aria-hidden />

      <div className="mt-10 flex flex-col items-center gap-3">
        {loading && (
          <p className="text-sm text-[var(--text-secondary)]">Loading more movies...</p>
        )}
        {error && <p className="text-sm text-[var(--accent-primary)]">{error}</p>}
        {hasMore && source === "tmdb" && (
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="rounded-md bg-[var(--accent-primary)] px-8 py-3 text-sm font-semibold text-[var(--text-inverse)] hover:bg-[#b85f26] disabled:opacity-60"
          >
            {loading ? "Loading..." : "Load more movies"}
          </button>
        )}
        {!hasMore && source === "tmdb" && movies.length > 0 && (
          <p className="text-sm text-[var(--text-dim)]">You&apos;ve reached the end of the catalog.</p>
        )}
      </div>
    </div>
  );
}
