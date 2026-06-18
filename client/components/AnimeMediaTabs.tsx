import Link from "next/link";
import type { AnimeMediaType, AnimeSort } from "@/lib/movie-service";

const MEDIA_OPTIONS: { value: "overview" | AnimeMediaType; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "Series" },
];

interface AnimeMediaTabsProps {
  activeView: "overview" | AnimeMediaType;
  sort?: AnimeSort;
}

function buildHref(view: "overview" | AnimeMediaType, sort?: AnimeSort) {
  if (view === "overview") return "/anime";
  const params = new URLSearchParams({ type: view });
  if (sort && sort !== "popular") params.set("sort", sort);
  return `/anime?${params.toString()}`;
}

export default function AnimeMediaTabs({ activeView, sort }: AnimeMediaTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {MEDIA_OPTIONS.map((option) => {
        const active = activeView === option.value;
        return (
          <Link
            key={option.value}
            href={buildHref(option.value, sort)}
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
