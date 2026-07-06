import Link from "next/link";
import type { BrowseSort } from "@/lib/movie-service";
import type { MediaType } from "@/lib/types";

const SORT_OPTIONS: { value: BrowseSort; label: string; tvLabel?: string }[] = [
  { value: "popular", label: "Popular" },
  { value: "top_rated", label: "Top Rated" },
  { value: "now_playing", label: "Now Playing", tvLabel: "On The Air" },
];

interface BrowseSortTabsProps {
  activeSort: BrowseSort;
  genre?: string | null;
  mediaType?: MediaType;
}

function buildHref(sort: BrowseSort, genre?: string | null, mediaType: MediaType = "movie") {
  const params = new URLSearchParams();
  if (mediaType === "tv") params.set("type", "tv");
  if (genre) params.set("genre", genre);
  if (sort !== "popular") params.set("sort", sort);
  const qs = params.toString();
  return qs ? `/browse?${qs}` : "/browse";
}

export default function BrowseSortTabs({
  activeSort,
  genre,
  mediaType = "movie",
}: BrowseSortTabsProps) {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {SORT_OPTIONS.map((option) => {
        const active = activeSort === option.value;
        const label = mediaType === "tv" && option.tvLabel ? option.tvLabel : option.label;
        return (
          <Link
            key={option.value}
            href={buildHref(option.value, genre, mediaType)}
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
