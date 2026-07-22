"use client";

import { allGenres } from "@/lib/movies";
import type { SearchSort } from "@/lib/movie-service";
import {
  buildSearchPath,
  hasActiveSearchFilters,
  yearOptions,
  type SearchPageParams,
} from "@/lib/search-params";
import { recordSearchQuery } from "@/lib/storage/taste-signals";
import type { Genre } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SORT_OPTIONS: { value: SearchSort; label: string }[] = [
  { value: "popular", label: "Popular" },
  { value: "top_rated", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

const RATING_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: "Any rating" },
  { value: 6, label: "6+ stars" },
  { value: 7, label: "7+ stars" },
  { value: 8, label: "8+ stars" },
  { value: 9, label: "9+ stars" },
];

interface SearchFiltersProps {
  params: SearchPageParams;
}

export default function SearchFilters({ params }: SearchFiltersProps) {
  const router = useRouter();
  const filtersActive = hasActiveSearchFilters(params);

  function navigate(updates: Partial<SearchPageParams>) {
    const nextGenre = updates.genre !== undefined ? updates.genre : params.genre;
    if (updates.genre !== undefined && nextGenre) {
      recordSearchQuery(params.q, [nextGenre]);
    }
    router.push(buildSearchPath(updates, params));
  }

  return (
    <div className="relative z-10 mx-auto w-full max-w-4xl text-left">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent-cool)]">
          Filters
        </p>
        {filtersActive && (
          <Link
            href={buildSearchPath(
              {
                genre: null,
                year: null,
                sort: "popular",
                minRating: null,
                page: 1,
              },
              { ...params, q: params.q }
            )}
            className="text-xs font-medium text-[var(--accent-primary)] hover:underline"
          >
            Clear filters
          </Link>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Sort order">
        {SORT_OPTIONS.map((option) => {
          const active = params.sort === option.value;
          return (
            <Link
              key={option.value}
              href={buildSearchPath({ sort: option.value }, params)}
              aria-current={active ? "true" : undefined}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[var(--on-accent)]"
                  : "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
              }`}
            >
              {option.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
            Year
          </span>
          <select
            value={params.year ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              navigate({ year: value ? Number(value) : null });
            }}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
          >
            <option value="">Any year</option>
            {yearOptions().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
            Min rating
          </span>
          <select
            value={params.minRating ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              navigate({ minRating: value ? Number(value) : null });
            }}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
          >
            {RATING_OPTIONS.map((option) => (
              <option key={option.label} value={option.value ?? ""}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[var(--text-secondary)]" id="genre-filter-label">
          Genre
        </p>
        <div className="genre-pills-scroll flex gap-2 overflow-x-auto pb-1" role="group" aria-labelledby="genre-filter-label">
          <Link
            href={buildSearchPath({ genre: null }, params)}
            aria-current={!params.genre ? "true" : undefined}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              !params.genre
                ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[var(--on-accent)]"
                : "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
            }`}
          >
            All genres
          </Link>
          {allGenres.map((genre) => {
            const active = params.genre === genre;
            return (
              <Link
                key={genre}
                href={buildSearchPath({ genre: genre as Genre }, params)}
                aria-current={active ? "true" : undefined}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[var(--on-accent)]"
                    : "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                }`}
              >
                {genre}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
