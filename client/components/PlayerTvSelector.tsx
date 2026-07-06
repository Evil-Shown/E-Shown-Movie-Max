"use client";

import type { Movie } from "@/lib/types";
import { useEffect, useState } from "react";

interface SeasonSummary {
  season_number: number;
  name: string;
  episode_count: number;
}

interface EpisodeSummary {
  episode_number: number;
  name: string;
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
      }
    }

    if (season > 0) loadEpisodes();
    return () => {
      cancelled = true;
    };
  }, [movie.id, season]);

  const selectClass =
    "rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs text-stone-100 outline-none focus:border-[#f4c27a] disabled:opacity-50";

  if (loadingSeasons) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-stone-400">
        Loading episodes…
      </div>
    );
  }

  if (!seasons.length) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">Season</label>
        <select
          value={season}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value), episode)}
          className={selectClass}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              Season {n}
            </option>
          ))}
        </select>
        <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">Episode</label>
        <select
          value={episode}
          disabled={disabled}
          onChange={(e) => onChange(season, Number(e.target.value))}
          className={selectClass}
        >
          {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              Episode {n}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">Season</label>
      <select
        value={season}
        disabled={disabled}
        onChange={(e) => {
          const nextSeason = Number(e.target.value);
          onChange(nextSeason, 1);
        }}
        className={selectClass}
      >
        {seasons.map((s) => (
          <option key={s.season_number} value={s.season_number}>
            {s.name || `Season ${s.season_number}`} ({s.episode_count})
          </option>
        ))}
      </select>

      <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">Episode</label>
      <select
        value={episode}
        disabled={disabled || !episodes.length}
        onChange={(e) => onChange(season, Number(e.target.value))}
        className={selectClass}
      >
        {episodes.map((ep) => (
          <option key={ep.episode_number} value={ep.episode_number}>
            E{ep.episode_number}
            {ep.name ? ` — ${ep.name}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
