"use client";

import ExternalRatingsProvider from "@/components/external-ratings/ExternalRatingsProvider";
import MovieCardClient from "@/components/movie-card/MovieCardClient";
import { useUserLibrary } from "@/components/UserLibraryProvider";
import Link from "next/link";
import type { Movie } from "@/lib/types";

export default function WatchlistPageClient() {
  const { watchlist } = useUserLibrary();

  if (!watchlist.length) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-[var(--font-playfair)] text-3xl text-[var(--text-primary)]">Your Watchlist</h1>
        <p className="mt-3 text-[var(--text-secondary)]">
          Save movies and series you want to watch later. Tap the heart on any title to add it here.
        </p>
        <Link
          href="/browse"
          className="mt-8 inline-flex rounded-full bg-[var(--accent-primary)] px-6 py-3 text-sm font-semibold text-[var(--on-accent)] hover:brightness-110"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  const movies: Movie[] = watchlist.map((item) => ({
    id: item.id,
    mediaType: item.mediaType,
    title: item.title,
    tagline: "",
    overview: "",
    posterPath: item.posterPath,
    backdropPath: item.posterPath,
    rating: item.rating,
    year: item.year,
    runtime: 0,
    genres: [],
    director: "",
    cast: [],
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-primary)]">
          Saved for Later
        </p>
        <h1 className="font-[var(--font-playfair)] text-3xl text-[var(--text-primary)]">Watchlist</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{watchlist.length} titles saved</p>
      </div>

      <ExternalRatingsProvider
        movies={movies}
        className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4"
      >
        {movies.map((movie) => (
          <MovieCardClient key={movie.id} movie={movie} />
        ))}
      </ExternalRatingsProvider>
    </div>
  );
}
