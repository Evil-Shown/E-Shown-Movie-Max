"use client";

import type { Movie } from "@/lib/types";
import MovieQuickView from "@/components/MovieQuickView";
import { createContext, useCallback, useContext, useState } from "react";

interface QuickViewContextValue {
  openQuickView: (movie: Movie) => void;
  closeQuickView: () => void;
  activeMovie: Movie | null;
}

const QuickViewContext = createContext<QuickViewContextValue | null>(null);

export function useQuickView() {
  const ctx = useContext(QuickViewContext);
  if (!ctx) throw new Error("useQuickView must be used within QuickViewProvider");
  return ctx;
}

export default function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);

  const openQuickView = useCallback((movie: Movie) => setActiveMovie(movie), []);
  const closeQuickView = useCallback(() => setActiveMovie(null), []);

  return (
    <QuickViewContext.Provider value={{ openQuickView, closeQuickView, activeMovie }}>
      {children}
      <MovieQuickView movie={activeMovie} onClose={closeQuickView} />
    </QuickViewContext.Provider>
  );
}
