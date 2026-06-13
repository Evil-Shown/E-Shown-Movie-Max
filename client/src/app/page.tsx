import HeroBanner from "@/components/HeroBanner";
import MovieRow from "@/components/MovieRow";
import CtaBanner from "@/components/CtaBanner";
import {
  getFeaturedMovie,
  getMoviesByGenre,
  getNewReleases,
  getTrendingMovies,
  movies,
} from "@/lib/movies";

export default function HomePage() {
  const featured = getFeaturedMovie();
  const trending = getTrendingMovies();
  const newReleases = getNewReleases();
  const topRated = [...movies].sort((a, b) => b.rating - a.rating).slice(0, 8);
  const sciFi = getMoviesByGenre("Sci-Fi");
  const drama = getMoviesByGenre("Drama");

  return (
    <>
      <HeroBanner movie={featured} />

      <div className="relative bg-[var(--bg-void)] pb-12">
        <MovieRow
          eyebrow="Curated Collection"
          title="Trending"
          subtitle="What everyone is watching this week"
          movies={trending}
          priorityFirst
          showRank
        />
        <MovieRow
          eyebrow="Fresh Arrivals"
          title="New Releases"
          subtitle="Fresh arrivals on E-Shown Movie Max"
          movies={newReleases}
        />
        <MovieRow
          eyebrow="Critics' Choice"
          title="Top Rated"
          subtitle="Critically acclaimed favorites"
          movies={topRated}
        />
        <MovieRow eyebrow="Genre Spotlight" title="Sci-Fi & Beyond" movies={sciFi} />
        <MovieRow eyebrow="Genre Spotlight" title="Drama Collection" movies={drama} />

        <CtaBanner />
      </div>
    </>
  );
}
