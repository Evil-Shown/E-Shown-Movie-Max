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
          data-cursor="link"
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-medium uppercase tracking-[0.15em] shadow-[0_8px_22px_rgba(0,0,0,0.12)] transition duration-150 hover:shadow-[0_0_12px_rgba(201,168,76,0.2)] active:scale-95 ${
            !activeGenre
              ? "border border-[var(--gold-primary)] bg-[rgba(212,168,67,0.16)] text-[var(--gold-bright)]"
              : "border border-[var(--border-mid)] bg-[rgba(32,38,54,0.5)] text-[var(--text-secondary)] hover:border-[var(--border-hot)] hover:bg-[rgba(212,168,67,0.08)] hover:text-[var(--gold-primary)]"
          }`}
        >
          {!activeGenre && (
            <span className="animate-pulse-ring h-1.5 w-1.5 rounded-full bg-[var(--gold-primary)]" />
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
              data-cursor="link"
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-medium uppercase tracking-[0.15em] shadow-[0_8px_22px_rgba(0,0,0,0.12)] transition duration-150 hover:shadow-[0_0_12px_rgba(201,168,76,0.2)] active:scale-95 ${
                isActive
                  ? "border border-[var(--gold-primary)] bg-[rgba(212,168,67,0.16)] text-[var(--gold-bright)]"
                  : "border border-[var(--border-mid)] bg-[rgba(32,38,54,0.5)] text-[var(--text-secondary)] hover:border-[var(--border-hot)] hover:bg-[rgba(212,168,67,0.08)] hover:text-[var(--gold-primary)]"
              }`}
            >
              {isActive && (
                <span className="animate-pulse-ring h-1.5 w-1.5 rounded-full bg-[var(--gold-primary)]" />
              )}
              {genre}
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
