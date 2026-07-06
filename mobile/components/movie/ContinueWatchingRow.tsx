import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import PosterImage from './PosterImage';
import { useUserLibrary } from '@/components/providers/UserLibraryProvider';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import type { ContinueWatchingItem } from '@/lib/storage/types';

interface ContinueWatchingRowProps {
  onResume?: (item: ContinueWatchingItem) => void;
}

/**
 * "Continue Watching" row — ported from the web app's
 * ContinueWatchingRow.tsx. Each card shows a remove (×) button, the resume
 * progress bar, and a Resume/Play label depending on how far in the user
 * got. The web version's hover-to-reveal X button has no mobile
 * equivalent, so the remove button stays visible here.
 */
export default function ContinueWatchingRow({ onResume }: ContinueWatchingRowProps) {
  const { continueWatching, removeContinueItem } = useUserLibrary();

  if (!continueWatching.length) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Pick Up Where You Left Off</Text>
        <Text style={styles.title}>Continue Watching</Text>
      </View>

      <FlatList
        data={continueWatching}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.track}
        renderItem={({ item }) => (
          <View style={styles.cardSlot}>
            <Pressable
              style={styles.removeBtn}
              onPress={() => removeContinueItem(item.id)}
              accessibilityLabel={`Remove ${item.title} from continue watching`}
            >
              <Text style={styles.removeBtnText}>×</Text>
            </Pressable>

            <Pressable onPress={() => onResume?.(item)}>
              <View style={styles.poster}>
                <PosterImage posterPath={item.posterPath} title={item.title} />
                <View style={styles.resumeOverlay}>
                  <Text style={styles.resumeLabel}>{item.currentTime > 30 ? 'Resume' : 'Play'}</Text>
                </View>
                {item.progress > 0 && (
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${Math.max(item.progress, 4)}%` }]} />
                  </View>
                )}
              </View>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.season && item.episode ? (
                <Text style={styles.episodeTag}>
                  S{item.season} E{item.episode}
                </Text>
              ) : null}
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  eyebrow: {
    fontFamily: fonts.uiSemibold,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.accentPrimary,
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
  },
  track: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  cardSlot: {
    width: 132,
    position: 'relative',
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: colors.white,
    fontSize: 13,
    lineHeight: 14,
  },
  poster: {
    width: '100%',
    height: 198,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    position: 'relative',
  },
  resumeOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeLabel: {
    backgroundColor: colors.accentPrimary,
    color: colors.white,
    fontFamily: fonts.uiSemibold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accentWarm,
  },
  itemTitle: {
    marginTop: spacing.sm,
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  episodeTag: {
    fontFamily: fonts.uiSemibold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
});
