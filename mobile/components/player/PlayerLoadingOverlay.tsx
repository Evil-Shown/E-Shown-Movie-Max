import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { PROVIDER_LABELS, type StreamProvider } from '@/lib/providers';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import type { Movie } from '@/lib/tmdb-types';

const MOVIE_LOADING_MESSAGES = [
  'Connecting to Chithra Cinema…',
  'Finding your stream source…',
  'Buffering video — this can take a moment…',
  'Almost ready — your film is loading…',
];

const TRAILER_LOADING_MESSAGES = ['Loading trailer preview…', 'Opening video player…', 'Almost ready…'];

function formatResumeTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface PlayerLoadingOverlayProps {
  movie: Movie;
  isTrailer: boolean;
  provider: StreamProvider;
  episodeLabel: string | null;
  resumeSeconds?: number;
  posterImage: string;
  autoSwitchMessage?: string | null;
}

/**
 * Loading overlay shown over the WebView while the embed loads — ported
 * from VideoPlayerProvider.tsx's PlayerLoadingOverlay. The web version's
 * blurred backdrop-as-background is dropped here in favor of a simpler
 * dark scrim, since RN has no direct CSS backdrop-blur equivalent without
 * an extra native blur-view dependency.
 */
export default function PlayerLoadingOverlay({
  movie,
  isTrailer,
  provider,
  episodeLabel,
  resumeSeconds,
  posterImage,
  autoSwitchMessage,
}: PlayerLoadingOverlayProps) {
  const messages = isTrailer ? TRAILER_LOADING_MESSAGES : MOVIE_LOADING_MESSAGES;
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    setMessageIndex(0);
    const timer = setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [messages.length, isTrailer, provider, movie.id]);

  const statusLine = isTrailer
    ? 'Trailer'
    : episodeLabel
      ? `${episodeLabel} · ${PROVIDER_LABELS[provider]}`
      : `HD Stream · ${PROVIDER_LABELS[provider]}`;

  return (
    <View style={styles.overlay}>
      <Image source={{ uri: posterImage }} style={styles.poster} />

      <Text style={styles.badge}>{isTrailer ? 'PREVIEW MODE' : 'NOW LOADING'}</Text>
      <Text style={styles.title} numberOfLines={2}>
        {movie.title}
      </Text>
      <Text style={styles.meta}>
        {movie.year} · {statusLine}
      </Text>

      {resumeSeconds && resumeSeconds > 30 ? (
        <View style={styles.resumePill}>
          <Text style={styles.resumePillText}>Resuming from {formatResumeTime(resumeSeconds)}</Text>
        </View>
      ) : null}

      {autoSwitchMessage ? <Text style={styles.autoSwitch}>{autoSwitchMessage}</Text> : null}

      <ActivityIndicator color="#f4c27a" style={styles.spinner} />

      <Text style={styles.message}>{messages[messageIndex]}</Text>
      <Text style={styles.waitNote}>Please wait — do not close this window</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15,13,11,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    zIndex: 1,
  },
  poster: {
    width: 72,
    height: 108,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(232,164,74,0.35)',
  },
  badge: {
    fontFamily: fonts.uiSemibold,
    fontSize: 10,
    letterSpacing: 2.5,
    color: 'rgba(244,194,122,0.8)',
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.white,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  meta: {
    fontFamily: fonts.uiSemibold,
    fontSize: 11,
    letterSpacing: 1,
    color: '#d6d3cf',
    marginTop: spacing.sm,
    textTransform: 'uppercase',
  },
  resumePill: {
    marginTop: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(232,164,74,0.28)',
    backgroundColor: 'rgba(232,164,74,0.1)',
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  resumePillText: {
    fontFamily: fonts.uiSemibold,
    fontSize: 10,
    letterSpacing: 1,
    color: '#f4c27a',
    textTransform: 'uppercase',
  },
  autoSwitch: {
    marginTop: spacing.md,
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: '#f4c27a',
    textAlign: 'center',
  },
  spinner: {
    marginTop: spacing.xl,
  },
  message: {
    marginTop: spacing.lg,
    fontFamily: fonts.ui,
    fontSize: 13,
    color: '#d6d3cf',
    textAlign: 'center',
    maxWidth: 280,
  },
  waitNote: {
    marginTop: spacing.md,
    fontFamily: fonts.uiSemibold,
    fontSize: 9,
    letterSpacing: 1.5,
    color: '#78736c',
    textTransform: 'uppercase',
  },
});
