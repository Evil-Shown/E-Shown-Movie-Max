"use client";

import type { CatalogSource, SearchMediaFilter } from "@/lib/movie-service";
import { AnimatePresence, motion } from "framer-motion";
import { memo, type ReactNode } from "react";

interface SearchResultsProps {
  query: string;
  page: number;
  totalPages: number;
  source?: CatalogSource;
  totalResults?: number;
  mediaFilter?: SearchMediaFilter;
  filtersActive?: boolean;
  children: ReactNode;
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

function SearchResults({
  query,
  page,
  totalPages,
  source,
  totalResults,
  mediaFilter = "movie",
  filtersActive = false,
  children,
}: SearchResultsProps) {
  const label = mediaLabel(mediaFilter);
  const countLabel = query
    ? `Found ${(totalResults ?? 0).toLocaleString()} ${label} via ${sourceLabel(source)}`
    : filtersActive
      ? `${(totalResults ?? 0).toLocaleString()} ${label} matching your filters via ${sourceLabel(source)}`
      : `Popular ${label} from ${sourceLabel(source)} — search or filter to explore more`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${query}-${page}-${source ?? ""}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <p className="mb-6 text-xs sm:text-sm text-[var(--text-secondary)] break-words">
          {countLabel}
          {totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}
        </p>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default memo(SearchResults);
