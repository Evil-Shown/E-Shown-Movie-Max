"use client";

import { posterUrl } from "@/lib/movies";
import Image from "next/image";
import { useState } from "react";

interface PosterImageProps {
  posterPath: string;
  title: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  onLoad?: () => void;
}

function FilmStripFallback({ title }: { title: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[var(--bg-surface)] p-4 text-center">
      <svg viewBox="0 0 48 48" fill="none" className="h-10 w-10 text-[var(--gold-primary)]">
        <rect x="4" y="10" width="40" height="28" stroke="currentColor" strokeWidth="1.2" />
        <path d="M14 10v28M34 10v28M4 18h10M34 18h10M4 30h10M34 30h10" stroke="currentColor" strokeWidth="1" />
      </svg>
      <p className="line-clamp-3 text-xs font-medium text-[var(--text-secondary)]">{title}</p>
    </div>
  );
}

export default function PosterImage({
  posterPath,
  title,
  width = 342,
  height = 513,
  priority = false,
  className = "object-cover",
  sizes = "(max-width: 640px) 40vw, 200px",
  onLoad,
}: PosterImageProps) {
  const [failed, setFailed] = useState(false);
  const src = posterPath ? posterUrl(posterPath, "w342") : "";

  if (failed || !src) {
    return <FilmStripFallback title={title} />;
  }

  return (
    <Image
      src={src}
      alt={title}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      className={className}
      onError={() => setFailed(true)}
      onLoad={onLoad}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
