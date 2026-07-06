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
    <section className={`group/row relative ${embedded ? "py-0" : "py-10"}`}>
      <div className="mx-auto mb-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-[rgba(32,38,54,0.36)] px-5 py-4 shadow-[0_14px_36px_rgba(0,0,0,0.14)] backdrop-blur-sm sm:border-l-4 sm:border-l-[var(--gold-primary)]">
          {eyebrow && (
            <p className="font-cinzel text-[0.6rem] uppercase tracking-[0.3em] text-[var(--gold-bright)]">
              {eyebrow}
            </p>
          )}
          <h2 className="font-cinzel text-2xl text-[var(--text-primary)] sm:text-3xl">{title}</h2>
          <div
            className="mt-2 h-px bg-gradient-to-r from-[var(--gold-primary)] via-[var(--border-mid)] to-transparent transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
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
              data-cursor="link"
              onClick={() => scrollBy(-600)}
              className="absolute left-0 top-1/2 z-20 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border-mid)] bg-[rgba(32,38,54,0.88)] text-[var(--gold-primary)] opacity-0 shadow-[0_12px_28px_rgba(0,0,0,0.24)] backdrop-blur-md transition-opacity duration-200 hover:bg-[var(--gold-primary)] hover:text-black group-hover/row:opacity-100 active:scale-95 md:flex"
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
              className="absolute right-0 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-[var(--border-mid)] bg-[rgba(32,38,54,0.88)] text-[var(--gold-primary)] opacity-0 shadow-[0_12px_28px_rgba(0,0,0,0.24)] backdrop-blur-md transition-opacity duration-200 hover:bg-[var(--gold-primary)] hover:text-black group-hover/row:opacity-100 active:scale-95 md:flex"
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
          className="row-scroll flex gap-5 overflow-x-auto px-4 pb-4 pt-1 sm:px-6 lg:px-8"
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
