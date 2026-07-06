"use client";

import Link from "next/link";
import type { Genre } from "@/lib/types";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUpVariant, staggerContainer } from "@/lib/motion";

interface GenrePillsProps {
  genres: Genre[];
  activeGenre?: string | null;
  basePath?: string;
}

export default function GenrePills({
  genres,
  activeGenre,
  basePath = "/browse",
}: GenrePillsProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="flex flex-wrap gap-2"
      variants={prefersReducedMotion ? undefined : staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={prefersReducedMotion ? undefined : fadeUpVariant}>
        <Link
          href={basePath}
          className={`inline-block px-4 py-2 text-[10px] font-medium uppercase tracking-[0.15em] transition duration-150 ${
            !activeGenre
              ? "bg-[var(--gold-primary)] text-black"
              : "border border-[var(--border-mid)] text-[var(--text-secondary)] hover:border-[var(--border-hot)] hover:text-[var(--gold-primary)]"
          }`}
        >
          All
        </Link>
      </motion.div>
      {genres.map((genre) => {
        const isActive = activeGenre === genre;
        return (
          <motion.div key={genre} variants={prefersReducedMotion ? undefined : fadeUpVariant}>
            <Link
              href={`${basePath}?genre=${encodeURIComponent(genre)}`}
              className={`inline-block px-4 py-2 text-[10px] font-medium uppercase tracking-[0.15em] transition duration-150 ${
                isActive
                  ? "bg-[var(--gold-primary)] text-black"
                  : "border border-[var(--border-mid)] text-[var(--text-secondary)] hover:border-[var(--border-hot)] hover:text-[var(--gold-primary)]"
              }`}
            >
              {genre}
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
