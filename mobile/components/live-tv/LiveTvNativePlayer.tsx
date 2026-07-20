import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Video, { type OnVideoErrorData } from "react-native-video";
import { WebView } from "react-native-webview";

import { colors, fonts, radii, spacing } from "@/constants/theme";
import { createEmbedShouldStartLoad } from "@/lib/block-ad-nav";
import { getDirectHlsSources } from "@/lib/live-tv/sources";
import type { LiveTvChannel, LiveTvStream } from "@/lib/live-tv/types";
import { resolveLiveTvStream } from "@/lib/api/live-tv";

type PlayerStatus = "resolving" | "playing" | "error";

interface LiveTvNativePlayerProps {
  channel: LiveTvChannel;
}

export default function LiveTvNativePlayer({ channel }: LiveTvNativePlayerProps) {
  const [stream, setStream] = useState<LiveTvStream | null>(null);
  const [status, setStatus] = useState<PlayerStatus>("resolving");
  const [sourceIndex, setSourceIndex] = useState(0);
  const [useEmbedFallback, setUseEmbedFallback] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const hlsSources = useMemo(() => (stream ? getDirectHlsSources(stream) : []), [stream]);
  const activeSource = hlsSources[sourceIndex];

  const embedUrl = stream?.embedFallback ?? (stream?.type === "iframe" ? stream.url : undefined);

  const loadStream = useCallback(async () => {
    setStatus("resolving");
    setStream(null);
    setSourceIndex(0);
    setUseEmbedFallback(false);

    try {
      const response = await resolveLiveTvStream(channel.id);
      if (!response.stream) {
        setStatus("error");
        return;
      }

      if (response.stream.type === "iframe" || response.stream.type === "youtube") {
        setStream(response.stream);
        setUseEmbedFallback(true);
        setStatus("playing");
        return;
      }

      setStream(response.stream);
      setStatus("playing");
    } catch {
      setStatus("error");
    }
  }, [channel.id]);

  useEffect(() => {
    loadStream();
  }, [loadStream, retryKey]);

  const handleVideoError = useCallback(
    (_error: OnVideoErrorData) => {
      if (sourceIndex < hlsSources.length - 1) {
        setSourceIndex((index) => index + 1);
        return;
      }
      if (embedUrl) {
        setUseEmbedFallback(true);
        setStatus("playing");
        return;
      }
      setStatus("error");
    },
    [sourceIndex, hlsSources.length, embedUrl]
  );

  if (status === "resolving") {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accentPrimary} size="large" />
      </View>
    );
  }

  if (status === "error" && !embedUrl) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Couldn&apos;t connect to {channel.name}</Text>
        <Text style={styles.errorBody}>The stream may be offline or geo-blocked.</Text>
        <Pressable onPress={() => setRetryKey((key) => key + 1)} style={styles.retryButton}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (useEmbedFallback && embedUrl) {
    return (
      <WebView
        key={`${channel.id}-embed-${retryKey}`}
        source={{ uri: embedUrl }}
        style={styles.video}
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        onShouldStartLoadWithRequest={createEmbedShouldStartLoad(embedUrl)}
        onError={() => setStatus("error")}
      />
    );
  }

  if (!activeSource) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accentPrimary} />
      </View>
    );
  }

  return (
    <Video
      key={`${channel.id}-${retryKey}-${activeSource.uri}-${sourceIndex}`}
      source={activeSource}
      style={styles.video}
      resizeMode="contain"
      controls
      playInBackground={false}
      playWhenInactive={false}
      onLoad={() => setStatus("playing")}
      onError={handleVideoError}
    />
  );
}

const styles = StyleSheet.create({
  video: {
    flex: 1,
    backgroundColor: colors.black,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.black,
    padding: spacing.xl,
  },
  errorTitle: {
    fontFamily: fonts.uiSemibold,
    fontSize: 16,
    color: colors.textInverse,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  errorBody: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: "rgba(247,244,239,0.7)",
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  retryButton: {
    borderWidth: 1,
    borderColor: "rgba(247,244,239,0.35)",
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryText: {
    fontFamily: fonts.uiMedium,
    color: colors.textInverse,
    fontSize: 13,
  },
});
