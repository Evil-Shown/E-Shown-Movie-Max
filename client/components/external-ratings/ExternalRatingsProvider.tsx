"use client";

import { useBatchExternalRatings } from "@/lib/hooks/use-batch-external-ratings";
import type { Movie } from "@/lib/types";
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

type RatingLookup = (movie: Movie) => Movie["externalRatings"];

const ExternalRatingsContext = createContext<RatingLookup | null>(null);

interface ExternalRatingsProviderProps {
  movies: Movie[];
  children: ReactNode;
  className?: string;
}

export default function ExternalRatingsProvider({ movies, children, className }: ExternalRatingsProviderProps) {
  const { containerRef, getRating } = useBatchExternalRatings(movies);

  const lookup = useCallback<RatingLookup>((movie) => movie.externalRatings ?? getRating(movie), [getRating]);

  const value = useMemo(() => lookup, [lookup]);

  return (
    <ExternalRatingsContext.Provider value={value}>
      <div ref={containerRef} className={className ?? "contents"}>
        {children}
      </div>
    </ExternalRatingsContext.Provider>
  );
}

export function useExternalRating(movie: Movie): Movie["externalRatings"] {
  const lookup = useContext(ExternalRatingsContext);
  if (!lookup) return movie.externalRatings;
  return lookup(movie);
}
