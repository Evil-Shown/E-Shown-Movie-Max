import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import MovieCard from '@/components/movie/MovieCard';
import { useMovieSearch } from '@/lib/api/hooks';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import type { SearchMediaFilter } from '@/lib/api/types';

const PLACEHOLDERS = [
  'Search by title...',
  'Find by director...',
  'Discover by actor...',
  'Explore by genre...',
];

const MEDIA_OPTIONS: { value: SearchMediaFilter; label: string }[] = [
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'TV Series' },
  { value: 'all', label: 'All' },
];

const SEARCH_ICON_PATH = 'm21 21-4.3-4.3';
const SEARCH_CIRCLE = { cx: '11', cy: '11', r: '8' };

function mediaLabel(filter: SearchMediaFilter): string {
  if (filter === 'tv') return 'TV series';
  if (filter === 'all') return 'titles';
  return 'movies';
}

/**
 * Search screen — ported from the web app's app/search/page.tsx +
 * SearchBar.tsx + SearchResults.tsx. Debounced query triggers the API
 * hook, with a media-type filter tabs row below the input. The web
 * version used URL-based navigation (router.push) for query state; here
 * we keep everything in local component state, which is more appropriate
 * for a native tab screen.
 */
export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [committedQuery, setCommittedQuery] = useState('');
  const [mediaFilter, setMediaFilter] = useState<SearchMediaFilter>('movie');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const placeholderTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<TextInput>(null);

  const { data, isLoading } = useMovieSearch(committedQuery, 1, mediaFilter);
  const results = data?.movies ?? [];
  const totalResults = data?.totalResults ?? 0;

  // Rotate placeholder text while the input is empty and unfocused,
  // matching the web app's animated placeholder effect.
  function startPlaceholderRotation() {
    if (placeholderTimer.current) return;
    placeholderTimer.current = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 3000);
  }
  function stopPlaceholderRotation() {
    if (placeholderTimer.current) {
      clearInterval(placeholderTimer.current);
      placeholderTimer.current = null;
    }
  }

  const handleFocus = useCallback(() => {
    setFocused(true);
    stopPlaceholderRotation();
  }, []);

  const handleBlur = useCallback(() => {
    setFocused(false);
    if (!query) startPlaceholderRotation();
  }, [query]);

  const handleChangeText = useCallback((text: string) => {
    setQuery(text);
    if (!text) setCommittedQuery('');
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = query.trim();
    setCommittedQuery(trimmed);
    inputRef.current?.blur();
  }, [query]);

  const handleClear = useCallback(() => {
    setQuery('');
    setCommittedQuery('');
    inputRef.current?.focus();
  }, []);

  const heading =
    mediaFilter === 'tv' ? 'Search TV Series'
    : mediaFilter === 'all' ? 'Search Titles'
    : 'Search Movies';

  const countLabel = committedQuery
    ? `Found ${totalResults.toLocaleString()} ${mediaLabel(mediaFilter)}`
    : `Popular ${mediaLabel(mediaFilter)} — search to explore the full library`;

  return (
    <View style={styles.screen}>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <View style={styles.headerCard}>
              <Text style={styles.eyebrow}>Discover</Text>
              <Text style={styles.heading}>{heading}</Text>

              <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={query}
                  onChangeText={handleChangeText}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onSubmitEditing={handleSubmit}
                  placeholder={query ? 'Search titles, directors, actors...' : PLACEHOLDERS[placeholderIndex]}
                  placeholderTextColor={colors.textMuted}
                  returnKeyType="search"
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                {query ? (
                  <Pressable onPress={handleClear} style={styles.inputAction} accessibilityLabel="Clear search">
                    <Text style={styles.clearText}>✕</Text>
                  </Pressable>
                ) : (
                  <Pressable onPress={handleSubmit} style={styles.inputAction} accessibilityLabel="Search">
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="1.5">
                      <Circle cx={SEARCH_CIRCLE.cx} cy={SEARCH_CIRCLE.cy} r={SEARCH_CIRCLE.r} />
                      <Path d={SEARCH_ICON_PATH} strokeLinecap="round" />
                    </Svg>
                  </Pressable>
                )}
              </View>

              <View style={styles.mediaTabRow}>
                {MEDIA_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[styles.mediaTab, mediaFilter === opt.value && styles.mediaTabActive]}
                    onPress={() => setMediaFilter(opt.value)}
                  >
                    <Text style={[styles.mediaTabText, mediaFilter === opt.value && styles.mediaTabTextActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {isLoading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={colors.accentPrimary} />
              </View>
            ) : (
              <Text style={styles.countLabel}>{countLabel}</Text>
            )}

            {!isLoading && committedQuery && results.length === 0 && (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptyText}>
                  No {mediaLabel(mediaFilter)} found for &quot;{committedQuery}&quot;. Try another search.
                </Text>
              </View>
            )}
          </View>
        }
        ListFooterComponent={<View style={styles.bottomSpacer} />}
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
    marginBottom: spacing.lg,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgCard,
    paddingHorizontal: spacing.md,
  },
  inputWrapFocused: {
    borderColor: colors.accentPrimary,
  },
  input: {
    flex: 1,
    fontFamily: fonts.ui,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
  inputAction: {
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  mediaTabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  mediaTab: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mediaTabActive: {
    backgroundColor: colors.bgDark,
    borderColor: colors.bgDark,
  },
  mediaTabText: {
    fontFamily: fonts.uiSemibold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  mediaTabTextActive: {
    color: colors.textInverse,
  },
  loadingWrap: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countLabel: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
