import Link from "next/link";
import type { SearchMediaFilter } from "@/lib/movie-service";
import { buildSearchPath, type SearchPageParams } from "@/lib/search-params";

const MEDIA_OPTIONS: { value: SearchMediaFilter; label: string }[] = [
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV Series" },
  { value: "anime", label: "Anime" },
  { value: "all", label: "All" },
];

interface SearchMediaTabsProps {
  params: SearchPageParams;
}

export default function SearchMediaTabs({ params }: SearchMediaTabsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Media type filter">
      {MEDIA_OPTIONS.map((option) => {
        const active = params.type === option.value;
        return (
          <Link
            key={option.value}
            href={buildSearchPath({ type: option.value }, params)}
            aria-current={active ? "page" : undefined}
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
