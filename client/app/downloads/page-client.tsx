"use client";

import { useAuth } from "@/components/AuthProvider";
import ProFeatureGate from "@/components/dashboard/ProFeatureGate";
import { useState, useMemo, useRef, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DownloadItem = {
  id: string;
  type: "movie" | "episode";
  title: string;
  year?: number;
  seriesTitle?: string;
  season?: number;
  episode?: number;
  quality: string;
  size: string;
  sizeBytes: number;
  date: string;
  ts: number;
  poster: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const ALL_ITEMS: DownloadItem[] = [
  { id: "m1", type: "movie", title: "Interstellar", year: 2014, quality: "1080p", size: "2.4 GB", sizeBytes: 2.4e9, date: "Jul 15, 2026", ts: Date.now() - 0, poster: "https://image.tmdb.org/t/p/w342/nrSaXF39nDfAA2k6PSSKeLmJNnD.jpg" },
  { id: "m2", type: "movie", title: "The Dark Knight", year: 2008, quality: "1080p", size: "1.8 GB", sizeBytes: 1.8e9, date: "Jul 12, 2026", ts: Date.now() - 864e5 * 3, poster: "https://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911BytUEM2qLS1R.jpg" },
  { id: "m3", type: "movie", title: "Dune: Part Two", year: 2024, quality: "4K", size: "5.1 GB", sizeBytes: 5.1e9, date: "Jul 8, 2026", ts: Date.now() - 864e5 * 7, poster: "https://image.tmdb.org/t/p/w342/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg" },
  { id: "m4", type: "movie", title: "Mad Max: Fury Road", year: 2015, quality: "4K", size: "3.8 GB", sizeBytes: 3.8e9, date: "Jun 28, 2026", ts: Date.now() - 864e5 * 17, poster: "https://image.tmdb.org/t/p/w342/hA2ple9q4TAw0v9gFiCqC1KvsDl.jpg" },
  { id: "m5", type: "movie", title: "Parasite", year: 2019, quality: "1080p", size: "1.6 GB", sizeBytes: 1.6e9, date: "Jun 22, 2026", ts: Date.now() - 864e5 * 23, poster: "https://image.tmdb.org/t/p/w342/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg" },

  { id: "e1", type: "episode", title: "Pilot", seriesTitle: "Breaking Bad", season: 1, episode: 1, year: 2008, quality: "1080p", size: "450 MB", sizeBytes: 450e6, date: "Jul 14, 2026", ts: Date.now() - 864e5 * 1, poster: "https://image.tmdb.org/t/p/w342/ggFHVNu6YYI5L9V6c/8E7xW.jpg" },
  { id: "e2", type: "episode", title: "Cat's in the Bag...", seriesTitle: "Breaking Bad", season: 1, episode: 2, quality: "1080p", size: "420 MB", sizeBytes: 420e6, date: "Jul 14, 2026", ts: Date.now() - 864e5 * 1, poster: "https://image.tmdb.org/t/p/w342/ggFHVNu6YYI5L9V6c/8E7xW.jpg" },
  { id: "e3", type: "episode", title: "...And the Bag's in the River", seriesTitle: "Breaking Bad", season: 1, episode: 3, quality: "1080p", size: "435 MB", sizeBytes: 435e6, date: "Jul 13, 2026", ts: Date.now() - 864e5 * 2, poster: "https://image.tmdb.org/t/p/w342/ggFHVNu6YYI5L9V6c/8E7xW.jpg" },
  { id: "e4", type: "episode", title: "Cancer Man", seriesTitle: "Breaking Bad", season: 1, episode: 4, quality: "1080p", size: "410 MB", sizeBytes: 410e6, date: "Jul 13, 2026", ts: Date.now() - 864e5 * 2, poster: "https://image.tmdb.org/t/p/w342/ggFHVNu6YYI5L9V6c/8E7xW.jpg" },
  { id: "e5", type: "episode", title: "Gray Matter", seriesTitle: "Breaking Bad", season: 1, episode: 5, quality: "1080p", size: "425 MB", sizeBytes: 425e6, date: "Jul 12, 2026", ts: Date.now() - 864e5 * 3, poster: "https://image.tmdb.org/t/p/w342/ggFHVNu6YYI5L9V6c/8E7xW.jpg" },
  { id: "e6", type: "episode", title: "Crazy Handful of Nothin'", seriesTitle: "Breaking Bad", season: 1, episode: 6, quality: "1080p", size: "440 MB", sizeBytes: 440e6, date: "Jul 12, 2026", ts: Date.now() - 864e5 * 3, poster: "https://image.tmdb.org/t/p/w342/ggFHVNu6YYI5L9V6c/8E7xW.jpg" },
  { id: "e7", type: "episode", title: "A No-Rough-Stuff-Type Deal", seriesTitle: "Breaking Bad", season: 1, episode: 7, quality: "1080p", size: "415 MB", sizeBytes: 415e6, date: "Jul 11, 2026", ts: Date.now() - 864e5 * 4, poster: "https://image.tmdb.org/t/p/w342/ggFHVNu6YYI5L9V6c/8E7xW.jpg" },
  { id: "e8", type: "episode", title: "The Mandalorian", seriesTitle: "The Mandalorian", season: 1, episode: 1, quality: "4K", size: "1.2 GB", sizeBytes: 1.2e9, date: "Jul 10, 2026", ts: Date.now() - 864e5 * 5, poster: "https://image.tmdb.org/t/p/w342/eU1i6eHXlzMOlEq0ku1Rzq7Y4w.jpg" },
  { id: "e9", type: "episode", title: "The Child", seriesTitle: "The Mandalorian", season: 1, episode: 2, quality: "4K", size: "1.1 GB", sizeBytes: 1.1e9, date: "Jul 10, 2026", ts: Date.now() - 864e5 * 5, poster: "https://image.tmdb.org/t/p/w342/eU1i6eHXlzMOlEq0ku1Rzq7Y4w.jpg" },
  { id: "e10", type: "episode", title: "Winter Is Coming", seriesTitle: "Game of Thrones", season: 1, episode: 1, quality: "1080p", size: "520 MB", sizeBytes: 520e6, date: "Jul 5, 2026", ts: Date.now() - 864e5 * 10, poster: "https://image.tmdb.org/t/p/w342/7WUHnWGskT0BbE3Z/8xS3s.jpg" },
  { id: "e11", type: "episode", title: "The Kingsroad", seriesTitle: "Game of Thrones", season: 1, episode: 2, quality: "1080p", size: "510 MB", sizeBytes: 510e6, date: "Jul 5, 2026", ts: Date.now() - 864e5 * 10, poster: "https://image.tmdb.org/t/p/w342/7WUHnWGskT0BbE3Z/8xS3s.jpg" },
  { id: "e12", type: "episode", title: "Lord Snow", seriesTitle: "Game of Thrones", season: 1, episode: 3, quality: "1080p", size: "505 MB", sizeBytes: 505e6, date: "Jul 4, 2026", ts: Date.now() - 864e5 * 11, poster: "https://image.tmdb.org/t/p/w342/7WUHnWGskT0BbE3Z/8xS3s.jpg" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtSize(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(0)} MB`;
  return `${(bytes / 1e3).toFixed(0)} KB`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DownloadsPageClient() {
  const { user } = useAuth();
  const effectiveTier = user?.effectiveTier ?? "FREE";
  const isPro = effectiveTier === "PRO" || effectiveTier === "TRIAL";
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"date" | "name" | "size">("date");

  return (
    <ProFeatureGate
      featureName="Offline Downloads"
      description="Download your favorite movies and series to watch offline, anytime, anywhere."
      isPro={isPro}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader />
        <StorageBar />
        <Controls search={search} onSearchChange={setSearch} sort={sort} onSortChange={setSort} />
        <DownloadContent search={search} sort={sort} />
      </div>
    </ProFeatureGate>
  );
}

// ─── Page Header ──────────────────────────────────────────────────────────────

function PageHeader() {
  const movies = ALL_ITEMS.filter((i) => i.type === "movie").length;
  const episodes = ALL_ITEMS.filter((i) => i.type === "episode").length;
  const series = new Set(ALL_ITEMS.filter((i) => i.type === "episode").map((i) => i.seriesTitle)).size;
  const totalSize = ALL_ITEMS.reduce((s, i) => s + i.sizeBytes, 0);

  return (
    <div className="mb-8">
      <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20">
        <svg className="w-3 h-3 text-[var(--accent-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent-primary)]">
          Watch Anywhere, Anytime
        </span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-[var(--font-playfair)] text-3xl md:text-4xl text-[var(--text-primary)] tracking-tight">
            Offline Downloads
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">{ALL_ITEMS.length}</span> title{ALL_ITEMS.length !== 1 && "s"}
            &nbsp;&middot;&nbsp;
            <span className="font-semibold text-[var(--text-primary)]">{movies}</span> movie{movies !== 1 && "s"}
            &nbsp;&middot;&nbsp;
            <span className="font-semibold text-[var(--text-primary)]">{episodes}</span> episode{episodes !== 1 && "s"} across {series} series
            &nbsp;&middot;&nbsp;
            <span className="font-semibold text-[var(--text-primary)]">{fmtSize(totalSize)}</span> total
          </p>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-2 text-[11px] font-semibold text-[var(--text-secondary)] transition-all hover:border-red-400/40 hover:text-red-400 hover:bg-red-500/5 active:scale-95">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
          Clear All
        </button>
      </div>
    </div>
  );
}

// ─── Real Storage Bar ─────────────────────────────────────────────────────────

function StorageBar() {
  const [quota, setQuota] = useState<{ used: number; total: number } | null>(null);

  useEffect(() => {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      navigator.storage.estimate().then((e) => {
        if (e.quota != null && e.usage != null) setQuota({ used: e.usage, total: e.quota });
      });
    }
  }, []);

  if (!quota) return null;

  const pct = Math.min(100, Math.round((quota.used / quota.total) * 100));

  return (
    <div className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-primary)]/10">
            <svg className="h-4 w-4 text-[var(--accent-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-semibold text-[var(--text-primary)]">Device Storage</span>
            <span className="ml-2 rounded bg-[var(--accent-primary)]/10 px-1.5 py-0.5 text-[9px] font-bold text-[var(--accent-primary)] uppercase tracking-wider animate-pulse">Live</span>
          </div>
        </div>
        <span className="text-[11px] font-medium text-[var(--text-muted)] tabular-nums">
          {fmtSize(quota.used)}
          <span className="text-[var(--text-muted)]/50 mx-1">/</span>
          {fmtSize(quota.total)}
        </span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[var(--bg-secondary)]">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${
            pct > 80
              ? "bg-gradient-to-r from-orange-500 to-red-500"
              : "bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-warm)]"
          }`}
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute right-0 top-0 h-full rounded-full bg-white/10"
          style={{ width: `${100 - pct}%`, left: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-[10px] text-[var(--text-muted)]">
          {pct > 80
            ? "Running low — consider removing some downloads."
            : pct > 50
              ? "Half your device storage is in use."
              : "Plenty of space remaining."}
        </p>
        <span className="text-[10px] font-bold text-[var(--text-muted)]/60">{pct}% used</span>
      </div>
    </div>
  );
}

// ─── Controls ─────────────────────────────────────────────────────────────────

function Controls({
  search, onSearchChange, sort, onSortChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  sort: "date" | "name" | "size";
  onSortChange: (v: "date" | "name" | "size") => void;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-md">
        <svg
          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search movies, series, episodes..."
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-2.5 pl-10 pr-9 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-all focus:border-[var(--accent-primary)]/50 focus:ring-1 focus:ring-[var(--accent-primary)]/20"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[var(--text-muted)]">Sort</span>
        <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-0.5">
          {(["date", "name", "size"] as const).map((s) => (
            <button
              key={s}
              onClick={() => onSortChange(s)}
              className={`rounded-md px-3 py-1.5 text-[11px] font-semibold transition-all ${
                sort === s
                  ? "bg-[var(--accent-primary)] text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {s === "date" ? "Date" : s === "name" ? "Name" : "Size"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Download Content ─────────────────────────────────────────────────────────

function DownloadContent({ search, sort }: { search: string; sort: "date" | "name" | "size" }) {
  const [activeTab, setActiveTab] = useState<"all" | "movies" | "series">("all");

  const filtered = useMemo(() => {
    let list = [...ALL_ITEMS];
    if (activeTab === "movies") list = list.filter((i) => i.type === "movie");
    if (activeTab === "series") list = list.filter((i) => i.type === "episode");
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          (i.seriesTitle && i.seriesTitle.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      if (sort === "name") return a.title.localeCompare(b.title);
      if (sort === "size") return b.sizeBytes - a.sizeBytes;
      return b.ts - a.ts;
    });
    return list;
  }, [search, sort, activeTab]);

  const movies = filtered.filter((i) => i.type === "movie");
  const episodes = filtered.filter((i) => i.type === "episode");

  const groupedSeries = useMemo(() => {
    const map = new Map<string, DownloadItem[]>();
    for (const ep of episodes) {
      const key = ep.seriesTitle!;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ep);
    }
    map.forEach((eps) => eps.sort((a, b) => (a.season! - b.season!) || (a.episode! - b.episode!)));
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [episodes]);

  const hasSearch = search.length > 0;
  const showEmpty = !filtered.length;

  return (
    <div>
      {!hasSearch && (
        <div className="mb-6 flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-1 w-fit">
          {(["all", "movies", "series"] as const).map((tab) => {
            const counts = {
              all: ALL_ITEMS.length,
              movies: ALL_ITEMS.filter((i) => i.type === "movie").length,
              series: new Set(ALL_ITEMS.filter((i) => i.type === "episode").map((i) => i.seriesTitle)).size,
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all capitalize ${
                  activeTab === tab
                    ? "bg-[var(--accent-primary)] text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {tab}
                <span className="ml-1.5 opacity-60">{counts[tab]}</span>
              </button>
            );
          })}
        </div>
      )}

      {showEmpty ? (
        <EmptyState hasSearch={hasSearch} search={search} />
      ) : (
        <div className="space-y-12">
          {movies.length > 0 && (
            <section>
              <SectionHeader title="Movies" count={movies.length} emoji="🎬" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {movies.map((item, i) => (
                  <MovieCard key={item.id} item={item} index={i} />
                ))}
              </div>
            </section>
          )}

          {groupedSeries.map(([seriesName, eps]) => (
            <SeriesSection key={seriesName} seriesName={seriesName} episodes={eps} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, count, emoji }: { title: string; count: number; emoji?: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      {emoji && <span className="text-base">{emoji}</span>}
      <h2 className="text-sm font-bold text-[var(--text-primary)] tracking-wide">{title}</h2>
      <div className="h-px flex-1 bg-gradient-to-r from-[var(--border)] to-transparent" />
      <span className="text-[11px] font-medium text-[var(--text-muted)]">{count} item{count !== 1 && "s"}</span>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ hasSearch, search }: { hasSearch: boolean; search: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-card)]/30 px-6 py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent-primary)]/10 ring-1 ring-[var(--accent-primary)]/20">
        <svg className="h-10 w-10 text-[var(--accent-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          {hasSearch ? (
            <>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </>
          ) : (
            <>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </>
          )}
        </svg>
      </div>
      <h2 className="font-[var(--font-playfair)] text-2xl text-[var(--text-primary)]">
        {hasSearch ? "No Results Found" : "No Downloads Yet"}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)] leading-relaxed">
        {hasSearch
          ? `Nothing matches "${search}". Try a different title or browse our catalog.`
          : "Download movies and episodes to watch later — no internet needed. Start exploring and tap the download icon on any title."}
      </p>
    </div>
  );
}

// ─── Series Section ───────────────────────────────────────────────────────────

function SeriesSection({ seriesName, episodes }: { seriesName: string; episodes: DownloadItem[] }) {
  const [open, setOpen] = useState(true);
  const poster = episodes[0]?.poster;
  const totalSize = episodes.reduce((s, e) => s + e.sizeBytes, 0);
  const totalDuration = episodes.length * 45;
  const seasonCount = new Set(episodes.map((e) => e.season)).size;

  const seasons = useMemo(() => {
    const map = new Map<number, DownloadItem[]>();
    for (const ep of episodes) {
      const s = ep.season ?? 1;
      if (!map.has(s)) map.set(s, []);
      map.get(s)!.push(ep);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [episodes]);

  return (
    <section>
      <button
        onClick={() => setOpen(!open)}
        className="group flex w-full items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3.5 transition-all hover:border-[var(--accent-primary)]/30 hover:shadow-sm active:scale-[0.998]"
      >
        <div className="h-16 w-11 flex-shrink-0 overflow-hidden rounded-lg shadow-sm">
          <img src={poster} alt={seriesName} className="h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="flex-1 text-left">
          <h2 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
            {seriesName}
          </h2>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[var(--text-muted)]">
            <span>{episodes.length} episode{episodes.length !== 1 && "s"}</span>
            <span className="text-[var(--text-muted)]/30">&middot;</span>
            <span>{seasonCount} season{seasonCount !== 1 && "s"}</span>
            <span className="text-[var(--text-muted)]/30">&middot;</span>
            <span>{fmtSize(totalSize)}</span>
            <span className="text-[var(--text-muted)]/30">&middot;</span>
            <span>~{totalDuration} min</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-[10px] font-medium text-[var(--text-muted)]">
            {open ? "Hide" : "Show"}
          </span>
          <svg
            className={`h-4 w-4 text-[var(--text-muted)] transition-all duration-300 ${
              open ? "rotate-180 text-[var(--accent-primary)]" : ""
            }`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-400 ease-in-out ${
          open ? "max-h-[10000px] opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-7">
          {seasons.map(([seasonNum, eps]) => (
            <div key={seasonNum}>
              <div className="mb-3 flex items-center gap-2 pl-1">
                <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.12em]">
                  Season {seasonNum}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-[var(--border)]/50 to-transparent" />
                <span className="text-[10px] text-[var(--text-muted)]/60">{eps.length} episode{eps.length !== 1 && "s"}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {eps.map((ep) => (
                  <EpisodeCard key={ep.id} item={ep} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Episode Card ─────────────────────────────────────────────────────────────

function EpisodeCard({ item }: { item: DownloadItem }) {
  const [removing, setRemoving] = useState(false);

  return (
    <div
      className={`group relative overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-card)] transition-all duration-300 hover:border-[var(--accent-primary)]/30 hover:shadow-[0_0_16px_rgba(255,106,26,0.08)] ${
        removing ? "scale-90 opacity-0" : ""
      }`}
    >
      <div className="relative aspect-video overflow-hidden bg-[var(--bg-secondary)]">
        <img
          src={item.poster}
          alt={item.title}
          className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent" />
        <div className="absolute bottom-1.5 left-1.5 flex gap-1">
          <span className="rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
            {item.quality}
          </span>
          <span className="rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold text-white/90 backdrop-blur-sm">
            {item.size}
          </span>
        </div>
        <button
          onClick={() => setRemoving(true)}
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white/60 opacity-0 backdrop-blur-sm transition-all duration-200 hover:bg-red-500/80 hover:text-white group-hover:opacity-100"
          title="Remove"
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>

      <div className="p-2.5">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="rounded bg-[var(--accent-primary)]/10 px-1.5 py-0.5 text-[9px] font-bold text-[var(--accent-primary)]">
            S{item.season}:E{item.episode}
          </span>
        </div>
        <h3 className="truncate text-xs font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-primary)]">
          {item.title}
        </h3>
        <p className="mt-1 text-[10px] text-[var(--text-muted)]">{item.date}</p>
        <button className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-md bg-[var(--accent-primary)]/10 py-1.5 text-[10px] font-bold text-[var(--accent-primary)] transition-all hover:bg-[var(--accent-primary)] hover:text-white">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Play
        </button>
      </div>
    </div>
  );
}

// ─── Movie Card ───────────────────────────────────────────────────────────────

function MovieCard({ item, index }: { item: DownloadItem; index: number }) {
  const [removing, setRemoving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), index * 60);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className={`group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] transition-all duration-500 hover:border-[var(--accent-primary)]/40 hover:shadow-[0_0_28px_rgba(255,106,26,0.15)] active:scale-[0.98] ${
        removing ? "scale-95 opacity-0" : visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={item.poster}
          alt={item.title}
          className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-[var(--bg-card)]/20 to-transparent opacity-60" />

        <div className="absolute bottom-2 left-2 flex gap-1.5">
          <span className="rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm shadow-sm">
            {item.quality}
          </span>
          <span className="rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-sm shadow-sm">
            {item.size}
          </span>
        </div>

        <button
          onClick={() => setRemoving(true)}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white/70 opacity-0 backdrop-blur-sm transition-all duration-200 hover:bg-red-500/80 hover:text-white group-hover:opacity-100"
          title="Remove"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:bg-black/30">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-primary)] shadow-lg shadow-[var(--accent-primary)]/30 transition-transform duration-300 hover:scale-110">
            <svg className="ml-0.5 h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      </div>

      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-primary)]">
          {item.title}
        </h3>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[11px] text-[var(--text-muted)]">{item.year}</span>
          <span className="text-[10px] text-[var(--text-muted)]">{item.date}</span>
        </div>
        <button className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--accent-primary)] py-2 text-xs font-bold text-white transition-all hover:brightness-110 active:scale-[0.97]">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Play Now
        </button>
      </div>
    </div>
  );
}
