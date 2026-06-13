"use client";

import type { Movie } from "@/lib/types";
import MovieCard from "./MovieCard";
import { motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { staggerContainer } from "@/lib/motion";

interface MovieRowProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  priorityFirst?: boolean;
  showRank?: boolean;
}

export default function MovieRow({
  title,
  subtitle,
  movies,
  priorityFirst = false,
  showRank = false,
}: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });
  const [canScroll, setCanScroll] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-20, 0], [0.95, 1]);

  function updateConstraints() {
    if (!rowRef.current) return;
    const { scrollWidth, offsetWidth } = rowRef.current;
    const max = Math.max(0, scrollWidth - offsetWidth);
    setConstraints({ left: -max, right: 0 });
    setCanScroll(max > 0);
  }

  function scrollBy(delta: number) {
    const current = x.get();
    const next = Math.min(0, Math.max(constraints.left, current + delta));
    x.set(next);
  }

  useEffect(() => {
    updateConstraints();
    window.addEventListener("resize", updateConstraints);
    return () => window.removeEventListener("resize", updateConstraints);
  }, [movies.length]);

  if (movies.length === 0) return null;

  return (
    <section className="group/row relative py-10">
      <div className="mx-auto mb-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 border-l-4 border-[var(--gold-primary)] pl-4">
          <div>
            <h2 className="font-cinzel text-2xl text-[var(--text-primary)] sm:text-3xl">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl">
        {canScroll && (
          <>
            <button
              type="button"
              aria-label="Scroll left"
              onClick={() => scrollBy(320)}
              className="absolute left-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--bg-elevated)]/90 text-[var(--gold-primary)] opacity-0 transition hover:bg-[var(--gold-primary)] hover:text-black group-hover/row:opacity-100 md:flex"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => scrollBy(-320)}
              className="absolute right-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--bg-elevated)]/90 text-[var(--gold-primary)] opacity-0 transition hover:bg-[var(--gold-primary)] hover:text-black group-hover/row:opacity-100 md:flex"
            >
              ›
            </button>
          </>
        )}

        <motion.div
          ref={rowRef}
          style={{ x, opacity: prefersReducedMotion ? 1 : opacity }}
          drag={prefersReducedMotion ? false : "x"}
          dragConstraints={constraints}
          dragElastic={0.08}
          onDragStart={updateConstraints}
          onPointerEnter={updateConstraints}
          className="flex cursor-grab gap-4 overflow-hidden px-4 active:cursor-grabbing sm:px-6 lg:px-8"
          variants={prefersReducedMotion ? undefined : staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {movies.map((movie, i) => (
            <div
              key={movie.id}
              className="relative w-[150px] sm:w-[175px] md:w-[200px]"
            >
              <MovieCard
                movie={movie}
                priority={priorityFirst && i < 4}
                rank={showRank ? i + 1 : undefined}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
