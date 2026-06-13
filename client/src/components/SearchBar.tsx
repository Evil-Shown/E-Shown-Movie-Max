"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={`absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 ${large ? "h-5 w-5" : "h-4 w-4"}`}
        aria-hidden
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search movies, actors, genres..."
        autoFocus={autoFocus}
        className={`w-full rounded-full border border-white/10 bg-white/5 text-white placeholder:text-zinc-500 outline-none transition focus:border-amber-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-amber-500/20 ${
          large ? "py-4 pl-12 pr-32 text-base" : "py-2.5 pl-10 pr-4 text-sm"
        }`}
      />
      {large && (
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-amber-400"
        >
          Search
        </button>
      )}
    </form>
  );
}
