"use client";

import type { Movie } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";

interface SeasonSummary {
  season_number: number;
  name: string;
  episode_count: number;
}

interface EpisodeSummary {
  episode_number: number;
  name: string;
  runtime?: number;
}

interface PlayerTvSelectorProps {
  movie: Movie;
  season: number;
  episode: number;
  disabled?: boolean;
  onChange: (season: number, episode: number) => void;
}

export default function PlayerTvSelector({
  movie,
  season,
  episode,
  disabled = false,
  onChange,
}: PlayerTvSelectorProps) {
  const [seasons, setSeasons] = useState<SeasonSummary[]>([]);
  const [episodes, setEpisodes] = useState<EpisodeSummary[]>([]);
  const [loadingSeasons, setLoadingSeasons] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [expanded, setExpanded] = useState(false);

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

  const seasonOptions = useMemo(() => {
    if (seasons.length) return seasons;
    return Array.from({ length: 8 }, (_, i) => ({
      season_number: i + 1,
      name: `Season ${i + 1}`,
      episode_count: 0,
    }));
  }, [seasons]);

  const episodeOptions = useMemo(() => {
    if (episodes.length) return episodes;
    return Array.from({ length: 12 }, (_, i) => ({
      episode_number: i + 1,
      name: `Episode ${i + 1}`,
    }));
  }, [episodes]);

  const currentEpisode = episodeOptions.find((ep) => ep.episode_number === episode);
  const canPrev = episode > 1;
  const canNext = episode < episodeOptions.length;

  function goPrev() {
    if (canPrev) onChange(season, episode - 1);
  }

  function goNext() {
    if (canNext) onChange(season, episode + 1);
  }

  return (
    <div className="rounded-xl border border-[rgba(201,106,43,0.22)] bg-[linear-gradient(180deg,#fffdf9,#f7f1e8)] p-3 shadow-[0_8px_24px_rgba(28,25,23,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="rounded-full border border-[rgba(201,106,43,0.35)] bg-[rgba(232,164,74,0.18)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9a4f1a]">
            Episodes
          </span>
          <span className="truncate text-sm font-medium text-[var(--text-primary)]">
            Season {season} · Episode {episode}
            {currentEpisode?.name ? (
              <span className="font-normal text-[var(--text-secondary)]"> — {currentEpisode.name}</span>
            ) : null}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            disabled={disabled || !canPrev}
            onClick={goPrev}
            className="rounded-full border border-[var(--border-strong)] bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] disabled:opacity-40"
          >
            ← Prev
          </button>
          <button
            type="button"
            disabled={disabled || !canNext}
            onClick={goNext}
            className="rounded-full border border-[var(--border-strong)] bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] disabled:opacity-40"
          >
            Next →
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-full border border-[var(--accent-primary)] bg-[var(--accent-primary)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#b85f26]"
          >
            {expanded ? "Close" : "Browse"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3 border-t border-[rgba(201,106,43,0.12)] pt-3">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Season
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {loadingSeasons
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton h-9 w-24 shrink-0 rounded-full" />
                  ))
                : seasonOptions.map((s) => {
                    const active = s.season_number === season;
                    return (
                      <button
                        key={s.season_number}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(s.season_number, 1)}
                        className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition ${
                          active
                            ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white shadow-[0_4px_14px_rgba(201,106,43,0.28)]"
                            : "border-[var(--border)] bg-white text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
                        }`}
                      >
                        S{s.season_number}
                        {s.episode_count > 0 ? ` · ${s.episode_count} eps` : ""}
                      </button>
                    );
                  })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Episode
            </p>
            <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4">
              {loadingEpisodes
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="skeleton h-14 rounded-lg" />
                  ))
                : episodeOptions.map((ep) => {
                    const active = ep.episode_number === episode;
                    return (
                      <button
                        key={ep.episode_number}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(season, ep.episode_number)}
                        className={`rounded-lg border px-2.5 py-2 text-left transition ${
                          active
                            ? "border-[var(--accent-primary)] bg-[rgba(232,164,74,0.14)] ring-1 ring-[rgba(201,106,43,0.25)]"
                            : "border-[var(--border)] bg-white hover:border-[var(--accent-primary)]/50 hover:bg-[rgba(232,164,74,0.06)]"
                        }`}
                      >
                        <span
                          className={`text-[10px] font-bold uppercase tracking-[0.12em] ${
                            active ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"
                          }`}
                        >
                          E{ep.episode_number}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-[var(--text-primary)]">
                          {ep.name || `Episode ${ep.episode_number}`}
                        </span>
                      </button>
                    );
                  })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
