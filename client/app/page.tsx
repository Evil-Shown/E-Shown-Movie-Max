import HeroBanner from "@/components/HeroBanner";
import HomeSection from "@/components/HomeSection";
import MovieRow from "@/components/MovieRow";
import CtaBanner from "@/components/CtaBanner";
import { getHomeCatalog } from "@/lib/movie-service";

export default async function HomePage() {
  const { featured, trending, newReleases, topRated, sciFi, drama, stats } = await getHomeCatalog();

  return (
    <>
      <HeroBanner movie={featured} />

      <HomeSection className="section-base py-14">
        <MovieRow
          embedded
          eyebrow="Popular Now"
          title="Trending"
          subtitle="What everyone is watching this week"
          movies={trending}
          priorityFirst
          showRank
        />
      </HomeSection>

      <HomeSection className="section-alt py-14">
        <MovieRow
          embedded
          eyebrow="In Theaters"
          title="New Releases"
          subtitle="Latest movies now playing"
          movies={newReleases}
        />
      </HomeSection>

      <HomeSection className="section-surface py-14">
        <MovieRow
          embedded
          eyebrow="Critics' Choice"
          title="Top Rated"
          subtitle="Highest rated on TMDB"
          movies={topRated}
        />
      </HomeSection>

      <HomeSection className="section-alt py-14">
        <MovieRow embedded eyebrow="Genre Spotlight" title="Sci-Fi & Beyond" movies={sciFi} />
      </HomeSection>

      <HomeSection className="section-base py-14">
        <MovieRow embedded eyebrow="Genre Spotlight" title="Drama Collection" movies={drama} />
      </HomeSection>

      <CtaBanner stats={stats} />
    </>
  );
}
