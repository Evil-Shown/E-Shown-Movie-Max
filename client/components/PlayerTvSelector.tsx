"use client";

import type { Movie } from "@/lib/types";
import { posterUrl, stillUrl, formatDisplayYear } from "@/lib/movies";
import { useEffect, useMemo, useRef, useState } from "react";

interface SeasonSummary {
  season_number: number;
  name: string;
  episode_count: number;
}

interface EpisodeSummary {
  episode_number: number;
  name: string;
  overview?: string;
  still_path?: string | null;
  runtime?: number;
}

interface PlayerTvSelectorProps {
  movie: Movie;
  season: number;
  episode: number;
  disabled?: boolean;
  onChange: (season: number, episode: number) => void;
  onSwitchProvider?: () => void;
}

export default function PlayerTvSelector({
  movie,
  season,
  episode,
  disabled = false,
  onChange,
  onSwitchProvider,
}: PlayerTvSelectorProps) {
  const [seasons, setSeasons] = useState<SeasonSummary[]>([]);
  const [episodes, setEpisodes] = useState<EpisodeSummary[]>([]);
  const [loadingSeasons, setLoadingSeasons] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const activeEpisodeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSeasons() {
      setLoadingSeasons(true);
      try {
        const res = await fetch(`/api/tv/${movie.id}/seasons`);
        const data = (await res.json()) as { seasons: SeasonSummary[] };
        if (!cancelled) setSeasons(data.seasons ?? []);
      } catch {
        if (!cancelled) setSeasons([]);
      } finally {
        if (!cancelled) setLoadingSeasons(false);
      }
    }

    loadSeasons();
    return () => {
      cancelled = true;
    };
  }, [movie.id]);

  useEffect(() => {
    let cancelled = false;

    async function loadEpisodes() {
      setLoadingEpisodes(true);
      try {
        const res = await fetch(`/api/tv/${movie.id}/seasons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ season }),
        });
        const data = (await res.json()) as { episodes: EpisodeSummary[] };
        if (!cancelled) setEpisodes(data.episodes ?? []);
      } catch {
        if (!cancelled) setEpisodes([]);
      } finally {
        if (!cancelled) setLoadingEpisodes(false);
      }
    }

    if (season > 0) loadEpisodes();
    return () => {
      cancelled = true;
    };
  }, [movie.id, season]);

  useEffect(() => {
    activeEpisodeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [season, episode, episodes.length]);

  const seasonOptions = useMemo(() => {
    if (seasons.length) return seasons;
    return Array.from({ length: 8 }, (_, i) => ({
      season_number: i + 1,
      name: `Season ${i + 1}`,
      episode_count: 0,
    }));
  }, [seasons]);

  const episodeOptions = useMemo((): EpisodeSummary[] => {
    if (episodes.length) return [...episodes].sort((a, b) => a.episode_number - b.episode_number);
    return Array.from({ length: 10 }, (_, i) => ({
      episode_number: i + 1,
      name: `Episode ${i + 1}`,
      overview: undefined,
      still_path: null,
    }));
  }, [episodes]);

  const currentEpisode = episodeOptions.find((ep) => ep.episode_number === episode);
  const fallbackThumb = posterUrl(movie.posterPath, "w500");
  const displayYear = formatDisplayYear(movie.year);

  return (
    <aside className="flex h-full max-h-[min(40dvh,380px)] min-h-0 w-full flex-col rounded-none border-t border-[rgba(201,106,43,0.2)] bg-[linear-gradient(180deg,#fffdf9,#f6efe4)] lg:max-h-none lg:w-[380px] lg:shrink-0 lg:border-t-0 lg:border-l xl:w-[420px]">
      <div className="shrink-0 border-b border-[rgba(201,106,43,0.12)] px-3 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-primary)]">
          Now playing
        </p>
        <p className="mt-1 text-sm font-semibold leading-snug text-[var(--text-primary)]">
          S{season} · E{episode}
          {currentEpisode?.name ? ` — ${currentEpisode.name}` : ""}
        </p>
        <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
          {movie.title}
          {displayYear ? ` · ${displayYear}` : ""}
        </p>
      </div>

      <div className="shrink-0 border-b border-[rgba(201,106,43,0.1)] px-3 py-2.5">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Season
        </p>
        <div className="flex flex-wrap gap-1.5">
          {loadingSeasons
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton h-7 w-10 rounded-md" />
              ))
            : seasonOptions.map((s) => {
                const active = s.season_number === season;
                return (
                  <button
                    key={s.season_number}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(s.season_number, 1)}
                    className={`min-h-[44px] min-w-[44px] rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                      active
                        ? "bg-[var(--accent-primary)] text-white shadow-sm"
                        : "border border-[var(--border)] bg-white text-[var(--text-primary)] hover:border-[var(--accent-primary)]"
                    }`}
                  >
                    S{s.season_number}
                  </button>
                );
              })}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-3 py-2.5">
        <p className="mb-2 shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Episodes
        </p>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5 [-ms-overflow-style:none] [scrollbar-width:thin]">
          {loadingEpisodes
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-[92px] w-full rounded-lg" />
              ))
            : episodeOptions.map((ep) => {
                const active = ep.episode_number === episode;
                const thumb = stillUrl(ep.still_path, "w500") ?? fallbackThumb;

                return (
                  <button
                    key={ep.episode_number}
                    ref={active ? activeEpisodeRef : undefined}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(season, ep.episode_number)}
                    className={`flex w-full gap-3 rounded-lg border p-2.5 text-left transition ${
                      active
                        ? "border-[var(--accent-primary)] bg-[rgba(232,164,74,0.12)] ring-1 ring-[rgba(201,106,43,0.22)]"
                        : "border-[var(--border)] bg-white hover:border-[var(--accent-primary)]/45 hover:bg-[rgba(232,164,74,0.05)]"
                    }`}
                  >
                    <div className="relative aspect-video w-[128px] shrink-0 overflow-hidden rounded-md bg-[var(--bg-secondary)] sm:w-[140px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumb}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      <span
                        className={`absolute bottom-1 left-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          active ? "bg-[var(--accent-primary)] text-white" : "bg-black/70 text-white"
                        }`}
                      >
                        E{ep.episode_number}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 py-0.5">
                      <p
                        className={`line-clamp-2 text-[13px] font-semibold leading-snug ${
                          active ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"
                        }`}
                      >
                        {ep.name || `Episode ${ep.episode_number}`}
                      </p>
                      {ep.overview ? (
                        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                          {ep.overview}
                        </p>
                      ) : null}
                    </div>
                  </button>
                );
              })}
        </div>
      </div>

      {onSwitchProvider ? (
        <div className="shrink-0 border-t border-[rgba(201,106,43,0.12)] p-3">
          <button
            type="button"
            onClick={onSwitchProvider}
            className="w-full rounded-full border border-[var(--border-strong)] py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)] hover:bg-white"
          >
            Not working?
          </button>
        </div>
      ) : null}
    </aside>
  );
}
