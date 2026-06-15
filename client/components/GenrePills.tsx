"use client";

import Link from "next/link";
import type { Genre } from "@/lib/types";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUpVariant, staggerContainer } from "@/lib/motion";

interface GenrePillsProps {
  genres: Genre[];
  activeGenre?: string | null;
  activeSort?: string | null;
  basePath?: string;
  scrollable?: boolean;
}

function browseHref(basePath: string, genre?: string, sort?: string | null) {
  const params = new URLSearchParams();
  if (genre) params.set("genre", genre);
  if (sort && sort !== "popular") params.set("sort", sort);
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export default function GenrePills({
  genres,
  activeGenre,
  activeSort,
  basePath = "/browse",
  scrollable = false,
}: GenrePillsProps) {
  const prefersReducedMotion = useReducedMotion();

  const containerClass = scrollable
    ? "genre-pills-scroll flex gap-2 overflow-x-auto pb-1"
    : "flex flex-wrap gap-2";

  return (
    <motion.div
      className={containerClass}
      variants={prefersReducedMotion ? undefined : staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={prefersReducedMotion ? undefined : fadeUpVariant} className="shrink-0">
        <Link
          href={browseHref(basePath, undefined, activeSort)}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium ${
            !activeGenre
              ? "border-[var(--bg-dark)] bg-[var(--bg-dark)] text-[var(--text-inverse)]"
              : "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
          }`}
        >
          {!activeGenre && (
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-warm)]" />
          )}
          All
        </Link>
      </motion.div>
      {genres.map((genre) => {
        const isActive = activeGenre === genre;
        return (
          <motion.div key={genre} variants={prefersReducedMotion ? undefined : fadeUpVariant} className="shrink-0">
            <Link
              href={browseHref(basePath, genre, activeSort)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium ${
                isActive
                  ? "border-[var(--bg-dark)] bg-[var(--bg-dark)] text-[var(--text-inverse)]"
                  : "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
              }`}
            >
              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-warm)]" />
              )}
              {genre}
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
