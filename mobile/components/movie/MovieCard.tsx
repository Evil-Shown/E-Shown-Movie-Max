import { Pressable, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import PosterImage from './PosterImage';
import RatingRing from './RatingRing';
import WatchlistButton from './WatchlistButton';
import { useUserLibrary } from '@/components/providers/UserLibraryProvider';
import { useVideoPlayer } from '@/components/providers/VideoPlayerProvider';
import { colors, fonts } from '@/constants/theme';
import type { Movie } from '@/lib/tmdb-types';

const PLAY_PATH = 'M8 5v14l11-7z';

interface MovieCardProps {
  movie: Movie;
  rank?: number;
  /** Called when the "Watch" button is pressed — wire to the player once it exists. */
  onPlay?: (movie: Movie) => void;
  width?: number;
}

/**
 * Reusable poster card — ported from the web app's MovieCard.tsx /
 * MovieCard.module.css. Tapping the card navigates to the detail screen;
 * tapping the floating "Watch" button calls onPlay directly (matching the
 * web app's behavior where Watch opens the player without a page visit).
 */
export default function MovieCard({ movie, rank, onPlay, width = 132 }: MovieCardProps) {
  const router = useRouter();
  const { continueWatching } = useUserLibrary();
  const { openMovie } = useVideoPlayer();

  const handlePlay = onPlay ?? openMovie;

  const progress = continueWatching.find((item) => item.id === movie.id)?.progress ?? 0;
  const height = width * 1.5; // 2:3 poster aspect ratio
  // When ranked, the outer card gets extra width so the rank numeral has
  // room to its left WITHOUT shrinking the poster itself — previously this
  // was done with paddingLeft on the body, which fed `width: '100%'` on the
  // poster a narrower box, making ranked cards visibly smaller than
  // unranked ones in the same row of MovieRow/MovieCard usages.
  const rankGutter = rank !== undefined ? 20 : 0;

  return (
    <View style={[styles.card, { width: width + rankGutter }]}>
      {rank !== undefined && (
        <Text style={styles.rank} pointerEvents="none">
          {String(rank).padStart(2, '0')}
        </Text>
      )}

      <Pressable
        style={[styles.body, { width, marginLeft: rankGutter }]}
        onPress={() => router.push(`/movie/${movie.id}`)}
        accessibilityRole="button"
        accessibilityLabel={`View ${movie.title}`}
      >
        <View style={[styles.poster, { width, height }]}>
          <PosterImage posterPath={movie.posterPath} title={movie.title} />

          <View style={styles.watchlistSlot}>
            <WatchlistButton movie={movie} />
          </View>

          {progress > 0 && (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.max(progress, 4)}%` }]} />
            </View>
          )}

          <Pressable
            style={styles.watchBtn}
            onPress={(e) => {
              e.stopPropagation();
              handlePlay(movie);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Play ${movie.title}`}
          >
            <Svg width={12} height={12} viewBox="0 0 24 24">
              <Path d={PLAY_PATH} fill={colors.textPrimary} />
            </Svg>
            <Text style={styles.watchBtnLabel}>Watch</Text>
          </Pressable>
        </View>

        <View style={[styles.meta, { width }]}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {movie.title}
            </Text>
            {movie.mediaType === 'tv' && (
              <View style={styles.seriesBadge}>
                <Text style={styles.seriesBadgeText}>Series</Text>
              </View>
            )}
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.year}>{movie.year}</Text>
            <RatingRing rating={movie.rating} size={24} />
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexShrink: 0,
  },
  rank: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    zIndex: 1,
    fontFamily: fonts.heading,
    fontSize: 58,
    fontWeight: '400',
    letterSpacing: -1,
    color: 'rgba(28,25,23,0.06)',
  },
  body: {
    zIndex: 2,
  },
  poster: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    // shadow-sm approximation
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  watchlistSlot: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 3,
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accentWarm,
  },
  watchBtn: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -28 }, { translateY: -14 }],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bgCard,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 4,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  watchBtnLabel: {
    fontFamily: fonts.uiSemibold,
    fontSize: 11,
    color: colors.textPrimary,
  },
  meta: {
    marginTop: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontFamily: fonts.uiSemibold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  seriesBadge: {
    flexShrink: 0,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  seriesBadgeText: {
    fontFamily: fonts.uiSemibold,
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  year: {
    fontFamily: fonts.ui,
    fontSize: 11,
    color: colors.textMuted,
  },
});
