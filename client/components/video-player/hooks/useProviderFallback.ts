import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StreamProvider } from "@/lib/providers";
import { PROVIDER_LABELS } from "@/lib/providers";
import { recordProviderFailure, recordProviderLoad } from "@/lib/storage/provider-performance";
import {
  formatProviderSwitchMessage,
  getPlaybackConfirmTimeoutMs,
  getSmartProviderOrder,
  getStreamLoadTimeoutMs,
} from "@/lib/stream-optimizer";

export interface ProviderLogEntry {
  provider: string;
  status: "loading" | "success" | "error";
  reason?: string;
  timestamp: number;
}

interface UseProviderFallbackOptions {
  provider: StreamProvider;
  isTrailer: boolean;
  streamSrc: string | null;
  playerEngaged: boolean;
  tmdbId: string | null;
  onProviderChange: (provider: StreamProvider) => void;
  setProvider: (provider: StreamProvider) => void;
  resetKey: string;
}

export function useProviderFallback({
  provider,
  isTrailer,
  streamSrc,
  playerEngaged,
  tmdbId,
  onProviderChange,
  setProvider,
  resetKey,
}: UseProviderFallbackOptions) {
  const [loaded, setLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [autoSwitchMessage, setAutoSwitchMessage] = useState<string | null>(null);
  const [providerLogs, setProviderLogs] = useState<ProviderLogEntry[]>([]);

  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playbackWatchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadStartedAtRef = useRef(Date.now());
  const failoverAttemptsRef = useRef(0);
  const playbackConfirmedRef = useRef(false);
  const playerEngagedRef = useRef(playerEngaged);
  const recoverySignalRef = useRef(false);
  const currentLogIndexRef = useRef(0);

  const DEBOUNCE_ERROR_MS = 1500;

  const pushLog = useCallback(
    (status: ProviderLogEntry["status"], reason?: string) => {
      const entry: ProviderLogEntry = {
        provider: PROVIDER_LABELS[provider],
        status,
        reason,
        timestamp: Date.now(),
      };
      setProviderLogs((prev) => {
        const next = [...prev];
        if (prev.length > 0 && prev[prev.length - 1].provider === entry.provider) {
          next[next.length - 1] = entry;
        } else {
          next.push(entry);
        }
        return next;
      });
    },
    [provider]
  );

  const clearPlaybackWatchdog = useCallback(() => {
    if (playbackWatchdogRef.current) {
      clearTimeout(playbackWatchdogRef.current);
      playbackWatchdogRef.current = null;
    }
  }, []);

  const smartProviderOrder = useMemo(() => getSmartProviderOrder(tmdbId), [tmdbId]);

  const switchToNextProvider = useCallback(() => {
    if (failoverAttemptsRef.current >= smartProviderOrder.length - 1) {
      setLoadFailed(true);
      setAutoSwitchMessage(null);
      pushLog("error", "All providers exhausted");
      return false;
    }

    recordProviderFailure(provider);
    const currentIndex = smartProviderOrder.indexOf(provider);
    const next = smartProviderOrder[(currentIndex + 1) % smartProviderOrder.length];
    failoverAttemptsRef.current += 1;
    setAutoSwitchMessage(formatProviderSwitchMessage(next));
    setLoaded(false);
    setLoadFailed(false);
    playbackConfirmedRef.current = false;
    pushLog("loading");
    onProviderChange(next);
    setProvider(next);
    return true;
  }, [onProviderChange, provider, setProvider, pushLog, smartProviderOrder]);

  const schedulePlaybackWatchdog = useCallback(() => {
    clearPlaybackWatchdog();
    playbackWatchdogRef.current = setTimeout(() => {
      if (playbackConfirmedRef.current || playerEngagedRef.current) return;
      pushLog("error", "Playback never confirmed");
      switchToNextProvider();
    }, getPlaybackConfirmTimeoutMs());
  }, [clearPlaybackWatchdog, switchToNextProvider, pushLog]);

  const handleProviderSwitch = useCallback(() => {
    pushLog("error", "Manual switch");
    recordProviderFailure(provider);
    switchToNextProvider();
  }, [provider, switchToNextProvider, pushLog]);

  const confirmPlayback = useCallback(() => {
    playbackConfirmedRef.current = true;
    clearPlaybackWatchdog();
  }, [clearPlaybackWatchdog]);

  const handleIframeLoad = useCallback(() => {
    recordProviderLoad(provider, Date.now() - loadStartedAtRef.current);
    setLoaded(true);
    setLoadFailed(false);
    pushLog("success");
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    if (!isTrailer) {
      schedulePlaybackWatchdog();
    }
    recoverySignalRef.current = true;
    if (errorDebounceRef.current) {
      clearTimeout(errorDebounceRef.current);
      errorDebounceRef.current = null;
    }
  }, [isTrailer, provider, schedulePlaybackWatchdog, pushLog]);

  const handleStreamError = useCallback(
    (reason?: string) => {
      if (playbackConfirmedRef.current || playerEngagedRef.current) return;
      if (errorDebounceRef.current) clearTimeout(errorDebounceRef.current);

      recoverySignalRef.current = false;
      errorDebounceRef.current = setTimeout(() => {
        if (recoverySignalRef.current || playbackConfirmedRef.current || playerEngagedRef.current) return;
        pushLog("error", reason ?? "Stream error");
        recordProviderFailure(provider);
        switchToNextProvider();
      }, DEBOUNCE_ERROR_MS);
    },
    [provider, switchToNextProvider, pushLog]
  );

  const clearStreamError = useCallback(() => {
    recoverySignalRef.current = true;
    if (errorDebounceRef.current) {
      clearTimeout(errorDebounceRef.current);
      errorDebounceRef.current = null;
    }
  }, []);

  useEffect(() => {
    playerEngagedRef.current = playerEngaged;
  }, [playerEngaged]);

  useEffect(() => {
    failoverAttemptsRef.current = 0;
    playbackConfirmedRef.current = false;
    setAutoSwitchMessage(null);
    setProviderLogs([]);
    clearStreamError();
  }, [resetKey, clearStreamError]);

  useEffect(() => {
    playbackConfirmedRef.current = false;
    clearPlaybackWatchdog();
    clearStreamError();
  }, [provider, streamSrc, clearPlaybackWatchdog, clearStreamError]);

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
    clearStreamError();

    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    if (!isTrailer && streamSrc) {
      pushLog("loading");
      loadTimerRef.current = setTimeout(() => {
        pushLog("error", "Timeout");
        if (!switchToNextProvider()) return;
      }, getStreamLoadTimeoutMs(provider));
    }

    return () => {
      if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
      clearPlaybackWatchdog();
      clearStreamError();
    };
  }, [streamSrc, isTrailer, provider, switchToNextProvider, clearPlaybackWatchdog, clearStreamError, pushLog]);

  return {
    loaded,
    setLoaded,
    loadFailed,
    autoSwitchMessage,
    providerLogs,
    handleProviderSwitch,
    handleStreamError,
    clearStreamError,
    confirmPlayback,
    handleIframeLoad,
  };
}
