"use client";

import ExternalRatingsProvider from "@/components/external-ratings/ExternalRatingsProvider";
import MovieCardClient from "@/components/movie-card/MovieCardClient";
import type { Movie } from "@/lib/types";
import MovieRowHeader from "./MovieRowHeader";
import MovieRowScroller from "./MovieRowScroller";
import styles from "../MovieRow.module.css";

interface MovieRowClientProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  movies: Movie[];
  priorityFirst?: boolean;
  showRank?: boolean;
  embedded?: boolean;
  seeAllHref?: string;
}

export default function MovieRowClient({
  title,
  subtitle,
  eyebrow,
  movies,
  priorityFirst = false,
  showRank = false,
  embedded = false,
  seeAllHref = "/browse",
}: MovieRowClientProps) {
  if (movies.length === 0) return null;

  return (
    <ExternalRatingsProvider movies={movies}>
      <section className={`${styles.row} group/row ${embedded ? "" : "py-14"}`}>
        <MovieRowHeader title={title} subtitle={subtitle} eyebrow={eyebrow} seeAllHref={seeAllHref} />

        <MovieRowScroller>
          {movies.map((movie, index) => (
            <div key={`${title}-${movie.id}`} className={styles.cardSlot}>
              <MovieCardClient
                movie={movie}
                priority={priorityFirst && index < 4}
                rank={showRank ? index + 1 : undefined}
              />
            </div>
          ))}
        </MovieRowScroller>
      </section>
    </ExternalRatingsProvider>
  );
}
