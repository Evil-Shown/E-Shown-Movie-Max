"use client";

import { useRef } from "react";
import { Oswald } from "next/font/google";
import type { GodsEyeSearch } from "./gods-eye/hooks/useGodsEyeSearch";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["300", "500"],
  display: "swap",
});

type GodsEyeHeroProps = Pick<
  GodsEyeSearch,
  | "query"
  | "loading"
  | "displayTrending"
  | "searchInputRef"
  | "handleSearch"
  | "handleQueryChange"
  | "searchSuggestion"
  | "fetchTrendingSearches"
  | "setSearchFocused"
>;

export default function GodsEyeHero({
  query,
  loading,
  displayTrending,
  searchInputRef,
  handleSearch,
  handleQueryChange,
  searchSuggestion,
  fetchTrendingSearches,
  setSearchFocused,
}: GodsEyeHeroProps) {
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollToResults = () => {
    const results = document.getElementById("results");
    if (results) {
      results.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#FFFFFF] px-6 pb-20 pt-32 text-center dark:bg-[var(--bg-primary)] sm:px-10 sm:pb-24 sm:pt-36"
      aria-labelledby="gods-eye-title"
    >
      {/* Ambient light orange glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-[-200px] z-[1] h-[800px] w-[800px] -translate-x-1/2"
        style={{
          background: "radial-gradient(circle, #FFB74D 0%, transparent 70%)",
          opacity: 0.15,
        }}
      />

      {/* Dramatic God&apos;s eye SVG background */}
      <svg
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 opacity-[0.04] text-[#3E2723] dark:text-[var(--text-primary)] sm:h-[480px] sm:w-[480px] lg:h-[600px] lg:w-[600px]"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="90" />
        <path d="M10 100 Q100 20 190 100 Q100 180 10 100 Z" />
        <circle cx="100" cy="100" r="35" fill="currentColor" />
        <circle cx="100" cy="100" r="15" fill="#FFB74D" />
        <line x1="100" y1="0" x2="100" y2="200" />
        <line x1="0" y1="100" x2="200" y2="100" />
      </svg>

      <div className="relative z-[2] mx-auto w-full max-w-[850px]">
        <div className="mb-6 inline-block rounded-full border border-[#D7CCC8] px-5 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#8D6E63] dark:border-[var(--border-strong)] dark:text-[var(--text-muted)] sm:mb-8">
          Guarded Around The Clock
        </div>

        <h1
          id="gods-eye-title"
          className="font-cinzel text-4xl font-bold leading-[1.1] tracking-wide text-[#3E2723] dark:text-[var(--text-primary)] sm:text-6xl lg:text-7xl"
        >
          THE GOD&apos;S <span className="text-[#E65100]">EYE</span>
        </h1>

        <p className={`${oswald.className} mb-3 mt-3 text-sm font-light uppercase tracking-[0.25em] text-[#5D4037] dark:text-[var(--text-secondary)] sm:mb-4 sm:mt-4 sm:text-base`}>
          Every Story, Carved In Light
        </p>

        <p className="mx-auto mb-10 max-w-[600px] text-base leading-relaxed text-[#8D6E63] dark:text-[var(--text-muted)] sm:mb-12 sm:text-lg">
          Search, stream, and download from one place — guarded around the clock. The court of a thousand tales awaits
          your arrival.
        </p>

        {/* Stats */}
        <div className="mb-10 flex justify-center gap-12 sm:mb-12 sm:gap-16">
          {[
            { value: "∞", label: "Titles" },
            { value: "4K", label: "Quality" },
            { value: "24/7", label: "Uptime" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="relative text-center after:absolute after:right-[-1.5rem] after:top-1/2 after:hidden after:h-[30px] after:w-px after:-translate-y-1/2 after:bg-[#D7CCC8] dark:after:bg-[var(--border-strong)] last:after:hidden sm:after:right-[-2rem] sm:after:block"
            >
              <span className="block font-cinzel text-xl font-bold text-[#E65100] sm:text-2xl">{stat.value}</span>
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-[#8D6E63] dark:text-[var(--text-muted)] sm:text-[0.75rem]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="mb-14 flex flex-wrap justify-center gap-3 sm:mb-16">
          {["Discover", "Stream", "Download"].map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={scrollToResults}
              className={`rounded-sm px-7 py-3.5 text-[0.75rem] font-bold uppercase tracking-[0.15em] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:px-9 sm:py-4 sm:text-[0.8rem] ${
                index === 0
                  ? "border border-[#E65100] bg-[#E65100] text-white hover:border-[#3E2723] hover:bg-[#3E2723] dark:hover:border-[var(--text-primary)] dark:hover:bg-[var(--bg-dark)]"
                  : "border border-[#3E2723] bg-transparent text-[#3E2723] hover:bg-[#3E2723] hover:text-white dark:border-[var(--text-primary)] dark:text-[var(--text-primary)] dark:hover:bg-[var(--bg-dark)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="mx-auto mb-10 flex max-w-[700px] flex-col gap-0 rounded border border-[#3E2723] bg-[#FFFFFF] p-1.5 dark:border-[var(--text-primary)] dark:bg-[var(--bg-primary)] shadow-[15px_15px_0px_rgba(230,81,0,0.1)] transition-shadow duration-300 focus-within:shadow-[20px_20px_0px_rgba(230,81,0,0.15)] sm:flex-row"
        >
          <input
            ref={searchInputRef}
            id="search-input"
            type="text"
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            onFocus={() => {
              setSearchFocused(true);
              fetchTrendingSearches();
            }}
            onBlur={() => {
              focusTimerRef.current = setTimeout(() => setSearchFocused(false), 150);
            }}
            placeholder="Search for your next obsession..."
            className={`${oswald.className} h-12 flex-1 bg-transparent px-4 text-sm uppercase tracking-wider text-[#3E2723] outline-none placeholder:text-[#8D6E63] dark:text-[var(--text-primary)] dark:placeholder:text-[var(--text-muted)] sm:h-14 sm:px-6 sm:text-base`}
          />
          <button
            id="search-button"
            type="submit"
            disabled={loading}
            className="flex h-12 items-center justify-center gap-2.5 rounded-sm bg-[#3E2723] px-8 dark:bg-[var(--bg-dark)] text-xs font-extrabold uppercase tracking-[0.15em] text-white transition-colors duration-300 hover:bg-[#E65100] disabled:cursor-not-allowed disabled:opacity-70 sm:h-auto sm:px-10"
          >
            {loading ? (
              "Searching..."
            ) : (
              <>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M10 2a8 8 0 015.29 13.71l4.58 4.58a1 1 0 01-1.42 1.42l-4.58-4.58A8 8 0 1110 2zm0 2a6 6 0 100 12 6 6 0 000-12z" />
                </svg>
                Search
              </>
            )}
          </button>
        </form>

        {/* Trending */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#3E2723] dark:text-[var(--text-primary)]">Trending:</span>
          {displayTrending.map((item) => (
            <button
              key={item.query}
              type="button"
              onClick={() => searchSuggestion(item.query)}
              className="rounded-full border border-[#D7CCC8] bg-[#FFFBF5] px-3.5 py-1.5 text-xs font-medium text-[#8D6E63] transition-colors duration-300 hover:border-[#E65100] hover:bg-white hover:text-[#E65100] dark:border-[var(--border-strong)] dark:bg-[var(--bg-card)] dark:text-[var(--text-muted)] dark:hover:bg-[var(--panel-white)]"
            >
              {item.query}
              {item.count > 0 ? ` (${item.count})` : ""}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
