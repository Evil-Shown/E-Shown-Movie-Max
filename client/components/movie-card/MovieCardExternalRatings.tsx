"use client";

import { useExternalRating } from "@/components/external-ratings/ExternalRatingsProvider";
import type { Movie } from "@/lib/types";

interface MovieCardExternalRatingsProps {
  movie: Movie;
}

export default function MovieCardExternalRatings({ movie }: MovieCardExternalRatingsProps) {
  const externalRatings = useExternalRating(movie);

  if (!externalRatings) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {typeof externalRatings.imdb === "number" ? (
        <span className="rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
          IMDb {externalRatings.imdb.toFixed(1)}
        </span>
      ) : null}
      {typeof externalRatings.rottenTomatoes === "number" ? (
        <span className="rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
          RT {externalRatings.rottenTomatoes}%
        </span>
      ) : null}
    </div>
  );
}
