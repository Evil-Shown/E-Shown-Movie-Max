"use client";

import { useQuickView } from "@/components/QuickViewProvider";
import type { Movie } from "@/lib/types";
import type { KeyboardEvent, ReactNode } from "react";

interface MovieCardQuickViewTriggerProps {
  movie: Movie;
  children: ReactNode;
}

export default function MovieCardQuickViewTrigger({ movie, children }: MovieCardQuickViewTriggerProps) {
  const { openQuickView } = useQuickView();

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openQuickView(movie);
    }
  }

  return (
    <div role="button" tabIndex={0} onClick={() => openQuickView(movie)} onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
}
