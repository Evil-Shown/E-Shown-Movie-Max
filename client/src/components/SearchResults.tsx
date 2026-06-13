"use client";

import type { Movie } from "@/lib/types";
import MovieGrid from "./MovieGrid";
import { AnimatePresence, motion } from "framer-motion";

interface SearchResultsProps {
  movies: Movie[];
  query: string;
  emptyMessage: string;
  source?: "omdb" | "mixed";
  totalResults?: number;
}

export default function SearchResults({
  movies,
  query,
  emptyMessage,
  source,
  totalResults,
}: SearchResultsProps) {
  const countLabel =
    query && source
      ? `Found ${totalResults ?? movies.length} title${(totalResults ?? movies.length) !== 1 ? "s" : ""} via OMDb`
      : query
        ? `Found ${movies.length} title${movies.length !== 1 ? "s" : ""} matching "${query}"`
        : "Showing curated titles — start typing to search OMDb";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={query + movies.length + (source ?? "")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <p className="mb-6 text-sm text-[var(--text-secondary)]">{countLabel}</p>
        <MovieGrid movies={movies} emptyMessage={emptyMessage} />
      </motion.div>
    </AnimatePresence>
  );
}
