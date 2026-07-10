"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "../MovieRow.module.css";

interface MovieRowScrollerProps {
  children: ReactNode;
}

export default function MovieRowScroller({ children }: MovieRowScrollerProps) {
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
  }, [children]);

  return (
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

      <div ref={scrollRef} className={styles.track} onScroll={updateScrollState}>
        {children}
      </div>
    </div>
  );
}
