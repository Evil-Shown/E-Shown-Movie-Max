import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';

import { StreamPlayer } from '@/components/player/StreamPlayer';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useMovieDetail } from '@/lib/api/hooks';
import type { StreamProvider } from '@chithra/core/providers';
import { STREAM_PROVIDERS } from '@chithra/core/providers';
import { getMovieEmbedUrl } from '@/lib/streaming';
import type { Movie } from '@chithra/core/types';

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: movie, isLoading, error } = useMovieDetail(id);
  const [provider, setProvider] = useState<StreamProvider>(STREAM_PROVIDERS[0]);

  const embedUrl = useMemo(() => {
    if (!movie) return null;
    return getMovieEmbedUrl(movie, provider);
  }, [movie, provider]);

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StreamPlayer
        embedUrl={embedUrl}
        provider={provider}
        onProviderChange={setProvider}
        title={movie.title}
      />

      <View style={styles.info}>
        <Text style={styles.title}>{movie.title}</Text>

        <View style={styles.meta}>
          <Text style={styles.year}>{movie.year}</Text>
          {movie.runtime > 0 && (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.year}>{formatRuntime(movie.runtime)}</Text>
            </>
          )}
          <Text style={styles.metaDot}>·</Text>
          <View style={styles.ratingPill}>
            <Text style={styles.ratingText}>★ {movie.rating.toFixed(1)}</Text>
          </View>
        </View>

        {movie.tagline ? (
          <Text style={styles.tagline}>{movie.tagline}</Text>
        ) : null}

        {movie.genres.length > 0 && (
          <View style={styles.genreRow}>
            {movie.genres.map((genre) => (
              <View key={genre} style={styles.genreChip}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
        )}

        {movie.overview ? (
          <Text style={styles.overview}>{movie.overview}</Text>
        ) : null}

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
              {movie.cast.slice(0, 5).map((c) => c.name).join(', ')}
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
  info: {
    padding: spacing.lg,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.textPrimary,
    lineHeight: 34,
    marginBottom: spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  year: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.textSecondary,
  },
  metaDot: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.textMuted,
    marginHorizontal: spacing.sm,
  },
  ratingPill: {
    backgroundColor: colors.ratingPillBg,
    borderWidth: 1,
    borderColor: colors.ratingPillBorder,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  ratingText: {
    fontFamily: fonts.uiSemibold,
    fontSize: 13,
    color: colors.ratingPillText,
  },
  tagline: {
    fontFamily: fonts.headingItalic,
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
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
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontFamily: fonts.uiSemibold,
    fontSize: 12,
    color: colors.accentCool,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  sectionValue: {
    fontFamily: fonts.ui,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
});
