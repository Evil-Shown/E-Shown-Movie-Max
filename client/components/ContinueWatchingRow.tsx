"use client";

import PosterImage from "@/components/PosterImage";
import { usePlaybackLibrary, useUserLibraryActions } from "@/components/UserLibraryProvider";
import { prefetchMovieStream } from "@/lib/stream-prefetch";
import { useVideoPlayer } from "@/components/VideoPlayerProvider";
import { useAfterHydration } from "@/lib/hooks/use-after-hydration";

export default function ContinueWatchingRow() {
  const { continueWatching } = usePlaybackLibrary();
  const { removeContinueItem, clearContinueWatching } = useUserLibraryActions();
  const { openMovie } = useVideoPlayer();
  const afterHydration = useAfterHydration();

  if (!afterHydration || !continueWatching.length) return null;

  return (
    <section className="section-elevated py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-primary)]">
              Pick Up Where You Left Off
            </p>
            <h2 className="font-[var(--font-playfair)] text-2xl text-[var(--text-primary)]">Continue Watching</h2>
          </div>
          <button
            type="button"
            onClick={clearContinueWatching}
            className="rounded-full border border-[var(--border-strong)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
          >
            Clear history
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {continueWatching.map((item) => (
            <div key={item.id} className="group relative w-[160px] shrink-0 sm:w-[180px]">
              <button
                type="button"
                aria-label={`Remove ${item.title} from continue watching`}
                onClick={() => removeContinueItem(item.id)}
                className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-xs text-white opacity-0 transition group-hover:opacity-100"
              >
                x
              </button>
              <button
                type="button"
                onMouseEnter={() =>
                  prefetchMovieStream(
                    {
                      id: item.id,
                      mediaType: item.mediaType,
                      title: item.title,
                      tagline: "",
                      overview: "",
                      posterPath: item.posterPath,
                      backdropPath: item.posterPath,
                      rating: 0,
                      year: 0,
                      runtime: 0,
                      genres: [],
                      director: "",
                      cast: [],
                    },
                    {
                      season: item.season,
                      episode: item.episode,
                      seek: item.currentTime,
                    }
                  )
                }
                onClick={() =>
                  openMovie(
                    {
                      id: item.id,
                      mediaType: item.mediaType,
                      title: item.title,
                      tagline: "",
                      overview: "",
                      posterPath: item.posterPath,
                      backdropPath: item.posterPath,
                      rating: 0,
                      year: 0,
                      runtime: 0,
                      genres: [],
                      director: "",
                      cast: [],
                    },
                    {
                      season: item.season,
                      episode: item.episode,
                      provider: item.provider,
                      resumeSeconds: item.currentTime,
                    }
                  )
                }
                className="block w-full text-left"
              >
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl ring-1 ring-[var(--border-strong)]">
                  <PosterImage
                    posterPath={item.posterPath}
                    title={item.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition group-hover:opacity-100">
                    <span className="rounded-full bg-[var(--accent-primary)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                      {item.currentTime > 30 ? "Resume" : "Play"}
                    </span>
                  </div>
                  {item.progress > 0 && (
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-black/40">
                      <div
                        className="h-full bg-[var(--accent-warm)]"
                        style={{ width: `${Math.max(item.progress, 4)}%` }}
                      />
                    </div>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-medium text-[var(--text-primary)]">{item.title}</p>
                {item.season && item.episode ? (
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    S{item.season} E{item.episode}
                  </p>
                ) : null}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
