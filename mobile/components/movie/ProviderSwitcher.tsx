import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useUserLibrary } from '@/components/providers/UserLibraryProvider';
import { PROVIDER_LABELS, STREAM_PROVIDERS } from '@/lib/providers';
import { colors, fonts, spacing } from '@/constants/theme';

/**
 * Stream provider selector — ported from the web app's ProviderSwitcher.tsx.
 * The web version used a native <select>; this uses the same horizontal
 * chip pattern as TvSeasonPicker for consistency.
 */
export default function ProviderSwitcher() {
  const { preferredProvider, setProvider } = useUserLibrary();

  return (
    <View>
      <Text style={styles.label}>Stream Provider</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {STREAM_PROVIDERS.map((provider) => {
          const active = provider === preferredProvider;
          return (
            <Pressable
              key={provider}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setProvider(provider)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {PROVIDER_LABELS[provider]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.uiSemibold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  row: {
    gap: spacing.sm,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgCard,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  chipActive: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  chipText: {
    fontFamily: fonts.uiSemibold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  chipTextActive: {
    color: colors.white,
  },
});
