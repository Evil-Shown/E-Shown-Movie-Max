import Link from "next/link";
import type { SearchMediaFilter } from "@/lib/movie-service";

const MEDIA_OPTIONS: { value: SearchMediaFilter; label: string }[] = [
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV Series" },
  { value: "all", label: "All" },
];

interface SearchMediaTabsProps {
  activeFilter: SearchMediaFilter;
  query: string;
}

function buildHref(filter: SearchMediaFilter, query: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (filter !== "movie") params.set("type", filter);
  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}

export default function SearchMediaTabs({ activeFilter, query }: SearchMediaTabsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {MEDIA_OPTIONS.map((option) => {
        const active = activeFilter === option.value;
        return (
          <Link
            key={option.value}
            href={buildHref(option.value, query)}
            className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
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
