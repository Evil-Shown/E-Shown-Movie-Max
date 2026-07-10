import { Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useUserLibrary } from '@/components/providers/UserLibraryProvider';
import { colors } from '@/constants/theme';
import type { Movie } from '@chithra/core/types';

const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

interface WatchlistButtonProps {
  movie: Movie;
}

/**
 * Heart-shaped watchlist toggle — ported from the web app's
 * WatchlistButton.tsx. Filled orange circle when active, outlined when not.
 */
export default function WatchlistButton({ movie }: WatchlistButtonProps) {
  const { isWatchlisted, toggleWatchlist } = useUserLibrary();
  const active = isWatchlisted(movie.id);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={active ? 'Remove from watchlist' : 'Add to watchlist'}
      onPress={() => toggleWatchlist(movie)}
      style={({ pressed }) => [
        styles.button,
        active ? styles.active : styles.inactive,
        pressed && styles.pressed,
      ]}
    >
      <Svg width={16} height={16} viewBox="0 0 24 24">
        <Path
          d={HEART_PATH}
          fill={active ? colors.white : 'none'}
          stroke={active ? colors.white : colors.textSecondary}
          strokeWidth={1.8}
        />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    borderColor: colors.accentPrimary,
    backgroundColor: colors.accentPrimary,
  },
  inactive: {
    borderColor: colors.borderStrong,
    backgroundColor: 'rgba(254,252,248,0.9)', // bgCard at 90% opacity
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
});
