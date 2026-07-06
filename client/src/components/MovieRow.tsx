"use client";

import type { Movie } from "@/lib/types";
import MovieCard from "./MovieCard";
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
}

export default function MovieRow({
  title,
  subtitle,
  eyebrow,
  movies,
  priorityFirst = false,
  showRank = false,
}: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [lineWidth, setLineWidth] = useState(0);
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
    const t = setTimeout(() => setLineWidth(100), 200);
    return () => {
      window.removeEventListener("resize", updateScrollState);
      clearTimeout(t);
    };
  }, [movies.length]);

  if (movies.length === 0) return null;

  return (
    <section className="group/row relative py-10">
      <div className="mx-auto mb-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-l-4 border-[var(--gold-primary)] pl-4">
          {eyebrow && (
            <p className="font-cinzel text-[0.6rem] uppercase tracking-[0.3em] text-[var(--gold-primary)]">
              {eyebrow}
            </p>
          )}
          <h2 className="font-cinzel text-2xl text-[var(--text-primary)] sm:text-3xl">{title}</h2>
          <div
            className="mt-2 h-px bg-[var(--border-mid)] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: `${lineWidth}%`, maxWidth: "100%" }}
          />
          {subtitle && (
            <p className="font-cormorant mt-2 text-sm italic text-[var(--text-secondary)]">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl">
        {canScroll && (
          <>
            <button
              type="button"
              aria-label="Scroll left"
              onClick={() => scrollBy(-600)}
              className="absolute left-0 top-1/2 z-20 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(201,168,76,0.25)] bg-[rgba(2,2,10,0.85)] text-[var(--gold-primary)] opacity-0 transition-opacity duration-200 hover:bg-[var(--gold-primary)] hover:text-black group-hover/row:opacity-100 md:flex"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => scrollBy(600)}
              className="absolute right-0 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-[rgba(201,168,76,0.25)] bg-[rgba(2,2,10,0.85)] text-[var(--gold-primary)] opacity-0 transition-opacity duration-200 hover:bg-[var(--gold-primary)] hover:text-black group-hover/row:opacity-100 md:flex"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        <motion.div
          ref={scrollRef}
          className="row-scroll flex gap-4 overflow-x-auto px-4 pb-2 sm:px-6 lg:px-8"
          variants={prefersReducedMotion ? undefined : staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {movies.map((movie, i) => (
            <div key={movie.id} className="relative w-[150px] shrink-0 sm:w-[175px] md:w-[200px]">
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
