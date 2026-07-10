import { useCallback, useEffect, useRef, useState } from "react";
import type { StreamProvider } from "@/lib/providers";
import { STREAM_PROVIDERS } from "@/lib/providers";
import { recordProviderFailure, recordProviderLoad } from "@/lib/storage/provider-performance";
import {
  formatProviderSwitchMessage,
  getNextProvider,
  getPlaybackConfirmTimeoutMs,
  getStreamLoadTimeoutMs,
} from "@/lib/stream-optimizer";

interface UseProviderFallbackOptions {
  provider: StreamProvider;
  isTrailer: boolean;
  iframeSrc: string | null;
  playerEngaged: boolean;
  onProviderChange: (provider: StreamProvider) => void;
  setProvider: (provider: StreamProvider) => void;
  resetKey: string;
}

export function useProviderFallback({
  provider,
  isTrailer,
  iframeSrc,
  playerEngaged,
  onProviderChange,
  setProvider,
  resetKey,
}: UseProviderFallbackOptions) {
  const [loaded, setLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [autoSwitchMessage, setAutoSwitchMessage] = useState<string | null>(null);

  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playbackWatchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadStartedAtRef = useRef(Date.now());
  const failoverAttemptsRef = useRef(0);
  const playbackConfirmedRef = useRef(false);
  const playerEngagedRef = useRef(playerEngaged);

  const clearPlaybackWatchdog = useCallback(() => {
    if (playbackWatchdogRef.current) {
      clearTimeout(playbackWatchdogRef.current);
      playbackWatchdogRef.current = null;
    }
  }, []);

  const switchToNextProvider = useCallback(() => {
    if (failoverAttemptsRef.current >= STREAM_PROVIDERS.length - 1) {
      setLoadFailed(true);
      setAutoSwitchMessage(null);
      return false;
    }

    recordProviderFailure(provider);
    const next = getNextProvider(provider);
    failoverAttemptsRef.current += 1;
    setAutoSwitchMessage(formatProviderSwitchMessage(next));
    setLoaded(false);
    setLoadFailed(false);
    playbackConfirmedRef.current = false;
    onProviderChange(next);
    setProvider(next);
    return true;
  }, [onProviderChange, provider, setProvider]);

  const schedulePlaybackWatchdog = useCallback(() => {
    clearPlaybackWatchdog();
    playbackWatchdogRef.current = setTimeout(() => {
      if (playbackConfirmedRef.current || playerEngagedRef.current) return;
      switchToNextProvider();
    }, getPlaybackConfirmTimeoutMs());
  }, [clearPlaybackWatchdog, switchToNextProvider]);

  const handleProviderSwitch = useCallback(() => {
    recordProviderFailure(provider);
    switchToNextProvider();
  }, [provider, switchToNextProvider]);

  const confirmPlayback = useCallback(() => {
    playbackConfirmedRef.current = true;
    clearPlaybackWatchdog();
  }, [clearPlaybackWatchdog]);

  const handleIframeLoad = useCallback(() => {
    recordProviderLoad(provider, Date.now() - loadStartedAtRef.current);
    setLoaded(true);
    setLoadFailed(false);
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    if (!isTrailer) {
      // Embed shell is up — the video inside may still be buffering on slow links.
      schedulePlaybackWatchdog();
    }
  }, [isTrailer, provider, schedulePlaybackWatchdog]);

  useEffect(() => {
    playerEngagedRef.current = playerEngaged;
  }, [playerEngaged]);

  useEffect(() => {
    failoverAttemptsRef.current = 0;
    playbackConfirmedRef.current = false;
    setAutoSwitchMessage(null);
  }, [resetKey]);

  useEffect(() => {
    playbackConfirmedRef.current = false;
    clearPlaybackWatchdog();
  }, [provider, iframeSrc, clearPlaybackWatchdog]);

  useEffect(() => {
    if (playerEngaged) {
      playbackConfirmedRef.current = true;
      clearPlaybackWatchdog();
    }
  }, [playerEngaged, clearPlaybackWatchdog]);

  useEffect(() => {
    setLoaded(false);
    setLoadFailed(false);
    playbackConfirmedRef.current = false;
    loadStartedAtRef.current = Date.now();
    clearPlaybackWatchdog();

    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    if (!isTrailer && iframeSrc) {
      loadTimerRef.current = setTimeout(() => {
        if (!switchToNextProvider()) return;
      }, getStreamLoadTimeoutMs(provider));
    }

    return () => {
      if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
      clearPlaybackWatchdog();
    };
  }, [iframeSrc, isTrailer, provider, switchToNextProvider, clearPlaybackWatchdog]);

  return {
    loaded,
    setLoaded,
    loadFailed,
    autoSwitchMessage,
    handleProviderSwitch,
    confirmPlayback,
    handleIframeLoad,
  };
}
