import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';

import { useVideoPlayer } from '@/components/providers/VideoPlayerProvider';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useMovieDetail } from '@/lib/api/hooks';
import { isTvShow } from '@/lib/streaming';

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: movie, isLoading, error } = useMovieDetail(id);
  const { openMovie, openTrailer } = useVideoPlayer();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accentPrimary} />
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to load movie</Text>
      </View>
    );
  }

  const tv = isTvShow(movie);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Image
          source={{ uri: movie.backdropPath || movie.posterPath }}
          style={styles.backdrop}
          contentFit="cover"
        />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{movie.title}</Text>
          <View style={styles.meta}>
            <Text style={styles.metaText}>{movie.year}</Text>
            {movie.runtime > 0 && (
              <>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.metaText}>{formatRuntime(movie.runtime)}</Text>
              </>
            )}
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.ratingText}>★ {movie.rating.toFixed(1)}</Text>
          </View>
          <View style={styles.actions}>
            <Pressable
              style={styles.primaryButton}
              onPress={() => openMovie(movie, tv ? { season: 1, episode: 1 } : undefined)}
            >
              <Text style={styles.primaryButtonText}>{tv ? 'Watch S1 E1' : 'Watch Now'}</Text>
            </Pressable>
            {movie.trailerKey && (
              <Pressable style={styles.secondaryButton} onPress={() => openTrailer(movie)}>
                <Text style={styles.secondaryButtonText}>Trailer</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      <View style={styles.info}>
        {movie.tagline ? <Text style={styles.tagline}>“{movie.tagline}”</Text> : null}

        {movie.genres.length > 0 && (
          <View style={styles.genreRow}>
            {movie.genres.map((genre) => (
              <View key={genre} style={styles.genreChip}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
        )}

        {movie.overview ? <Text style={styles.overview}>{movie.overview}</Text> : null}

        {movie.director ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Director</Text>
            <Text style={styles.sectionValue}>{movie.director}</Text>
          </View>
        ) : null}

        {movie.cast.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Cast</Text>
            <Text style={styles.sectionValue}>
              {movie.cast.slice(0, 5).map((c) => `${c.name} (${c.role})`).join(', ')}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: fonts.ui,
    fontSize: 16,
    color: colors.textSecondary,
  },
  hero: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(28,25,23,0.55)',
  },
  heroContent: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  heroTitle: {
    fontFamily: fonts.heading,
    fontSize: 32,
    color: colors.textInverse,
    lineHeight: 38,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaText: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.textInverse,
  },
  metaDot: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.textInverse,
    marginHorizontal: spacing.sm,
    opacity: 0.7,
  },
  ratingText: {
    fontFamily: fonts.uiSemibold,
    fontSize: 14,
    color: colors.accentWarm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  primaryButtonText: {
    fontFamily: fonts.uiSemibold,
    fontSize: 14,
    color: colors.white,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  secondaryButtonText: {
    fontFamily: fonts.uiSemibold,
    fontSize: 14,
    color: colors.textInverse,
  },
  info: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  tagline: {
    fontFamily: fonts.headingItalic,
    fontSize: 18,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  genreChip: {
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  genreText: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.textSecondary,
  },
  overview: {
    fontFamily: fonts.ui,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  section: {
    gap: spacing.xs,
  },
  sectionLabel: {
    fontFamily: fonts.uiSemibold,
    fontSize: 12,
    color: colors.accentCool,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionValue: {
    fontFamily: fonts.ui,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
});
