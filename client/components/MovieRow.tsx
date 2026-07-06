"use client";

import type { Movie } from "@/lib/types";
import MovieCard from "./MovieCard";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./MovieRow.module.css";

interface MovieRowProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  movies: Movie[];
  priorityFirst?: boolean;
  showRank?: boolean;
  embedded?: boolean;
  seeAllHref?: string;
}

export default function MovieRow({
  title,
  subtitle,
  eyebrow,
  movies,
  priorityFirst = false,
  showRank = false,
  embedded = false,
  seeAllHref = "/browse",
}: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

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
    <section className={`${styles.row} group/row ${embedded ? "" : "py-14"}`}>
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <div>
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          <Link href={seeAllHref} className={styles.seeAll}>
            See all →
          </Link>
        </div>
      </div>

      <div className={styles.scrollWrap}>
        {canScroll && (
          <>
            <button
              type="button"
              aria-label="Scroll left"
              data-cursor="link"
              onClick={() => scrollBy(-600)}
              className={`${styles.scrollBtn} ${styles.scrollBtnLeft}`}
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
              className={`${styles.scrollBtn} ${styles.scrollBtnRight}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        <div ref={scrollRef} className={styles.track}>
          {movies.map((movie, i) => (
            <div key={`${title}-${movie.id}`} className={styles.cardSlot}>
              <MovieCard
                movie={movie}
                priority={priorityFirst && i < 4}
                rank={showRank ? i + 1 : undefined}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
