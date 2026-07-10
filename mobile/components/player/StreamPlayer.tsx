import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { colors, fonts, radii, spacing } from '@/constants/theme';
import {
  nextProvider,
  PROVIDER_LABELS,
  STREAM_PROVIDERS,
  type StreamProvider,
} from '@chithra/core/providers';

interface StreamPlayerProps {
  embedUrl: string | null;
  provider?: StreamProvider;
  onProviderChange?: (provider: StreamProvider) => void;
  title?: string;
}

export function StreamPlayer({
  embedUrl,
  provider = 'vidsrc',
  onProviderChange,
  title,
}: StreamPlayerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleCycleProvider = useCallback(() => {
    const next = nextProvider(provider);
    onProviderChange?.(next);
  }, [provider, onProviderChange]);

  if (!embedUrl) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No stream available</Text>
          <Text style={styles.placeholderSubtext}>
            This title doesn't have a playable stream yet.
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Stream failed to load</Text>
          <Text style={styles.placeholderSubtext}>
            Try a different provider or check your connection.
          </Text>
          <Pressable style={styles.cycleButton} onPress={handleCycleProvider}>
            <Text style={styles.cycleButtonText}>
              Switch to {PROVIDER_LABELS[nextProvider(provider)]}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.playerContainer}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.accentPrimary} />
            <Text style={styles.loadingText}>Loading {PROVIDER_LABELS[provider]}...</Text>
          </View>
        )}
        <WebView
          source={{ uri: embedUrl }}
          style={styles.webview}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          onHttpError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      </View>

      <View style={styles.controls}>
        {title && <Text style={styles.title} numberOfLines={1}>{title}</Text>}
        <Pressable style={styles.cycleButton} onPress={handleCycleProvider}>
          <Text style={styles.cycleButtonText}>
            {PROVIDER_LABELS[provider]} → {PROVIDER_LABELS[nextProvider(provider)]}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  playerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.bgDark,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgDark,
    zIndex: 1,
  },
  loadingText: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  placeholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.bgSecondary,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  placeholderText: {
    fontFamily: fonts.uiSemibold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  placeholderSubtext: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  cycleButton: {
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cycleButtonText: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: colors.accentPrimary,
  },
});
