import MovieDetailHero from "@/components/MovieDetailHero";
import MovieRow from "@/components/MovieRow";
import MovieDetailClient from "@/components/MovieDetailClient";
import { backdropUrl } from "@/lib/movies";
import { getSimilarMovies, resolveMovie } from "@/lib/movie-service";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const { movies } = await import("@/lib/movies");
  return movies.map((movie) => ({ id: movie.id }));
}

export async function generateMetadata({ params }: MoviePageProps) {
  const { id } = await params;
  const movie = await resolveMovie(id);
  if (!movie) return { title: "Movie Not Found" };
  return {
    title: movie.title,
    description: movie.overview,
  };
}

/** Skeleton for the similar movies section */
function SimilarMoviesSkeleton() {
  return (
    <div className="section-base border-t border-[var(--divider)]">
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-5 h-3 w-24 rounded bg-[var(--bg-secondary)]" />
        <div className="mb-2 h-8 w-48 rounded bg-[var(--bg-secondary)]" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 w-36 shrink-0 rounded-xl bg-[var(--bg-secondary)]" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Async Server Component: Similar movies section.
 * Streams in independently from the main movie details.
 */
async function SimilarMoviesSection({
  moviePromise,
}: {
  moviePromise: Promise<Awaited<ReturnType<typeof resolveMovie>>>;
}) {
  const movie = await moviePromise;
  if (!movie) return null;

  const similar = await getSimilarMovies(movie);
  if (similar.length === 0) return null;

  return (
    <div className="section-base border-t border-[var(--divider)]">
      <MovieRow embedded title="You May Also Like" movies={similar} eyebrow="Recommended" />
    </div>
  );
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;

  // Kick off both fetches concurrently — they share the same Redis cache
  const moviePromise = resolveMovie(id);

  // Wait for movie to check if it exists (needed for 404)
  const movie = await moviePromise;
  if (!movie) notFound();

  return (
    <>
      {/* Hero: renders immediately since movie is already resolved */}
      <MovieDetailHero backdropSrc={backdropUrl(movie.backdropPath)} />

      {/* Main content: renders immediately */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MovieDetailClient movie={movie} />
      </div>

      {/* Similar movies: streams in independently */}
      <Suspense fallback={<SimilarMoviesSkeleton />}>
        <SimilarMoviesSection moviePromise={Promise.resolve(movie)} />
      </Suspense>
    </>
  );
}
