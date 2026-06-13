import HeroBanner from "@/components/HeroBanner";
import HomeSection from "@/components/HomeSection";
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

      <HomeSection className="section-base py-12">
        <MovieRow
          embedded
          eyebrow="Curated Collection"
          title="Trending"
          subtitle="What everyone is watching this week"
          movies={trending}
          priorityFirst
          showRank
        />
      </HomeSection>

      <HomeSection className="section-alt py-12">
        <MovieRow
          embedded
          eyebrow="Fresh Arrivals"
          title="New Releases"
          subtitle="Fresh arrivals on E-Shown Movie Max"
          movies={newReleases}
        />
      </HomeSection>

      <HomeSection className="section-surface py-12">
        <MovieRow
          embedded
          eyebrow="Critics' Choice"
          title="Top Rated"
          subtitle="Critically acclaimed favorites"
          movies={topRated}
        />
      </HomeSection>

      <HomeSection className="section-alt py-12">
        <MovieRow embedded eyebrow="Genre Spotlight" title="Sci-Fi & Beyond" movies={sciFi} />
      </HomeSection>

      <HomeSection className="section-base py-12">
        <MovieRow embedded eyebrow="Genre Spotlight" title="Drama Collection" movies={drama} />
      </HomeSection>

      <CtaBanner />
    </>
  );
}
