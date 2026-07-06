import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import MovieRow from '@/components/movie/MovieRow';
import RatingRing from '@/components/movie/RatingRing';
import WatchlistButton from '@/components/movie/WatchlistButton';
import ProviderSwitcher from '@/components/movie/ProviderSwitcher';
import TvSeasonPicker from '@/components/movie/TvSeasonPicker';
import { posterUrl } from '@/components/movie/PosterImage';
import { useMovieDetail, useSimilarMovies } from '@/lib/api/hooks';
import { useVideoPlayer } from '@/components/providers/VideoPlayerProvider';
import { isTvShow } from '@/lib/streaming';
import { formatRuntime, initials } from '@/lib/format';
import { colors, fonts, radii, spacing } from '@/constants/theme';

const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';
const PLAY_PATH = 'M8 5v14l11-7z';
const TRAILER_PATH = 'M10 9l5 3-5 3V9z';

/**
 * Movie detail screen ΓÇö ported from the web app's app/movie/[id]/page.tsx,
 * MovieDetailHero.tsx, and MovieDetailClient.tsx, combined into one screen.
 * Dropped from the original: the parallax scroll effect on the backdrop
 * (Framer Motion, no direct RN equivalent without extra scroll-tracking
 * machinery) and the animated star-rating / rating-bar reveal animations
 * (cosmetic, not core to the feature). The rating ring, all data, and all
 * actions (Play/Trailer/Watchlist/Provider/Season picker/Cast) are intact.
 */
