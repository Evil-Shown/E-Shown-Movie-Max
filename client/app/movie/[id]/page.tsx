import MovieDetailClient from "@/components/MovieDetailClient";
import MovieDetailHero from "@/components/MovieDetailHero";
import MovieRow from "@/components/MovieRow";
import { backdropUrl } from "@/lib/movies";
import { getSimilarMovies, resolveMovie } from "@/lib/movie-service";
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
  const movie = await resolveMovie(id);
  if (!movie) return { title: "Movie Not Found" };
  return {
    title: movie.title,
    description: movie.overview,
  };
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const movie = await resolveMovie(id);
  if (!movie) notFound();

  const similar = await getSimilarMovies(movie);

  return (
    <>
      <MovieDetailHero backdropSrc={backdropUrl(movie.backdropPath)} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MovieDetailClient movie={movie} />
      </div>

      {similar.length > 0 && (
        <div className="section-base border-t border-[var(--divider)]">
          <MovieRow embedded title="You May Also Like" movies={similar} eyebrow="Recommended" />
        </div>
      )}
    </>
  );
}
