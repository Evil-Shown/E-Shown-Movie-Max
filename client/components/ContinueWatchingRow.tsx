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
    <section className="section-elevated py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-3.5 flex items-end justify-between gap-3 sm:mb-5">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-primary)] sm:text-[10px] sm:tracking-[0.18em]">
              Pick Up Where You Left Off
            </p>
            <h2 className="font-[var(--font-playfair)] text-[1.25rem] leading-tight text-[var(--text-primary)] sm:text-2xl">
              Continue Watching
            </h2>
          </div>
          <button
            type="button"
            onClick={clearContinueWatching}
            className="rounded-full border border-[var(--border-strong)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] sm:text-xs"
          >
            Clear
          </button>
        </div>

        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory sm:gap-4 sm:snap-proximity [&::-webkit-scrollbar]:hidden">
            {continueWatching.map((item) => (
              <div key={item.id} className="group relative w-[112px] shrink-0 snap-start sm:w-[180px]">
                <button
                  type="button"
                  aria-label={`Remove ${item.title} from continue watching`}
                  onClick={() => removeContinueItem(item.id)}
                  className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/65 text-[11px] text-white opacity-100 transition sm:right-2 sm:top-2 sm:h-6 sm:w-6 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  ×
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
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl ring-1 ring-[var(--border-strong)] shadow-[0_4px_14px_rgba(62,39,35,0.08)]">
                    <PosterImage
                      posterPath={item.posterPath}
                      title={item.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-100 transition sm:bg-black/25 sm:opacity-0 sm:group-hover:opacity-100">
                      <span className="rounded-full bg-[var(--accent-primary)] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-white shadow-md sm:px-3 sm:py-1.5 sm:text-[10px]">
                        {item.currentTime > 30 ? "Resume" : "Play"}
                      </span>
                    </div>
                    {item.progress > 0 && (
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-black/45">
                        <div
                          className="h-full bg-[var(--accent-warm)]"
                          style={{ width: `${Math.max(item.progress, 4)}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-[11px] font-medium leading-snug text-[var(--text-primary)] sm:text-sm">
                    {item.title}
                  </p>
                  {item.season && item.episode ? (
                    <p className="mt-0.5 text-[9px] uppercase tracking-wider text-[var(--text-muted)] sm:text-[10px]">
                      S{item.season} E{item.episode}
                    </p>
                  ) : null}
                </button>
              </div>
            ))}
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[var(--bg-card)] to-transparent sm:hidden"
          />
        </div>
      </div>
    </section>
  );
}
