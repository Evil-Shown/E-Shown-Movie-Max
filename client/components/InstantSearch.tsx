"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import PosterImage from "@/components/PosterImage";
import type { Movie } from "@/lib/types";

interface InstantSearchProps {
  className?: string;
}

type SearchResult = Movie;

export default function InstantSearch({ className = "" }: InstantSearchProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search/instant?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { results: SearchResult[] };
      setResults(data.results);
      setActiveIndex(-1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(query.trim()), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchResults]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function navigateTo(movie: SearchResult) {
    setOpen(false);
    setQuery("");
    router.push(`/movie/${movie.id}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      navigateTo(results[activeIndex]);
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        type="search"
        aria-label="Search movies and series"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search movies & series..."
        className="h-9 w-full rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)]/80 px-4 pr-9 text-sm text-[var(--text-primary)] outline-none backdrop-blur focus:border-[var(--accent-primary)] sm:w-56 lg:w-64"
      />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>

      {open && query.trim().length >= 2 && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[120] w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--bg-card)] shadow-[var(--shadow-md)]">
          {loading ? (
            <div className="p-4 text-sm text-[var(--text-secondary)]">Searching...</div>
          ) : results.length ? (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((movie, i) => (
                <li key={movie.id}>
                  <button
                    type="button"
                    onClick={() => navigateTo(movie)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${
                      i === activeIndex ? "bg-[var(--bg-secondary)]" : "hover:bg-[var(--bg-secondary)]"
                    }`}
                  >
                    <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded">
                      <PosterImage posterPath={movie.posterPath} title={movie.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--text-primary)]">{movie.title}</p>
                      <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                        {movie.mediaType === "tv" ? "Series" : "Movie"} · {movie.year || "—"}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-sm text-[var(--text-secondary)]">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
