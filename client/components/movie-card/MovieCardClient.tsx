"use client";

import WatchlistButton from "@/components/WatchlistButton";
import type { Movie } from "@/lib/types";
import Link from "next/link";
import { memo } from "react";
import MovieCardExternalRatings from "./MovieCardExternalRatings";
import MovieCardMeta from "./MovieCardMeta";
import MovieCardPlayButton from "./MovieCardPlayButton";
import MovieCardPoster from "./MovieCardPoster";
import MovieCardProgress from "./MovieCardProgress";
import MovieCardQuickViewTrigger from "./MovieCardQuickViewTrigger";
import MovieCardShell from "./MovieCardShell";
import styles from "../MovieCard.module.css";

export interface MovieCardClientProps {
  movie: Movie;
  priority?: boolean;
  rank?: number;
}

function MovieCardClient({ movie, priority = false, rank }: MovieCardClientProps) {
  return (
    <MovieCardShell movie={movie} className={styles.card}>
      {rank !== undefined && (
        <span aria-hidden className={styles.rank}>
          {String(rank).padStart(2, "0")}
        </span>
      )}

      <div className={`${styles.body} ${rank !== undefined ? styles.bodyRanked : ""}`}>
        <Link href={`/movie/${movie.id}`} className={styles.srOnly}>
          View {movie.title}
        </Link>

        <MovieCardQuickViewTrigger movie={movie}>
          <div className={styles.poster}>
            <div className="absolute right-3 top-3 z-[3]">
              <WatchlistButton movie={movie} />
            </div>

            <MovieCardPoster movie={movie} priority={priority} imageClassName={styles.posterImage} />

            <div className={styles.posterOverlay} aria-hidden />
            <div className={styles.posterBar} aria-hidden />
            <MovieCardProgress movieId={movie.id} />
            <MovieCardPlayButton movie={movie} className={styles.watchBtn} />
          </div>

          <MovieCardMeta movie={movie} />
          <MovieCardExternalRatings movie={movie} />
        </MovieCardQuickViewTrigger>
      </div>
    </MovieCardShell>
  );
}

export default memo(MovieCardClient);
