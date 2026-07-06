import Link from "next/link";
import type { BrowseSort } from "@/lib/movie-service";

const SORT_OPTIONS: { value: BrowseSort; label: string }[] = [
  { value: "popular", label: "Popular" },
  { value: "top_rated", label: "Top Rated" },
  { value: "now_playing", label: "Now Playing" },
];

interface BrowseSortTabsProps {
  activeSort: BrowseSort;
  genre?: string | null;
}

function buildHref(sort: BrowseSort, genre?: string | null) {
  const params = new URLSearchParams();
  if (genre) params.set("genre", genre);
  if (sort !== "popular") params.set("sort", sort);
  const qs = params.toString();
  return qs ? `/browse?${qs}` : "/browse";
}

export default function BrowseSortTabs({ activeSort, genre }: BrowseSortTabsProps) {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {SORT_OPTIONS.map((option) => {
        const active = activeSort === option.value;
        return (
          <Link
            key={option.value}
            href={buildHref(option.value, genre)}
            className={`rounded-full border px-4 py-2 text-xs font-medium ${
              active
                ? "border-[var(--bg-dark)] bg-[var(--bg-dark)] text-[var(--text-inverse)]"
                : "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
