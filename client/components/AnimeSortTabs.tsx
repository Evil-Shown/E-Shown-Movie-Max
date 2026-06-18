import Link from "next/link";
import type { AnimeMediaType, AnimeSort } from "@/lib/movie-service";

const SORT_OPTIONS: { value: AnimeSort; label: string; tvLabel?: string }[] = [
  { value: "popular", label: "Popular" },
  { value: "trending", label: "Trending Today" },
  { value: "top_rated", label: "Top Rated" },
];

interface AnimeSortTabsProps {
  activeSort: AnimeSort;
  mediaType: AnimeMediaType;
}

function buildHref(sort: AnimeSort, mediaType: AnimeMediaType) {
  const params = new URLSearchParams({ type: mediaType });
  if (sort !== "popular") params.set("sort", sort);
  return `/anime?${params.toString()}`;
}

export default function AnimeSortTabs({ activeSort, mediaType }: AnimeSortTabsProps) {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {SORT_OPTIONS.map((option) => {
        const active = activeSort === option.value;
        const label =
          mediaType === "tv" && option.tvLabel ? option.tvLabel : option.label;
        return (
          <Link
            key={option.value}
            href={buildHref(option.value, mediaType)}
            className={`rounded-full border px-4 py-2 text-xs font-medium ${
              active
                ? "border-[var(--bg-dark)] bg-[var(--bg-dark)] text-[var(--text-inverse)]"
                : "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
