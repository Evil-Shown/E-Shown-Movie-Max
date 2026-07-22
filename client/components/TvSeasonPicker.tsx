"use client";

import type { Movie } from "@/lib/types";
import { usePlaybackLibrary, useUserLibraryActions } from "@/components/UserLibraryProvider";
import { useVideoPlayer } from "@/components/VideoPlayerProvider";
import { useEffect, useState } from "react";

interface SeasonSummary {
  season_number: number;
  name: string;
  episode_count: number;
}

interface EpisodeSummary {
  episode_number: number;
  name: string;
  overview: string;
  runtime?: number;
}

interface TvSeasonPickerProps {
  movie: Movie;
}

export default function TvSeasonPicker({ movie }: TvSeasonPickerProps) {
  const { openMovie } = useVideoPlayer();
  const { isEpisodeWatched, watchedEpisodeCount } = usePlaybackLibrary();
  const { toggleEpisodeWatched } = useUserLibraryActions();
  const [seasons, setSeasons] = useState<SeasonSummary[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<EpisodeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const tvId = movie.id.startsWith("tv-") ? movie.id.slice(3) : movie.id;

  useEffect(() => {
    let cancelled = false;
    async function loadSeasons() {
      setLoading(true);
      try {
        const res = await fetch(`/api/tv/${movie.id}/seasons`);
        const data = (await res.json()) as { seasons: SeasonSummary[] };
        if (!cancelled) {
          setSeasons(data.seasons);
          if (data.seasons[0]) setSelectedSeason(data.seasons[0].season_number);
        }
      } finally {
        if (!cancelled) setLoading(false);
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
          body: JSON.stringify({ season: selectedSeason }),
        });
        const data = (await res.json()) as { episodes: EpisodeSummary[] };
        if (!cancelled) setEpisodes(data.episodes);
      } catch {
        if (!cancelled) setEpisodes([]);
      }
    }
    if (selectedSeason) loadEpisodes();
    return () => {
      cancelled = true;
    };
  }, [movie.id, selectedSeason]);

  if (loading) {
    return <div className="skeleton h-40 rounded-xl" />;
  }

  if (!seasons.length) {
    return (
      <p className="text-sm text-[var(--text-secondary)]">
        Season data unavailable. You can still play from S1 E1 using the Play button.
      </p>
    );
  }

  const watchedCount = watchedEpisodeCount(tvId);

  return (
    <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-sm)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-[var(--font-playfair)] text-xl text-[var(--text-primary)]">Episodes</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            {watchedCount > 0 ? `${watchedCount} episode${watchedCount === 1 ? "" : "s"} watched` : "Select a season and episode"}
          </p>
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Season
          </label>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(Number(e.target.value))}
            className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-secondary)] px-3 py-2 text-sm"
          >
            {seasons.map((season) => (
              <option key={season.season_number} value={season.season_number}>
                {season.name} ({season.episode_count})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {episodes.map((ep) => {
          const watched = isEpisodeWatched(tvId, selectedSeason, ep.episode_number);
          return (
            <div
              key={ep.episode_number}
              className={`rounded-xl border p-4 transition ${
                watched
                  ? "border-[var(--accent-cool)]/40 bg-[rgba(46,107,94,0.08)]"
                  : "border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--border-strong)]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-primary)]">
                    E{ep.episode_number}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{ep.name}</h3>
                </div>
                <button
                  type="button"
                  aria-label={watched ? "Mark unwatched" : "Mark watched"}
                  onClick={() => toggleEpisodeWatched(tvId, selectedSeason, ep.episode_number)}
                  className={`text-lg ${watched ? "text-[var(--accent-cool)]" : "text-[var(--text-muted)]"}`}
                >
                  {watched ? "✓" : "○"}
                </button>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-[var(--text-secondary)]">{ep.overview}</p>
              <button
                type="button"
                onClick={() =>
                  openMovie(movie, { season: selectedSeason, episode: ep.episode_number })
                }
                className="mt-3 rounded-full bg-[var(--accent-primary)] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--on-accent)] hover:brightness-110"
              >
                ▶ Play Episode
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
