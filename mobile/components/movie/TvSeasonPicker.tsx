import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useUserLibrary } from '@/components/providers/UserLibraryProvider';
import { useVideoPlayer } from '@/components/providers/VideoPlayerProvider';
import { useTvEpisodes, useTvSeasons } from '@/lib/api/hooks';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import type { Movie } from '@chithra/core/types';

interface TvSeasonPickerProps {
  movie: Movie;
}

/**
 * Season/episode picker — ported from the web app's TvSeasonPicker.tsx.
 * The web version used a native <select>; this uses a horizontal row of
 * season chips instead, which is the more standard mobile pattern for a
 * small, bounded list of options (RN has no built-in <select> equivalent
 * that doesn't require an extra picker-wheel dependency).
 */
export default function TvSeasonPicker({ movie }: TvSeasonPickerProps) {
  const { openMovie } = useVideoPlayer();
  const { isEpisodeWatched, toggleEpisodeWatched, watchedEpisodeCount } = useUserLibrary();
  const [selectedSeason, setSelectedSeason] = useState<number | undefined>(undefined);

  const tvId = movie.id.startsWith('tv-') ? movie.id.slice(3) : movie.id;

  const { data: seasonsData, isLoading: seasonsLoading } = useTvSeasons(tvId);
  const seasons = seasonsData?.seasons.filter((s) => s.season_number > 0) ?? [];

  useEffect(() => {
    if (seasons[0] && selectedSeason === undefined) {
      setSelectedSeason(seasons[0].season_number);
    }
  }, [seasons, selectedSeason]);

  const { data: episodesData, isLoading: episodesLoading } = useTvEpisodes(tvId, selectedSeason);
  const episodes = episodesData?.episodes ?? [];

  if (seasonsLoading) {
    return (
      <View style={styles.section}>
        <ActivityIndicator color={colors.accentPrimary} />
      </View>
    );
  }

  if (!seasons.length) {
    return (
      <View style={styles.section}>
        <Text style={styles.fallbackText}>
          Season data unavailable. You can still play from S1 E1 using the Play button.
        </Text>
      </View>
    );
  }

  const watchedCount = watchedEpisodeCount(tvId);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Episodes</Text>
        <Text style={styles.subtitle}>
          {watchedCount > 0
            ? `${watchedCount} episode${watchedCount === 1 ? '' : 's'} watched`
            : 'Select a season and episode'}
        </Text>
      </View>

      <Text style={styles.seasonLabel}>Season</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.seasonRow}>
        {seasons.map((season) => {
          const active = season.season_number === selectedSeason;
          return (
            <Pressable
              key={season.season_number}
              style={[styles.seasonChip, active && styles.seasonChipActive]}
              onPress={() => setSelectedSeason(season.season_number)}
            >
              <Text style={[styles.seasonChipText, active && styles.seasonChipTextActive]}>
                {season.name} ({season.episode_count ?? '–'})
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {episodesLoading ? (
        <ActivityIndicator color={colors.accentPrimary} style={styles.episodesLoading} />
      ) : (
        <View style={styles.episodeList}>
          {episodes.map((ep) => {
            const watched = isEpisodeWatched(tvId, selectedSeason ?? 1, ep.episode_number);
            return (
              <View key={ep.episode_number} style={[styles.episodeCard, watched && styles.episodeCardWatched]}>
                <View style={styles.episodeHeader}>
                  <View style={styles.episodeHeaderText}>
                    <Text style={styles.episodeTag}>E{ep.episode_number}</Text>
                    <Text style={styles.episodeName} numberOfLines={1}>
                      {ep.name}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => toggleEpisodeWatched(tvId, selectedSeason ?? 1, ep.episode_number)}
                    accessibilityLabel={watched ? 'Mark unwatched' : 'Mark watched'}
                    style={styles.watchedToggle}
                  >
                    <Text style={[styles.watchedToggleText, watched && styles.watchedToggleTextActive]}>
                      {watched ? '✓' : '○'}
                    </Text>
                  </Pressable>
                </View>
                {ep.overview ? (
                  <Text style={styles.episodeOverview} numberOfLines={2}>
                    {ep.overview}
                  </Text>
                ) : null}
                <Pressable
                  style={styles.playEpisodeBtn}
                  onPress={() =>
                    openMovie(movie, { season: selectedSeason, episode: ep.episode_number })
                  }
                >
                  <Text style={styles.playEpisodeBtnText}>▶ Play Episode</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.xl,
    backgroundColor: colors.bgCard,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  fallbackText: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.textSecondary,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  seasonLabel: {
    fontFamily: fonts.uiSemibold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  seasonRow: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  seasonChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgSecondary,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  seasonChipActive: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  seasonChipText: {
    fontFamily: fonts.uiSemibold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  seasonChipTextActive: {
    color: colors.white,
  },
  episodesLoading: {
    marginTop: spacing.lg,
  },
  episodeList: {
    gap: spacing.sm,
  },
  episodeCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    padding: spacing.md,
  },
  episodeCardWatched: {
    borderColor: 'rgba(74,124,142,0.4)',
    backgroundColor: 'rgba(46,107,94,0.08)',
  },
  episodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  episodeHeaderText: {
    flex: 1,
  },
  episodeTag: {
    fontFamily: fonts.uiSemibold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.accentPrimary,
  },
  episodeName: {
    fontFamily: fonts.uiSemibold,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 2,
  },
  watchedToggle: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchedToggleText: {
    fontSize: 18,
    color: colors.textMuted,
  },
  watchedToggleTextActive: {
    color: colors.accentCool,
  },
  episodeOverview: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  playEpisodeBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    backgroundColor: colors.accentPrimary,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  playEpisodeBtnText: {
    fontFamily: fonts.uiSemibold,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.white,
  },
});
