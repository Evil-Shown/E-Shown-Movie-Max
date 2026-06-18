import HomeSection from "@/components/HomeSection";
import MovieRow from "@/components/MovieRow";
import CtaBanner from "@/components/CtaBanner";
import { getHomeCatalogExtended } from "@/lib/movie-service";

export default async function HomeMoreRows() {
  const { trending, newReleases, topRated, popularTv, sinhalaCinema, sciFi, drama, stats } =
    await getHomeCatalogExtended();

  return (
    <>
      <HomeSection className="section-alt py-12">
        <MovieRow
          embedded
          eyebrow="Popular Now"
          title="Popular Movies"
          subtitle="Most watched this week"
          movies={trending}
        />
      </HomeSection>

      <HomeSection className="section-alt py-12">
        <MovieRow
          embedded
          eyebrow="In Theaters"
          title="New Releases"
          subtitle="Latest movies now playing"
          movies={newReleases}
        />
      </HomeSection>

      {popularTv.length > 0 && (
        <HomeSection className="section-surface py-12">
          <MovieRow
            embedded
            eyebrow="Series"
            title="Popular Series"
            subtitle="Binge-worthy TV from TMDB"
            movies={popularTv}
          />
        </HomeSection>
      )}

      {sinhalaCinema.length > 0 && (
        <HomeSection className="section-alt py-12">
          <MovieRow
            embedded
            eyebrow="Hela Cinema"
            title="Sri Lankan Cinema"
            subtitle="Films in Sinhala"
            movies={sinhalaCinema}
          />
        </HomeSection>
      )}

      <HomeSection className="section-base py-12">
        <MovieRow
          embedded
          eyebrow="Critics' Choice"
          title="Top Rated"
          subtitle="Highest rated on TMDB"
          movies={topRated}
        />
      </HomeSection>

      <HomeSection className="section-alt py-12">
        <MovieRow embedded eyebrow="Genre Spotlight" title="Sci-Fi & Beyond" movies={sciFi} />
      </HomeSection>

      <HomeSection className="section-base py-12">
        <MovieRow embedded eyebrow="Genre Spotlight" title="Drama Collection" movies={drama} />
      </HomeSection>

      <CtaBanner stats={stats} />
    </>
  );
}
