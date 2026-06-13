"use client";

import { useRouter } from "next/navigation";
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
  const [query, setQuery] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);

  useEffect(() => {
    if (query) return;
    const interval = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
        setPlaceholderVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, [query]);

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  }

  const placeholder = PLACEHOLDERS[placeholderIndex];

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      {focused && (
        <span className="absolute bottom-0 left-0 top-0 w-1 bg-[var(--gold-primary)]" aria-hidden />
      )}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={query ? "Search titles, directors, actors..." : placeholder}
        autoFocus={autoFocus}
        className={`font-cormorant w-full rounded-none border bg-[var(--bg-surface)] text-[var(--text-primary)] outline-none transition duration-200 ${
          large ? "h-16 py-4 pl-6 pr-14 text-lg" : "h-11 py-2.5 pl-5 pr-12 text-sm"
        } ${
          focused
            ? "border-[var(--gold-primary)] shadow-[0_0_20px_rgba(201,168,76,0.15)] brightness-110"
            : "border-[var(--border-mid)]"
        } ${!query && placeholderVisible ? "placeholder:opacity-100" : "placeholder:opacity-70"} placeholder:italic placeholder:text-[var(--text-dim)] placeholder:transition-opacity placeholder:duration-300`}
      />
      <button
        type="button"
        onClick={() => handleSubmit()}
        aria-label="Search"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] transition hover:text-[var(--gold-primary)]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>
    </form>
  );
}
