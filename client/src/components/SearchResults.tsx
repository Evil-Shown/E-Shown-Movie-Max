"use client";

import type { Movie } from "@/lib/types";
import MovieGrid from "./MovieGrid";
import { AnimatePresence, motion } from "framer-motion";

interface SearchResultsProps {
  movies: Movie[];
  query: string;
  emptyMessage: string;
}

export default function SearchResults({ movies, query, emptyMessage }: SearchResultsProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={query + movies.length}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <p className="mb-6 text-sm text-[var(--text-secondary)]">
          {query
            ? `Found ${movies.length} title${movies.length !== 1 ? "s" : ""} matching "${query}"`
            : "Showing all titles — start typing to filter"}
        </p>
        <MovieGrid movies={movies} emptyMessage={emptyMessage} />
      </motion.div>
    </AnimatePresence>
  );
}
