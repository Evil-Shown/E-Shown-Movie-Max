"use client";

import type { Movie } from "@/lib/types";
import type { CatalogSource, SearchMediaFilter } from "@/lib/movie-service";
import MovieGrid from "./MovieGrid";
import { AnimatePresence, motion } from "framer-motion";

interface SearchResultsProps {
  movies: Movie[];
  query: string;
  page: number;
  totalPages: number;
  emptyMessage: string;
  source?: CatalogSource;
  totalResults?: number;
  mediaFilter?: SearchMediaFilter;
  filtersActive?: boolean;
}

function sourceLabel(source?: CatalogSource) {
  if (source === "tmdb") return "TMDB";
  if (source === "omdb") return "OMDb";
  if (source === "mixed") return "local + OMDb";
  return "catalog";
}

function mediaLabel(filter: SearchMediaFilter = "movie") {
  if (filter === "tv") return "TV series";
  if (filter === "all") return "titles";
  if (filter === "anime") return "anime titles";
  return "movies";
}

export default function SearchResults({
  movies,
  query,
  page,
  totalPages,
  emptyMessage,
  source,
  totalResults,
  mediaFilter = "movie",
  filtersActive = false,
}: SearchResultsProps) {
  const total = totalResults ?? movies.length;
  const label = mediaLabel(mediaFilter);
  const countLabel = query
    ? `Found ${total.toLocaleString()} ${label} via ${sourceLabel(source)}`
    : filtersActive
      ? `${total.toLocaleString()} ${label} matching your filters via ${sourceLabel(source)}`
      : `Popular ${label} from ${sourceLabel(source)} — search or filter to explore more`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${query}-${page}-${movies.length}-${source ?? ""}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <p className="mb-6 text-sm text-[var(--text-secondary)]">
          {countLabel}
          {totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}
        </p>
        <MovieGrid movies={movies} emptyMessage={emptyMessage} />
      </motion.div>
    </AnimatePresence>
  );
}
