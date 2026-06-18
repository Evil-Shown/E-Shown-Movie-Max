import ContinueWatchingRow from "@/components/ContinueWatchingRow";
import HeroCarousel from "@/components/HeroCarousel";
import HomeSection from "@/components/HomeSection";
import MovieRow from "@/components/MovieRow";
import PickedForYouRow from "@/components/PickedForYouRow";
import { getHomeCatalogEssential } from "@/lib/movie-service";

export default async function HomeHero() {
  const { heroMovies, trending, trendingDay } = await getHomeCatalogEssential();

  return (
    <>
      <HeroCarousel movies={heroMovies} />
      <ContinueWatchingRow />
      <PickedForYouRow />
      <HomeSection className="section-base py-12">
        <MovieRow
          embedded
          eyebrow="🔥 Trending"
          title="Trending Today"
          subtitle="What everyone is watching right now"
          movies={trendingDay.length ? trendingDay : trending}
          priorityFirst
          showRank
        />
      </HomeSection>
    </>
  );
}
