import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useUserLibrary } from '@/components/providers/UserLibraryProvider';
import PosterImage from '@/components/movie/PosterImage';
import RatingRing from '@/components/movie/RatingRing';
import { colors, fonts, radii, spacing } from '@/constants/theme';

/**
 * Watchlist screen — unlike Browse/Search, this one is fully real rather
 * than a placeholder, since the watchlist data layer (AsyncStorage +
 * UserLibraryProvider) already exists. Tapping an item goes to its detail
 * screen, same as everywhere else.
 */
export default function WatchlistScreen() {
  const { watchlist } = useUserLibrary();
  const router = useRouter();

  if (watchlist.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Your watchlist is empty</Text>
        <Text style={styles.emptySubtitle}>
          Tap the heart icon on any movie or show to save it here.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.list}
      data={watchlist}
      keyExtractor={(item) => item.id}
      numColumns={3}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <Pressable
          style={styles.cardWrap}
          onPress={() => router.push(`/movie/${item.id}`)}
          accessibilityRole="button"
          accessibilityLabel={`View ${item.title}`}
        >
          <View style={styles.poster}>
            <PosterImage posterPath={item.posterPath} title={item.title} />
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.year}>{item.year}</Text>
            <RatingRing rating={item.rating} size={20} />
          </View>
        </Pressable>
      )}
    />
  );
}

const CARD_WIDTH = '31%';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  list: {
    padding: spacing.lg,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  cardWrap: {
    width: CARD_WIDTH,
  },
  poster: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.bgSecondary,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.uiSemibold,
    fontSize: 12,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  year: {
    fontFamily: fonts.ui,
    fontSize: 11,
    color: colors.textMuted,
  },
  empty: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
