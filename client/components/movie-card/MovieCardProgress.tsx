"use client";

import { usePlaybackLibrary } from "@/components/UserLibraryProvider";
import { useAfterHydration } from "@/lib/hooks/use-after-hydration";

interface MovieCardProgressProps {
  movieId: string;
}

export default function MovieCardProgress({ movieId }: MovieCardProgressProps) {
  const { continueWatching } = usePlaybackLibrary();
  const afterHydration = useAfterHydration();

  const progress = afterHydration ? (continueWatching.find((item) => item.id === movieId)?.progress ?? 0) : 0;

  if (progress <= 0) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-[2] h-1" style={{ background: "color-mix(in srgb, var(--bg-dark) 35%, transparent)" }}>
      <div className="h-full bg-[var(--accent-warm)]" style={{ width: `${Math.max(progress, 4)}%` }} />
    </div>
  );
}
