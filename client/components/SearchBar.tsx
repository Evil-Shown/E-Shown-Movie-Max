"use client";

import { buildSearchPath, parseSearchPageParams } from "@/lib/search-params";
import { recordSearchQuery } from "@/lib/storage/taste-signals";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const PLACEHOLDERS = [
  "Search by title...",
  "Find your director...",
  "Discover by actor...",
  "Explore by genre...",
];

interface SearchBarProps {
  defaultValue?: string;
  large?: boolean;
  autoFocus?: boolean;
}

export default function SearchBar({
  defaultValue = "",
  large = false,
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    if (query) return;
    const interval = setInterval(() => {
      setTimeout(() => {
        setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, [query]);

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    const trimmed = query.trim();
    const current = parseSearchPageParams({
      q: searchParams.get("q") ?? undefined,
      type: searchParams.get("type") ?? undefined,
      genre: searchParams.get("genre") ?? undefined,
      year: searchParams.get("year") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      rating: searchParams.get("rating") ?? undefined,
    });

    router.push(
      buildSearchPath(
        {
          q: trimmed,
          page: 1,
        },
        { ...current, q: trimmed }
      )
    );

    recordSearchQuery(trimmed, current.genre ? [current.genre] : undefined);
  }

  const placeholder = PLACEHOLDERS[placeholderIndex];

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <input
        type="search"
        aria-label="Search for movies, series, directors, and actors"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={query ? "Search titles, directors, actors..." : placeholder}
        autoFocus={autoFocus}
        className={`w-full rounded-xl border bg-[var(--bg-card)] text-[var(--text-primary)] outline-none ${
          large ? "py-4 pl-6 pr-14 text-lg" : "h-11 py-2.5 pl-4 pr-11 text-sm"
        } ${
          focused
            ? "border-[var(--accent-primary)] ring-2 ring-[rgba(201,106,43,0.1)]"
            : "border-[var(--border-strong)]"
        } placeholder:text-[var(--text-muted)]`}
      />
      <button
        type="button"
        onClick={() => handleSubmit()}
        aria-label="Search"
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-primary)]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>
    </form>
  );
}
