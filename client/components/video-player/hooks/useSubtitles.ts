import type { Movie } from "@/lib/types";
import { resolveImdbId, resolveTmdbId } from "@/lib/streaming";
import {
  fetchSubtitleText,
  parseSubtitleCues,
  proxifySubtitleUrl,
  resolveSubtitleForLanguage,
  searchSubtitleTracks,
  type SubtitleCue,
  type SubtitleTrackResult,
} from "@/lib/subtitles-client";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseSubtitlesOptions {
  movie: Movie;
  season?: number;
  episode?: number;
  isTvPlayer: boolean;
  onEpisodeSubtitleReload?: () => void;
}

export function useSubtitles({
  movie,
  season,
  episode,
  isTvPlayer,
  onEpisodeSubtitleReload,
}: UseSubtitlesOptions) {
  const [subtitleLang, setSubtitleLang] = useState("off");
  const [subtitleFile, setSubtitleFile] = useState<string | undefined>();
  const [subtitleLabel, setSubtitleLabel] = useState<string | undefined>();
  const [subtitleLoading, setSubtitleLoading] = useState(false);
  const [subtitleTranslationAvailable, setSubtitleTranslationAvailable] = useState(false);
  const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrackResult[]>([]);
  const [subtitleCues, setSubtitleCues] = useState<SubtitleCue[]>([]);
  const [playbackTime, setPlaybackTime] = useState(0);
  const subtitleLangRef = useRef(subtitleLang);

  const autoSinhalaAvailable =
    subtitleTranslationAvailable &&
    (subtitleTracks.some((track) => track.language === "en") ||
      subtitleTracks.some((track) => track.language === "si"));

  const activeSubtitleCue =
    subtitleCues.find((cue) => playbackTime >= cue.start && playbackTime <= cue.end) ?? null;

  const handleSubtitleChange = useCallback(
    async (languageCode: string) => {
      setSubtitleLoading(true);
      try {
        const existing = subtitleTracks.find((t) => t.language === languageCode);
        if (existing?.url) {
          setSubtitleLang(languageCode);
          setSubtitleFile(existing.url.startsWith("/api/") ? existing.url : proxifySubtitleUrl(existing.url));
          setSubtitleLabel(existing.label);
          return;
        }
        const resolved = await resolveSubtitleForLanguage({
          tmdbId: resolveTmdbId(movie),
          imdbId: resolveImdbId(movie),
          season,
          episode,
          language: languageCode,
        });
        setSubtitleLang(resolved.lang);
        setSubtitleFile(resolved.file);
        setSubtitleLabel(resolved.label);
      } finally {
        setSubtitleLoading(false);
      }
    },
    [episode, movie, season, subtitleTracks]
  );

  const refreshSubtitleTracks = useCallback(async () => {
    setSubtitleLoading(true);
    try {
      const search = await searchSubtitleTracks({
        tmdbId: resolveTmdbId(movie),
        imdbId: resolveImdbId(movie),
        season,
        episode,
      });
      const ranked = [...search.tracks].sort((a, b) => {
        const score = (track: SubtitleTrackResult) => {
          if (track.language === "si") return 0;
          if (track.language === "en") return 1;
          if (track.language === "ta") return 2;
          return 3;
        };
        return score(a) - score(b);
      });
      setSubtitleTracks(ranked);
      setSubtitleTranslationAvailable(search.translationAvailable);
    } finally {
      setSubtitleLoading(false);
    }
  }, [episode, movie, season]);

  useEffect(() => {
    void refreshSubtitleTracks();
  }, [refreshSubtitleTracks]);

  useEffect(() => {
    let cancelled = false;
    async function loadSubtitleCues() {
      if (!subtitleFile || subtitleLang === "off") {
        setSubtitleCues([]);
        return;
      }

      try {
        const text = await fetchSubtitleText(subtitleFile);
        if (cancelled) return;
        setSubtitleCues(parseSubtitleCues(text));
      } catch {
        if (!cancelled) setSubtitleCues([]);
      }
    }

    void loadSubtitleCues();
    return () => {
      cancelled = true;
    };
  }, [subtitleFile, subtitleLang]);

  useEffect(() => {
    setSubtitleLang("off");
    setSubtitleFile(undefined);
    setSubtitleLabel(undefined);
    setSubtitleTracks([]);
    setSubtitleTranslationAvailable(false);
    setSubtitleCues([]);
    setPlaybackTime(0);
  }, [movie.id]);

  useEffect(() => {
    subtitleLangRef.current = subtitleLang;
  }, [subtitleLang]);

  useEffect(() => {
    if (!isTvPlayer) return;
    const language = subtitleLangRef.current;
    if (language === "off") return;

    let cancelled = false;
    (async () => {
      setSubtitleLoading(true);
      try {
        const resolved = await resolveSubtitleForLanguage({
          tmdbId: resolveTmdbId(movie),
          imdbId: resolveImdbId(movie),
          season,
          episode,
          language,
        });
        if (cancelled) return;
        setSubtitleLang(resolved.lang);
        setSubtitleFile(resolved.file);
        setSubtitleLabel(resolved.label);
        onEpisodeSubtitleReload?.();
      } finally {
        if (!cancelled) setSubtitleLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [episode, isTvPlayer, movie, onEpisodeSubtitleReload, season]);

  useEffect(() => {
    if (!subtitleFile || subtitleLang === "off") return;

    const onMessage = (event: MessageEvent) => {
      const data = event.data as { currentTime?: number } | undefined;
      if (typeof data?.currentTime === "number") {
        setPlaybackTime(data.currentTime);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [subtitleFile, subtitleLang]);

  return {
    subtitleLang,
    subtitleFile,
    subtitleLabel,
    subtitleLoading,
    subtitleTracks,
    subtitleTranslationAvailable,
    autoSinhalaAvailable,
    activeSubtitleCue,
    handleSubtitleChange,
    refreshSubtitleTracks,
  };
}
