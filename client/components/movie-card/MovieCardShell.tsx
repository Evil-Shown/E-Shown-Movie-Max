"use client";

import type { Movie } from "@/lib/types";
import { recordPosterDwell } from "@/lib/storage/taste-signals";
import { motion, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface MovieCardShellProps {
  movie: Movie;
  className?: string;
  children: ReactNode;
}

export default function MovieCardShell({ movie, className, children }: MovieCardShellProps) {
  const prefersReducedMotion = useReducedMotion();
  const dwellStartRef = useRef<number | null>(null);
  const dwellRecordedRef = useRef(false);

  function handlePointerEnter() {
    dwellStartRef.current = Date.now();
  }

  function handlePointerLeave() {
    if (dwellRecordedRef.current || dwellStartRef.current === null) return;
    const seconds = (Date.now() - dwellStartRef.current) / 1000;
    if (seconds >= 2) {
      dwellRecordedRef.current = true;
      recordPosterDwell(
        {
          id: movie.id,
          title: movie.title,
          genres: movie.genres,
          mediaType: movie.mediaType,
        },
        seconds
      );
    }
    dwellStartRef.current = null;
  }

  return (
    <motion.div
      initial={false}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
      className={className}
      onMouseEnter={handlePointerEnter}
      onMouseLeave={handlePointerLeave}
      onFocus={handlePointerEnter}
      onBlur={handlePointerLeave}
    >
      {children}
    </motion.div>
  );
}
