import MovieDetailClient from "@/components/MovieDetailClient";
import MovieDetailHero from "@/components/MovieDetailHero";
import MovieRow from "@/components/MovieRow";
import { backdropUrl, getMovieById, getSimilarMovies } from "@/lib/movies";
import { notFound } from "next/navigation";

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const { movies } = await import("@/lib/movies");
  return movies.map((movie) => ({ id: movie.id }));
}

export async function generateMetadata({ params }: MoviePageProps) {
  const { id } = await params;
  const movie = getMovieById(id);
  if (!movie) return { title: "Movie Not Found" };
  return {
    title: `${movie.title} | E-Shown Movie Max`,
    description: movie.overview,
  };
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const movie = getMovieById(id);
  if (!movie) notFound();

  const similar = getSimilarMovies(movie);

  return (
    <>
      <MovieDetailHero backdropSrc={backdropUrl(movie.backdropPath)} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MovieDetailClient movie={movie} />
      </div>

      {similar.length > 0 && (
        <div className="border-t border-[var(--border-subtle)]">
          <MovieRow title="You May Also Like" movies={similar} eyebrow="Recommended" />
        </div>
      )}
    </>
  );
}