export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { openMovie, openTrailer } = useVideoPlayer();
  const [overviewExpanded, setOverviewExpanded] = useState(false);

  const { data: movie, isLoading, isError } = useMovieDetail(id);
  const { data: similar = [] } = useSimilarMovies(id);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accentPrimary} size="large" />
      </View>
    );
  }

  if (isError || !movie) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Couldn&apos;t load this title</Text>
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>ΓåÉ Go back</Text>
        </Pressable>
      </View>
    );
  }

  const showTv = isTvShow(movie);
  const overviewLong = movie.overview.length > 220;

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.heroWrap}>
        <Image
          source={{ uri: `${BACKDROP_BASE}${movie.backdropPath}` }}
          style={styles.heroImage}
          contentFit="cover"
        />
        <View style={styles.heroScrim} />
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>ΓåÉ</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.posterCard}>
          <Image
            source={{ uri: posterUrl(movie.posterPath, 'w500') }}
            style={styles.posterImage}
            contentFit="cover"
          />
        </View>

        <Text style={styles.nowViewing}>Now Viewing</Text>
        <Pressable onPress={() => router.push('/browse')} style={styles.browseChip}>
          <Text style={styles.browseChipText}>ΓåÉ Back to browse</Text>
        </Pressable>

        <Text style={styles.title}>{movie.title}</Text>
        {showTv && <Text style={styles.tvLabel}>TV Series</Text>}
        {movie.tagline ? <Text style={styles.tagline}>{movie.tagline}</Text> : null}

        <View style={styles.ratingBlock}>
          <RatingRing rating={movie.rating} size={64} />
          <Text style={styles.ratingCaption}>TMDB SCORE</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{movie.year}</Text>
          <Text style={styles.metaDot}>┬╖</Text>
          <Text style={styles.metaText}>{formatRuntime(movie.runtime)}</Text>
        </View>

        <Text style={styles.directedByLabel}>Directed by</Text>
        <Text style={styles.directedByName}>{movie.director}</Text>

        <View style={styles.genreRow}>
          {movie.genres.map((genre) => (
            <Pressable
              key={genre}
              style={styles.genrePill}
              onPress={() => router.push(`/browse?genre=${encodeURIComponent(genre)}`)}
            >
              <Text style={styles.genrePillText}>{genre}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={styles.playBtn}
            onPress={() => openMovie(movie)}
            accessibilityLabel={showTv ? 'Play season 1 episode 1' : 'Play film'}
          >
            <Svg width={14} height={14} viewBox="0 0 24 24">
              <Path d={PLAY_PATH} fill={colors.white} />
            </Svg>
            <Text style={styles.playBtnText}>{showTv ? 'Play S1 E1' : 'Play Film'}</Text>
          </Pressable>
          <Pressable style={styles.trailerBtn} onPress={() => openTrailer(movie)}>
            <Svg width={14} height={14} viewBox="0 0 24 24">
              <Path d={TRAILER_PATH} fill={colors.textPrimary} />
            </Svg>
            <Text style={styles.trailerBtnText}>Watch Trailer</Text>
          </Pressable>
          <View style={styles.watchlistSlotLarge}>
            <WatchlistButton movie={movie} />
          </View>
        </View>

        <View style={styles.providerSwitcherWrap}>
          <ProviderSwitcher />
        </View>
      </View>

      <View style={styles.synopsisCard}>
        <Text style={styles.synopsisTitle}>Synopsis</Text>
        <Text style={styles.synopsisText} numberOfLines={overviewExpanded ? undefined : 4}>
          {movie.overview}
        </Text>
        {overviewLong && (
          <Pressable onPress={() => setOverviewExpanded((v) => !v)}>
            <Text style={styles.readMore}>{overviewExpanded ? 'Show less' : 'Read more'}</Text>
          </Pressable>
        )}
      </View>

      {showTv && <TvSeasonPicker movie={movie} />}

      {movie.cast.length > 0 && (
        <View style={styles.castSection}>
          <Text style={styles.castTitle}>Cast</Text>
          <View style={styles.castGrid}>
            {movie.cast.map((member) => (
              <View key={member.name} style={styles.castCard}>
                <View style={styles.castAvatar}>
                  <Text style={styles.castInitials}>{initials(member.name)}</Text>
                </View>
                <View style={styles.castInfo}>
                  <Text style={styles.castName} numberOfLines={1}>
                    {member.name}
                  </Text>
                  <Text style={styles.castRole} numberOfLines={1}>
                    {member.role}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {similar.length > 0 && (
        <MovieRow eyebrow="Recommended" title="You May Also Like" movies={similar} />
      )}

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
  errorTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  backLink: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  backLinkText: {
    fontFamily: fonts.uiSemibold,
    fontSize: 13,
    color: colors.accentPrimary,
  },
  heroWrap: {
    height: 320,
    position: 'relative',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bgPrimary,
    opacity: 0.15,
  },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: 'rgba(28,25,23,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: colors.white,
    fontSize: 16,
  },
  body: {
    marginTop: -120,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  posterCard: {
    width: 180,
    height: 270,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.bgSecondary,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  nowViewing: {
    fontFamily: fonts.uiSemibold,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.accentPrimary,
    marginBottom: spacing.sm,
  },
  browseChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: spacing.lg,
  },
  browseChipText: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  title: {
    fontFamily: fonts.headingBlack,
    fontSize: 32,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  tvLabel: {
    fontFamily: fonts.uiSemibold,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.accentCool,
    marginTop: spacing.sm,
  },
  tagline: {
    fontFamily: fonts.headingItalic,
    fontSize: 17,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  ratingBlock: {
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: 6,
  },
  ratingCaption: {
    fontFamily: fonts.uiSemibold,
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  metaText: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.textSecondary,
  },
  metaDot: {
    color: colors.textMuted,
  },
  directedByLabel: {
    fontFamily: fonts.uiSemibold,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.accentCool,
    marginTop: spacing.lg,
  },
  directedByName: {
    fontFamily: fonts.ui,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: 4,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  genrePill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  genrePillText: {
    fontFamily: fonts.uiSemibold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentPrimary,
    borderRadius: radii.md,
    paddingVertical: 13,
    paddingHorizontal: 22,
  },
  playBtnText: {
    fontFamily: fonts.uiSemibold,
    fontSize: 14,
    color: colors.white,
  },
  trailerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    paddingVertical: 13,
    paddingHorizontal: 20,
  },
  trailerBtnText: {
    fontFamily: fonts.uiSemibold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  watchlistSlotLarge: {
    transform: [{ scale: 1.3 }],
  },
  providerSwitcherWrap: {
    width: '100%',
    maxWidth: 280,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  synopsisCard: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.bgCard,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  synopsisTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
  },
  synopsisText: {
    fontFamily: fonts.ui,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  readMore: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.accentPrimary,
    marginTop: spacing.sm,
  },
  castSection: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.bgCard,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  castTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.textPrimary,
    borderLeftWidth: 2,
    borderLeftColor: colors.accentPrimary,
    paddingLeft: spacing.md,
    marginBottom: spacing.lg,
  },
  castGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  castCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    padding: spacing.sm,
  },
  castAvatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  castInitials: {
    fontFamily: fonts.headingBlack,
    fontSize: 13,
    color: colors.textPrimary,
  },
  castInfo: {
    flex: 1,
  },
  castName: {
    fontFamily: fonts.uiSemibold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  castRole: {
    fontFamily: fonts.headingItalic,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
