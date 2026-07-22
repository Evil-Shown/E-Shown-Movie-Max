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
    <div className="flex h-full w-full items-center justify-center bg-[var(--bg-secondary)] p-4 text-center">
      <span className="font-[var(--font-playfair)] text-5xl text-[var(--text-muted)]">
        {title.trim().charAt(0).toUpperCase() || "M"}
      </span>
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
  sizes = "(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 200px",
  onLoad,
}: PosterImageProps) {
  const [failed, setFailed] = useState(false);
  const src = posterPath ? posterUrl(posterPath, "w500") : "";

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
      className={className.includes("object-") ? className : `${className} object-cover`.trim()}
      onError={() => setFailed(true)}
      onLoad={onLoad}
      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center" }}
    />
  );
}
