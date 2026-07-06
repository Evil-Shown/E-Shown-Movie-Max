import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

import { colors } from '@/constants/theme';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export function posterUrl(path: string, size: 'w342' | 'w500' = 'w500'): string {
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

interface PosterImageProps {
  posterPath: string;
  title: string;
  style?: object;
}

/**
 * TMDB poster image — ported from the web app's PosterImage.tsx. Falls back
 * to a muted panel showing the title's first letter (in Playfair Display)
 * when there's no poster path or the image fails to load.
 */
export default function PosterImage({ posterPath, title, style }: PosterImageProps) {
  const [failed, setFailed] = useState(false);
  const src = posterPath ? posterUrl(posterPath, 'w500') : '';

  if (failed || !src) {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.fallbackLetter}>{title.trim().charAt(0).toUpperCase() || 'M'}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: src }}
      style={[styles.image, style]}
      contentFit="cover"
      transition={200}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  fallbackLetter: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 48,
    color: colors.textMuted,
  },
});
