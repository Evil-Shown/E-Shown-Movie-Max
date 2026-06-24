export interface TvEpisodeSummary {
  episode_number: number;
  name: string;
  overview?: string;
  still_path?: string | null;
  runtime?: number;
}

export interface TvSeasonSummary {
  season_number: number;
  name: string;
  episode_count: number;
}

export function getNextEpisodeTarget(
  seasons: TvSeasonSummary[],
  episodesBySeason: Map<number, TvEpisodeSummary[]>,
  currentSeason: number,
  currentEpisode: number
): { season: number; episode: number } | null {
  const currentList = episodesBySeason.get(currentSeason) ?? [];
  const sorted = [...currentList].sort((a, b) => a.episode_number - b.episode_number);
  const currentIndex = sorted.findIndex((ep) => ep.episode_number === currentEpisode);

  if (currentIndex >= 0 && currentIndex < sorted.length - 1) {
    return { season: currentSeason, episode: sorted[currentIndex + 1].episode_number };
  }

  const seasonNumbers = seasons.map((s) => s.season_number).sort((a, b) => a - b);
  const seasonIndex = seasonNumbers.indexOf(currentSeason);
  if (seasonIndex < 0 || seasonIndex >= seasonNumbers.length - 1) return null;

  const nextSeason = seasonNumbers[seasonIndex + 1];
  const nextList = episodesBySeason.get(nextSeason) ?? [];
  if (!nextList.length) {
    return { season: nextSeason, episode: 1 };
  }

  const first = [...nextList].sort((a, b) => a.episode_number - b.episode_number)[0];
  return { season: nextSeason, episode: first.episode_number };
}

export function getEpisodeSummary(
  episodesBySeason: Map<number, TvEpisodeSummary[]>,
  season: number,
  episode: number
): TvEpisodeSummary | null {
  const list = episodesBySeason.get(season) ?? [];
  return list.find((item) => item.episode_number === episode) ?? null;
}
