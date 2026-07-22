import ExternalRatingsProvider from "@/components/external-ratings/ExternalRatingsProvider";
import MovieCard from "@/components/movie-card/MovieCard";
import type { Movie } from "@/lib/types";
import { memo } from "react";
import MovieRowHeader from "./movie-row/MovieRowHeader";
import MovieRowScroller from "./movie-row/MovieRowScroller";
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

function MovieRow({
  title,
  subtitle,
  eyebrow,
  movies,
  priorityFirst = false,
  showRank = false,
  embedded = false,
  seeAllHref = "/browse",
}: MovieRowProps) {
  if (movies.length === 0) return null;

  return (
    <ExternalRatingsProvider movies={movies}>
      <section className={`${styles.row} group/row ${embedded ? "" : "py-14"}`}>
        <MovieRowHeader title={title} subtitle={subtitle} eyebrow={eyebrow} seeAllHref={seeAllHref} />

        <MovieRowScroller>
          {movies.map((movie, index) => (
            <div key={`${title}-${movie.id}`} className={styles.cardSlot}>
              <MovieCard movie={movie} priority={priorityFirst && index < 4} rank={showRank ? index + 1 : undefined} />
            </div>
          ))}
        </MovieRowScroller>
      </section>
    </ExternalRatingsProvider>
  );
}

export default memo(MovieRow);
