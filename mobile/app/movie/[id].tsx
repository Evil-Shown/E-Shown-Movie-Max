import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { colors, fonts, spacing } from '@/constants/theme';

/**
 * Placeholder movie detail screen — wires up the route so expo-router stops
 * warning about a missing "movie/[id]" route declared in app/_layout.tsx.
 * Full hero/cast/player UI comes later once the API client and MovieCard
 * components exist.
 */
export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Movie detail</Text>
      <Text style={styles.subtitle}>id: {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
