import { FlatList, View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import MovieCard from './MovieCard';
import { colors, fonts, spacing } from '@/constants/theme';
import type { Movie } from '@chithra/core/types';

interface MovieRowProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  movies: Movie[];
  showRank?: boolean;
  onPlay?: (movie: Movie) => void;
}

/**
 * Horizontal movie row — ported from the web app's MovieRow.tsx /
 * MovieRow.module.css. Native horizontal FlatList replaces the web
 * version's custom scroll-button affordance, since swipe is the native
 * mobile gesture and there's no hover state to reveal chevron buttons.
 */
export default function MovieRow({ title, subtitle, eyebrow, movies, showRank, onPlay }: MovieRowProps) {
  const router = useRouter();

  if (movies.length === 0) return null;

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <Pressable onPress={() => router.push('/browse')}>
          <Text style={styles.seeAll}>See all →</Text>
        </Pressable>
      </View>

      <FlatList
        data={movies}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(movie) => `${title}-${movie.id}`}
        contentContainerStyle={styles.track}
        renderItem={({ item, index }) => (
          <View style={styles.cardSlot}>
            <MovieCard movie={item} rank={showRank ? index + 1 : undefined} onPlay={onPlay} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: fonts.uiSemibold,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.accentCool,
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  seeAll: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: colors.textSecondary,
    flexShrink: 0,
  },
  track: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  cardSlot: {
    flexShrink: 0,
  },
});
