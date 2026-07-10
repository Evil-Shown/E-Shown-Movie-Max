import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import HeroCarousel from '@/components/movie/HeroCarousel';
import ContinueWatchingRow from '@/components/movie/ContinueWatchingRow';
import MovieRow from '@/components/movie/MovieRow';
import { useHomeCatalog } from '@/lib/api/hooks';
import { useVideoPlayer } from '@/components/providers/VideoPlayerProvider';
import { colors, fonts, spacing } from '@/constants/theme';

/**
 * Home screen — ported from the web app's app/page.tsx. Section order,
 * eyebrows, titles, and subtitles match the original exactly. The web
 * version's CtaBanner (a stats footer at the very bottom of an infinite
 * page) is dropped here since mobile screens don't have an end-of-page
 * footer convention the same way.
 */
export default function HomeScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useHomeCatalog();
  const { openMovie, openTrailer } = useVideoPlayer();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accentPrimary} size="large" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Couldn&apos;t load the catalog.</Text>
        <Text style={styles.errorSubtext}>Pull down to try again, or check your connection.</Text>
      </View>
    );
  }

  const {
    heroMovies,
    trending,
    trendingDay,
    newReleases,
    topRated,
    popularTv,
    sinhalaCinema,
    sciFi,
    drama,
  } = data;

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.accentPrimary} />}
      showsVerticalScrollIndicator={false}
    >
      <HeroCarousel movies={heroMovies} onPlay={openMovie} onTrailer={openTrailer} />

      <ContinueWatchingRow
        onResume={(item) =>
          openMovie(
            {
              id: item.id,
              mediaType: item.mediaType,
              title: item.title,
              tagline: '',
              overview: '',
              posterPath: item.posterPath,
              backdropPath: '',
              rating: 0,
              year: 0,
              runtime: Math.round(item.duration / 60),
              genres: [],
              director: 'Unknown',
              cast: [],
            },
            {
              season: item.season,
              episode: item.episode,
              provider: item.provider,
              resumeSeconds: item.currentTime,
            }
          )
        }
      />

      <MovieRow
        eyebrow="🔥 Trending"
        title="Trending Today"
        subtitle="What everyone is watching right now"
        movies={trendingDay.length ? trendingDay : trending}
        showRank
      />

      <MovieRow eyebrow="Popular Now" title="Popular Movies" subtitle="Most watched this week" movies={trending} />

      <MovieRow eyebrow="In Theaters" title="New Releases" subtitle="Latest movies now playing" movies={newReleases} />

      {popularTv.length > 0 && (
        <MovieRow eyebrow="Series" title="Popular Series" subtitle="Binge-worthy TV from TMDB" movies={popularTv} />
      )}

      {sinhalaCinema.length > 0 && (
        <MovieRow eyebrow="Hela Cinema" title="Sri Lankan Cinema" subtitle="Films in Sinhala" movies={sinhalaCinema} />
      )}

      <MovieRow eyebrow="Critics' Choice" title="Top Rated" subtitle="Highest rated on TMDB" movies={topRated} />

      <MovieRow eyebrow="Genre Spotlight" title="Sci-Fi & Beyond" movies={sciFi} />

      <MovieRow eyebrow="Genre Spotlight" title="Drama Collection" movies={drama} />

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgPrimary,
    padding: spacing.xl,
  },
  errorText: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  errorSubtext: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
