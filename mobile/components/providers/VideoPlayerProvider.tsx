import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Dimensions, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import YoutubePlayer from 'react-native-youtube-iframe';

import { useUserLibrary } from './UserLibraryProvider';
import PlayerLoadingOverlay from '@/components/player/PlayerLoadingOverlay';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { PROVIDER_LABELS, STREAM_PROVIDERS, type StreamProvider } from '@/lib/providers';
import { getMovieEmbedUrl, isTvShow } from '@/lib/streaming';
import { getTrailerId } from '@/lib/trailers';
import {
  formatProviderSwitchMessage,
  getBestProvider,
  getNextProvider,
  getStreamLoadTimeoutMs,
} from '@/lib/stream-optimizer';
import { posterUrl } from '@/components/movie/PosterImage';
import type { Movie } from '@/lib/tmdb-types';

const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w780';
function backdropUrl(path: string): string {
  return `${BACKDROP_BASE}${path}`;
}

type PlayerMode = 'movie' | 'trailer';

export interface OpenMovieOptions {
  season?: number;
  episode?: number;
  provider?: StreamProvider;
  resumeSeconds?: number;
}

interface VideoPlayerContextValue {
  openMovie: (movie: Movie, options?: OpenMovieOptions) => void;
  openTrailer: (movie: Movie) => void;
  closePlayer: () => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextValue | null>(null);

export function useVideoPlayer() {
  const ctx = useContext(VideoPlayerContext);
  if (!ctx) throw new Error('useVideoPlayer must be used within VideoPlayerProvider');
  return ctx;
}

interface ActivePlayer {
  movie: Movie;
  mode: PlayerMode;
  season?: number;
  episode?: number;
  provider: StreamProvider;
  resumeSeconds?: number;
}

/**
 * Full-screen player modal — ported from the web app's VideoPlayerModal
 * (inside VideoPlayerProvider.tsx). Uses react-native-webview in place of
 * an <iframe>. Browser-only concerns from the original (Fullscreen API,
 * keyboard shortcuts, DOM preconnect warming) are dropped — there's no RN
 * equivalent and the embed's own player controls cover fullscreen/seek.
 */
function VideoPlayerModal({
  active,
  onClose,
  onModeChange,
  onProviderChange,
}: {
  active: ActivePlayer;
  onClose: () => void;
  onModeChange: (mode: PlayerMode) => void;
  onProviderChange: (provider: StreamProvider) => void;
}) {
  const { movie, mode, season, episode, provider, resumeSeconds } = active;
  const { savePlayback, setProvider } = useUserLibrary();
  const isTrailer = mode === 'trailer';
  const [loaded, setLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [autoSwitchMessage, setAutoSwitchMessage] = useState<string | null>(null);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadStartedAtRef = useRef(Date.now());
  const failoverAttemptsRef = useRef(0);

  const trailerId = movie.trailerKey ?? getTrailerId(movie.id);
  const movieEmbedUrl = isTrailer
    ? null
    : getMovieEmbedUrl(movie, provider, { season, episode, seek: resumeSeconds });
  // embedSrc only applies to the movie/episode WebView path now — the
  // trailer path renders YoutubePlayer directly off trailerId instead,
  // since loading a raw youtube.com/embed/... URL in a plain WebView
  // reliably fails with YouTube's "Error 153: Video player configuration
  // error" (a referrer-header check WebViews don't satisfy). YoutubePlayer
  // works around this by loading YouTube's iframe API through its own
  // hosted wrapper page rather than the bare embed URL.
  const embedSrc = isTrailer ? null : movieEmbedUrl;
  const hasContent = isTrailer ? Boolean(trailerId) : Boolean(embedSrc);

  const playerLabel = isTrailer ? 'Trailer' : isTvShow(movie) ? 'Now Streaming · TV' : 'Now Streaming';
  const posterImage = posterUrl(movie.posterPath, 'w342');
  const episodeLabel = season && episode ? `S${season} · E${episode}` : null;

  useEffect(() => {
    failoverAttemptsRef.current = 0;
    setAutoSwitchMessage(null);
  }, [movie.id, mode]);

  // Auto-failover: if the embed hasn't loaded within the timeout, switch
  // to the next-fastest provider and try again — same heuristic as web.
  // Only applies to movie/episode streams; the trailer path uses
  // YoutubePlayer's own onReady/onError rather than a timeout guess.
  useEffect(() => {
    setLoaded(false);
    setLoadFailed(false);
    loadStartedAtRef.current = Date.now();

    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    if (!isTrailer && embedSrc) {
      loadTimerRef.current = setTimeout(() => {
        if (failoverAttemptsRef.current >= STREAM_PROVIDERS.length - 1) {
          setLoadFailed(true);
          setAutoSwitchMessage(null);
          return;
        }
        const next = getNextProvider(provider);
        failoverAttemptsRef.current += 1;
        setAutoSwitchMessage(formatProviderSwitchMessage(next));
        onProviderChange(next);
        setProvider(next);
      }, getStreamLoadTimeoutMs());
    }

    return () => {
      if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    };
  }, [embedSrc, isTrailer, provider, onProviderChange, setProvider]);

  // Save playback progress once the embed has loaded successfully.
  useEffect(() => {
    if (!isTrailer && loaded && movieEmbedUrl) {
      setProvider(provider);
      savePlayback({
        movie,
        provider,
        season,
        episode,
        currentTime: resumeSeconds ?? 0,
        duration: (movie.runtime || 90) * 60,
      });
    }
  }, [loaded, isTrailer, movie, provider, season, episode, resumeSeconds, movieEmbedUrl, savePlayback, setProvider]);

  function handleProviderSwitch() {
    const next = getNextProvider(provider);
    onProviderChange(next);
    setProvider(next);
    setLoaded(false);
    setLoadFailed(false);
    setAutoSwitchMessage(formatProviderSwitchMessage(next));
    failoverAttemptsRef.current += 1;
  }

  return (
    <View style={styles.modalRoot}>
      <View style={styles.header}>
        <Image source={{ uri: posterImage }} style={styles.headerPoster} />
        <View style={styles.headerText}>
          <View style={styles.headerBadgeRow}>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{playerLabel}</Text>
            </View>
            {!isTrailer && (
              <View style={styles.headerSubBadge}>
                <Text style={styles.headerSubBadgeText}>{episodeLabel ?? 'HD Stream'}</Text>
              </View>
            )}
          </View>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {movie.title}
          </Text>
          <Text style={styles.headerMeta} numberOfLines={1}>
            {movie.year} · {movie.genres.slice(0, 2).join(', ')} · Rating {movie.rating.toFixed(1)}
          </Text>
        </View>
        <Pressable style={styles.closeBtn} onPress={onClose} accessibilityLabel="Close player">
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.stage}>
        {hasContent ? (
          <>
            {isTrailer ? (
              <View style={styles.youtubeWrap}>
                <YoutubePlayer
                  key={`trailer-${trailerId}`}
                  height={Dimensions.get('window').height}
                  play
                  videoId={trailerId}
                  webViewStyle={styles.webview}
                  onReady={() => {
                    setLoaded(true);
                    setLoadFailed(false);
                  }}
                  onError={() => setLoadFailed(true)}
                />
              </View>
            ) : (
              <WebView
                key={`${provider}-${embedSrc}`}
                source={{ uri: embedSrc as string }}
                style={styles.webview}
                allowsFullscreenVideo
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled
                domStorageEnabled
                onLoadEnd={() => {
                  setLoaded(true);
                  setLoadFailed(false);
                  setAutoSwitchMessage(null);
                  if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
                }}
              />
            )}
            {!loaded && (
              <PlayerLoadingOverlay
                movie={movie}
                isTrailer={isTrailer}
                provider={provider}
                episodeLabel={episodeLabel}
                resumeSeconds={resumeSeconds}
                posterImage={posterImage}
                autoSwitchMessage={autoSwitchMessage}
              />
            )}
            {loadFailed && !loaded && !isTrailer && (
              <View style={styles.failOverlay}>
                <Text style={styles.failText}>
                  Stream is taking too long or unavailable on {PROVIDER_LABELS[provider]}.
                </Text>
                <Pressable style={styles.failButton} onPress={handleProviderSwitch}>
                  <Text style={styles.failButtonText}>Try Next Provider</Text>
                </Pressable>
              </View>
            )}
            {loadFailed && !loaded && isTrailer && (
              <View style={styles.failOverlay}>
                <Text style={styles.failText}>This trailer couldn&apos;t be loaded.</Text>
                <Pressable style={styles.failButton} onPress={() => onModeChange('movie')}>
                  <Text style={styles.failButtonText}>Back to Movie</Text>
                </Pressable>
              </View>
            )}
          </>
        ) : (
          <View style={styles.unavailable}>
            <Text style={styles.unavailableTitle}>
              {isTrailer ? 'Trailer Not Available' : 'Stream Not Available'}
            </Text>
            <Text style={styles.unavailableText}>
              {isTrailer
                ? 'No trailer could be found for this title.'
                : 'This title does not have a stream source yet. Try the trailer or another title.'}
            </Text>
            {!isTrailer && (
              <Pressable style={styles.failButton} onPress={() => onModeChange('trailer')}>
                <Text style={styles.failButtonText}>Watch Trailer</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerTagline} numberOfLines={1}>
          “{movie.tagline || movie.title}”
        </Text>
        <View style={styles.footerButtons}>
          {!isTrailer && embedSrc && (
            <Pressable style={styles.footerOutlineBtn} onPress={handleProviderSwitch}>
              <Text style={styles.footerOutlineBtnText}>Not working? Switch</Text>
            </Pressable>
          )}
          <Pressable
            style={[styles.footerModeBtn, !isTrailer && styles.footerModeBtnActive]}
            onPress={() => onModeChange('movie')}
          >
            <Text style={[styles.footerModeBtnText, !isTrailer && styles.footerModeBtnTextActive]}>
              {isTvShow(movie) ? 'Episode' : 'Movie'}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.footerModeBtn, isTrailer && styles.footerModeBtnActive]}
            onPress={() => onModeChange('trailer')}
          >
            <Text style={[styles.footerModeBtnText, isTrailer && styles.footerModeBtnTextActive]}>Trailer</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/**
 * Provider — exposes openMovie/openTrailer/closePlayer to the whole app via
 * context, same shape as the web app's VideoPlayerProvider. Mount once near
 * the root, alongside UserLibraryProvider.
 */
export function VideoPlayerProvider({ children }: { children: ReactNode }) {
  const { preferredProvider, getResumeTime } = useUserLibrary();
  const [active, setActive] = useState<ActivePlayer | null>(null);

  const openMovie = useCallback(
    (movie: Movie, options?: OpenMovieOptions) => {
      const resume = options?.resumeSeconds ?? getResumeTime(movie.id);
      const provider = options?.provider ?? getBestProvider(preferredProvider);
      setActive({
        movie,
        mode: 'movie',
        season: options?.season ?? (isTvShow(movie) ? 1 : undefined),
        episode: options?.episode ?? (isTvShow(movie) ? 1 : undefined),
        provider,
        resumeSeconds: resume > 30 ? resume : undefined,
      });
    },
    [preferredProvider, getResumeTime]
  );

  const openTrailer = useCallback(
    (movie: Movie) => setActive({ movie, mode: 'trailer', provider: preferredProvider }),
    [preferredProvider]
  );
  const changeMode = useCallback((mode: PlayerMode) => {
    setActive((current) => (current ? { ...current, mode } : current));
  }, []);
  const changeProvider = useCallback((provider: StreamProvider) => {
    setActive((current) => (current ? { ...current, provider } : current));
  }, []);
  const closePlayer = useCallback(() => setActive(null), []);

  return (
    <VideoPlayerContext.Provider value={{ openMovie, openTrailer, closePlayer }}>
      {children}
      <Modal visible={Boolean(active)} animationType="fade" onRequestClose={closePlayer} statusBarTranslucent>
        {active && (
          <VideoPlayerModal
            active={active}
            onClose={closePlayer}
            onModeChange={changeMode}
            onProviderChange={changeProvider}
          />
        )}
      </Modal>
    </VideoPlayerContext.Provider>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: '#0f0d0b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: 48,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#1c1917',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201,106,43,0.18)',
  },
  headerPoster: {
    width: 32,
    height: 48,
    borderRadius: radii.sm,
  },
  headerText: {
    flex: 1,
  },
  headerBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  headerBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(232,164,74,0.42)',
    backgroundColor: 'rgba(232,164,74,0.16)',
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  headerBadgeText: {
    fontFamily: fonts.uiSemibold,
    fontSize: 9,
    letterSpacing: 1,
    color: '#f4c27a',
    textTransform: 'uppercase',
  },
  headerSubBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  headerSubBadgeText: {
    fontFamily: fonts.uiSemibold,
    fontSize: 9,
    color: '#a8a39c',
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: colors.white,
  },
  headerMeta: {
    fontFamily: fonts.uiSemibold,
    fontSize: 9,
    letterSpacing: 0.5,
    color: '#a8a39c',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: colors.white,
    fontSize: 14,
  },
  stage: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  youtubeWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  failOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    zIndex: 2,
  },
  failText: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: '#e5e1da',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  failButton: {
    backgroundColor: '#f4c27a',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  failButtonText: {
    fontFamily: fonts.uiSemibold,
    fontSize: 11,
    letterSpacing: 1,
    color: '#1c1917',
    textTransform: 'uppercase',
  },
  unavailable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  unavailableTitle: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  unavailableText: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: '#c9c4bc',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  footer: {
    backgroundColor: colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  footerTagline: {
    fontFamily: fonts.headingItalic,
    fontSize: 14,
    color: colors.textPrimary,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  footerOutlineBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  footerOutlineBtnText: {
    fontFamily: fonts.uiSemibold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.textPrimary,
    textTransform: 'uppercase',
  },
  footerModeBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  footerModeBtnActive: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  footerModeBtnText: {
    fontFamily: fonts.uiSemibold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.textPrimary,
    textTransform: 'uppercase',
  },
  footerModeBtnTextActive: {
    color: colors.white,
  },
});
