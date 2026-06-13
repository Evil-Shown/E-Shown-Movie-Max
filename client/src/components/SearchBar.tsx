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
        <span className="absolute bottom-3 left-3 top-3 z-[1] w-1 rounded-full bg-[var(--gold-primary)]" aria-hidden />
      )}
      {!query && !focused && (
        <span
          className="search-idle-underline pointer-events-none absolute bottom-0 left-4 right-4 h-px origin-center"
          aria-hidden
        />
      )}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={query ? "Search titles, directors, actors..." : placeholder}
        autoFocus={autoFocus}
        data-cursor="text"
        className={`font-cormorant w-full rounded-2xl border bg-[rgba(42,49,69,0.82)] text-[var(--text-primary)] shadow-[0_14px_36px_rgba(0,0,0,0.16)] outline-none backdrop-blur-sm transition duration-200 ${
          large ? "h-16 py-4 pl-7 pr-14 text-lg" : "h-11 py-2.5 pl-5 pr-12 text-sm"
        } ${
          focused
            ? "border-[var(--gold-primary)] shadow-[0_0_0_3px_rgba(212,168,67,0.14),0_18px_44px_rgba(0,0,0,0.18)] brightness-110"
            : "border-[rgba(255,255,255,0.12)]"
        } ${!query && placeholderVisible ? "placeholder:opacity-100" : "placeholder:opacity-70"} placeholder:italic placeholder:text-[var(--text-secondary)] placeholder:transition-opacity placeholder:duration-300`}
      />
      <button
        type="button"
        data-cursor="link"
        onClick={() => handleSubmit()}
        aria-label="Search"
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--text-secondary)] transition hover:bg-[rgba(212,168,67,0.12)] hover:text-[var(--gold-primary)] active:scale-95"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>
    </form>
  );
}
