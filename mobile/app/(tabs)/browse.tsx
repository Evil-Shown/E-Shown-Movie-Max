import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import MovieCard from '@/components/movie/MovieCard';
import { useBrowseCatalog } from '@/lib/api/hooks';
import { fetchBrowseCatalog } from '@/lib/api/movies';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import type { BrowseSort } from '@/lib/api/types';
import type { Genre, Movie } from '@/lib/tmdb-types';

const GENRES: Genre[] = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller',
];

const SORT_OPTIONS: { value: BrowseSort; label: string }[] = [
  { value: 'popular', label: 'Popular' },
  { value: 'top_rated', label: 'Top Rated' },
  { value: 'now_playing', label: 'Now Playing' },
];

function mergeMovies(existing: Movie[], incoming: Movie[]): Movie[] {
  const seen = new Set(existing.map((m) => m.id));
  const merged = [...existing];
  for (const movie of incoming) {
    if (seen.has(movie.id)) continue;
    seen.add(movie.id);
    merged.push(movie);
  }
  return merged;
}

/**
 * Browse screen — ported from the web app's app/browse/page.tsx +
 * BrowseCatalog.tsx. Infinite scroll via FlatList's onEndReached, genre
 * pills, and sort tabs. The web version used IntersectionObserver for
 * infinite scroll; RN's FlatList onEndReached is the equivalent.
 */
export default function BrowseScreen() {
  const params = useLocalSearchParams<{ genre?: string }>();
  const initialGenre = (params.genre as Genre) ?? null;

  const [activeGenre, setActiveGenre] = useState<Genre | null>(initialGenre);
  const [activeSort, setActiveSort] = useState<BrowseSort>('popular');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loadedPage, setLoadedPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  const { data, isLoading, isRefetching, refetch } = useBrowseCatalog({
    page: 1,
    genre: activeGenre,
    sort: activeSort,
  });

  // Sync the React Query first-page result into local state for merging
  // with subsequent "load more" pages. We re-initialize whenever the query
  // params change so the list resets cleanly, matching the web app.
  const queryKey = `${activeGenre ?? 'all'}-${activeSort}`;
  const [lastKey, setLastKey] = useState(queryKey);
  if (queryKey !== lastKey) {
    setLastKey(queryKey);
    setMovies([]);
    setLoadedPage(0);
    setTotalPages(1);
    setLoadMoreError(null);
  }

  if (data && loadedPage === 0) {
    setMovies(data.movies);
    setLoadedPage(data.lastLoadedPage);
    setTotalPages(data.totalPages);
    setTotalResults(data.totalResults);
  }

  const hasMore = loadedPage < totalPages && loadedPage > 0;

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setLoadMoreError(null);
    try {
      const result = await fetchBrowseCatalog({
        page: loadedPage + 1,
        genre: activeGenre,
        sort: activeSort,
      });
      setMovies((prev) => mergeMovies(prev, result.movies));
      setLoadedPage(result.lastLoadedPage);
      setTotalPages(result.totalPages);
    } catch {
      setLoadMoreError('Could not load more. Check your connection.');
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, loadedPage, activeGenre, activeSort]);

  const handleRefresh = useCallback(() => {
    setMovies([]);
    setLoadedPage(0);
    setLoadMoreError(null);
    refetch();
  }, [refetch]);

  const showingCount = movies.length;

  return (
    <View style={styles.screen}>
      <FlatList
        data={movies}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.accentPrimary}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.headerCard}>
              <Text style={styles.eyebrow}>Library</Text>
              <Text style={styles.heading}>Browse All</Text>
              {totalResults > 0 && (
                <Text style={styles.subheading}>
                  {totalResults.toLocaleString()} titles available
                </Text>
              )}

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sortRow}
              >
                {SORT_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[styles.sortChip, activeSort === opt.value && styles.sortChipActive]}
                    onPress={() => setActiveSort(opt.value)}
                  >
                    <Text style={[styles.sortChipText, activeSort === opt.value && styles.sortChipTextActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.genreRow}
              >
                <Pressable
                  style={[styles.genreChip, !activeGenre && styles.genreChipActive]}
                  onPress={() => setActiveGenre(null)}
                >
                  {!activeGenre && <View style={styles.activeDot} />}
                  <Text style={[styles.genreChipText, !activeGenre && styles.genreChipTextActive]}>All</Text>
                </Pressable>
                {GENRES.map((genre) => (
                  <Pressable
                    key={genre}
                    style={[styles.genreChip, activeGenre === genre && styles.genreChipActive]}
                    onPress={() => setActiveGenre(genre)}
                  >
                    {activeGenre === genre && <View style={styles.activeDot} />}
                    <Text style={[styles.genreChipText, activeGenre === genre && styles.genreChipTextActive]}>
                      {genre}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {isLoading ? (
              <View style={styles.centered}>
                <ActivityIndicator color={colors.accentPrimary} size="large" />
              </View>
            ) : (
              <Text style={styles.countLabel}>
                Showing {showingCount.toLocaleString()} of {totalResults.toLocaleString()} titles
              </Text>
            )}
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            {loadingMore && <ActivityIndicator color={colors.accentPrimary} />}
            {loadMoreError && <Text style={styles.errorText}>{loadMoreError}</Text>}
            {!hasMore && movies.length > 0 && (
              <Text style={styles.endText}>You&apos;ve reached the end of the catalog.</Text>
            )}
            <View style={styles.bottomSpacer} />
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <MovieCard movie={item} width={108} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  cardWrap: {
    flexShrink: 0,
  },
  headerCard: {
    margin: spacing.lg,
    backgroundColor: colors.bgCard,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  eyebrow: {
    fontFamily: fonts.uiSemibold,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.accentCool,
    marginBottom: 4,
  },
  heading: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.textPrimary,
  },
  subheading: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  sortRow: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  sortChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgSecondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sortChipActive: {
    backgroundColor: colors.bgDark,
    borderColor: colors.bgDark,
  },
  sortChipText: {
    fontFamily: fonts.uiSemibold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  sortChipTextActive: {
    color: colors.textInverse,
  },
  genreRow: {
    gap: spacing.sm,
    paddingTop: 4,
  },
  genreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  genreChipActive: {
    backgroundColor: colors.bgDark,
    borderColor: colors.bgDark,
  },
  genreChipText: {
    fontFamily: fonts.uiSemibold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  genreChipTextActive: {
    color: colors.textInverse,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.accentWarm,
  },
  countLabel: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  centered: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.accentPrimary,
    textAlign: 'center',
  },
  endText: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.textMuted,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
