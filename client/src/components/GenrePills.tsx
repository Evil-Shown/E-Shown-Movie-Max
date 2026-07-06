"use client";

import Link from "next/link";
import type { Genre } from "@/lib/types";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUpVariant, staggerContainer } from "@/lib/motion";

interface GenrePillsProps {
  genres: Genre[];
  activeGenre?: string | null;
  basePath?: string;
  scrollable?: boolean;
}

export default function GenrePills({
  genres,
  activeGenre,
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
          href={basePath}
          className={`inline-flex items-center gap-2 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.15em] transition duration-150 hover:shadow-[0_0_12px_rgba(201,168,76,0.2)] ${
            !activeGenre
              ? "border border-[var(--gold-primary)] bg-[rgba(201,168,76,0.1)] text-[var(--gold-primary)]"
              : "border border-[var(--border-mid)] text-[var(--text-secondary)] hover:border-[var(--border-hot)] hover:text-[var(--gold-primary)]"
          }`}
        >
          {!activeGenre && (
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold-primary)]" />
          )}
          All
        </Link>
      </motion.div>
      {genres.map((genre) => {
        const isActive = activeGenre === genre;
        return (
          <motion.div key={genre} variants={prefersReducedMotion ? undefined : fadeUpVariant} className="shrink-0">
            <Link
              href={`${basePath}?genre=${encodeURIComponent(genre)}`}
              className={`inline-flex items-center gap-2 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.15em] transition duration-150 hover:shadow-[0_0_12px_rgba(201,168,76,0.2)] ${
                isActive
                  ? "border border-[var(--gold-primary)] bg-[rgba(201,168,76,0.1)] text-[var(--gold-primary)]"
                  : "border border-[var(--border-mid)] text-[var(--text-secondary)] hover:border-[var(--border-hot)] hover:text-[var(--gold-primary)]"
              }`}
            >
              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold-primary)]" />
              )}
              {genre}
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
