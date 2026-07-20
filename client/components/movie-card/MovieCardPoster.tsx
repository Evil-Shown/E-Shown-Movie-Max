"use client";

import PosterImage from "@/components/PosterImage";
import type { Movie } from "@/lib/types";
import { useState } from "react";

interface MovieCardPosterProps {
  movie: Movie;
  priority?: boolean;
  imageClassName?: string;
}

export default function MovieCardPoster({ movie, priority = false, imageClassName }: MovieCardPosterProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <div className="skeleton absolute inset-0 z-[1]" />}
      <PosterImage
        posterPath={movie.posterPath}
        title={movie.title}
        priority={priority}
        className={imageClassName}
        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 200px"
        onLoad={() => setLoaded(true)}
      />
    </>
  );
}
