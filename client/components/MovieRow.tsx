"use client";

import type { Movie } from "@/lib/types";
import MovieCard from "./MovieCard";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { staggerContainer } from "@/lib/motion";

interface MovieRowProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  movies: Movie[];
  priorityFirst?: boolean;
  showRank?: boolean;
  embedded?: boolean;
}

export default function MovieRow({
  title,
  subtitle,
  eyebrow,
  movies,
  priorityFirst = false,
  showRank = false,
  embedded = false,
}: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  function updateScrollState() {
    if (!scrollRef.current) return;
    const { scrollWidth, clientWidth } = scrollRef.current;
    setCanScroll(scrollWidth > clientWidth + 4);
  }

  function scrollBy(delta: number) {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => {
      window.removeEventListener("resize", updateScrollState);
    };
  }, [movies.length]);

  if (movies.length === 0) return null;

  return (
    <section className={`group/row relative ${embedded ? "py-0" : "py-14"}`}>
      <div className="mx-auto mb-6 max-w-[1280px] px-6">
        <div className="flex items-baseline justify-between gap-6">
          <div>
            {eyebrow && (
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent-cool)]">
                {eyebrow}
              </p>
            )}
            <h2 className="font-[var(--font-playfair)] text-[28px] font-bold text-[var(--text-primary)]">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>
            )}
          </div>
          <Link
            href="/browse"
            className="shrink-0 text-xs font-medium text-[var(--text-secondary)] underline-offset-4 hover:text-[var(--accent-primary)] hover:underline"
          >
            See all →
          </Link>
        </div>
      </div>

      <div className="relative mx-auto max-w-[1280px]">
        {canScroll && (
          <>
            <button
              type="button"
              aria-label="Scroll left"
              data-cursor="link"
              onClick={() => scrollBy(-600)}
              className="absolute left-0 top-1/2 z-20 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] opacity-0 shadow-sm hover:border-[var(--border-strong)] hover:text-[var(--accent-primary)] group-hover/row:opacity-100 md:flex"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              data-cursor="link"
              onClick={() => scrollBy(600)}
              className="absolute right-0 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] opacity-0 shadow-sm hover:border-[var(--border-strong)] hover:text-[var(--accent-primary)] group-hover/row:opacity-100 md:flex"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        <motion.div
          ref={scrollRef}
          data-cursor="grab"
          className="row-scroll row-mask flex gap-4 overflow-x-auto px-6 pb-4 pt-1"
          variants={prefersReducedMotion ? undefined : staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {movies.map((movie, i) => (
            <div key={movie.id} className="relative w-[152px] shrink-0 sm:w-[176px] md:w-[200px]">
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
