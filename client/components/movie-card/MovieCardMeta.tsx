"use client";

import RatingRing from "@/components/RatingRing";
import type { Movie } from "@/lib/types";
import styles from "../MovieCard.module.css";

interface MovieCardMetaProps {
  movie: Movie;
}

export default function MovieCardMeta({ movie }: MovieCardMetaProps) {
  return (
    <div className={styles.meta}>
      <div className={styles.titleRow}>
        <p className={styles.title}>{movie.title}</p>
        {movie.mediaType === "tv" && <span className={styles.seriesBadge}>Series</span>}
      </div>
      <div className={styles.statsRow}>
        <span className={styles.year}>{movie.year}</span>
        <RatingRing rating={movie.rating} size={28} />
      </div>
    </div>
  );
}
