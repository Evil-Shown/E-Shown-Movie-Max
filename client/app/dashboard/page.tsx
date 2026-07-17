"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useUserLibrary } from "@/components/UserLibraryProvider";
import { useAuth } from "@/components/AuthProvider";
import { formatDisplayYear, posterUrl } from "@/lib/movies";
import type { ContinueWatchingItem } from "@/lib/storage/types";
import { getProfileIcon, setProfileIcon, PROFILE_ICONS } from "@/lib/storage/profile-icon";
import UpgradeBanner from "@/components/dashboard/UpgradeBanner";
import PricingModal from "@/components/dashboard/PricingModal";
import ProBadge from "@/components/dashboard/ProBadge";
import styles from "./Dashboard.module.css";

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatTimer(seconds: number) {
  if (!seconds || seconds <= 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function remainingTime(current: number, duration: number) {
  const left = Math.max(0, (duration || 0) - (current || 0));
  return formatDuration(left);
}

function formatToday() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function computeStreak(items: ContinueWatchingItem[]) {
  if (!items.length) return 0;
  const dates = new Set<number>();
  items.forEach((item) => {
    const d = new Date(item.updatedAt);
    d.setHours(0, 0, 0, 0);
    dates.add(d.getTime());
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const check = new Date(today.getTime() - i * 86400000).getTime();
    if (dates.has(check)) streak++;
    else if (i === 0) continue;
    else break;
  }
  return streak;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function timeAgo(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(timestamp).toLocaleDateString();
}

const browseNav = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/browse", label: "Movies", icon: "movies" },
  { href: "/browse?type=tv", label: "Series", icon: "series" },
  { href: "/live-tv", label: "Live TV", icon: "live" },
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
];

const libraryNav = [
  { href: "/watchlist", label: "Watchlist", icon: "watchlist" },
  { href: "/history", label: "History", icon: "history" },
  { href: "/downloads", label: "Downloads", icon: "downloads" },
  { href: "/favorites", label: "Favorites", icon: "favorites" },
];

const accountNav = [{ href: "/settings", label: "Settings", icon: "settings" }];

function NavIcon({ name }: { name: string }) {
  const className = "w-5 h-5";
  switch (name) {
    case "home":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "movies":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="7" x2="22" y2="7" />
          <line x1="2" y1="17" x2="22" y2="17" />
        </svg>
      );
    case "series":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="15" rx="2" />
          <polyline points="17 2 12 7 7 2" />
        </svg>
      );
    case "live":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 19c-3.87 0-7-3.13-7-7 0-3.87 3.13-7 7-7 3.87 0 7 3.13 7 7 0 3.87-3.13 7-7 7z" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      );
    case "dashboard":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      );
    case "watchlist":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "history":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "downloads":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );
    case "favorites":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 1-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 1-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 1 0-7.78z" />
        </svg>
      );
    case "settings":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    default:
      return null;
  }
}

function SidebarNavLink({
  href,
  label,
  icon,
  active,
  badge,
}: {
  href: string;
  label: string;
  icon: string;
  active?: boolean;
  badge?: string | number;
}) {
  return (
    <Link
      href={href}
      className={`${styles.sidebarLink} group flex items-center gap-3 px-5 py-3 text-sm font-medium ${active ? styles.sidebarLinkActive : ""}`}
    >
      <span className={`transition-colors ${active ? "text-light-orange" : "text-sandy group-hover:text-deep-orange"}`}>
        <NavIcon name={icon} />
      </span>
      <span className="flex-1">{label}</span>
      {badge !== undefined && (
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${active ? "bg-deep-orange text-white" : "text-sandy"}`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

function StatCard({
  icon,
  value,
  valueUnit,
  label,
  badge,
  progress,
}: {
  icon: React.ReactNode;
  value: string;
  valueUnit?: string;
  label: string;
  badge?: { text: string; color: "green" | "orange" | "brown" };
  progress?: number;
}) {
  const badgeColors = {
    green: "text-green-700 bg-green-100",
    orange: "text-deep-orange bg-light-orange-faint",
    brown: "text-chocolate bg-tan/30",
  };
  return (
    <div className={`${styles.statCard} rounded-xl p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`${styles.statIconBox} w-12 h-12 rounded-lg flex items-center justify-center`}>{icon}</div>
        {badge && (
          <span
            className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${badgeColors[badge.color]}`}
          >
            {badge.text}
          </span>
        )}
      </div>
      <p className="font-cinzel text-3xl font-bold text-chocolate">
        {value}
        {valueUnit && <span className="text-base text-sandy font-normal ml-1">{valueUnit}</span>}
      </p>
      <p className="text-sm text-brown mt-1">{label}</p>
      {progress !== undefined && (
        <div className="mt-3 h-1 bg-light-orange-faint rounded-full overflow-hidden">
          <div className="h-full bg-deep-orange rounded-full" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

function ResumeCard({ item }: { item: ContinueWatchingItem }) {
  const isTv = item.mediaType === "tv";
  const href = `/movie/${item.id}`;
  const pausedAt = formatTimer(item.currentTime);
  const totalDuration = formatTimer(item.duration);
  const genreLabel = (isTv ? "SERIES" : (item.genres?.[0] as string) || "MOVIE").toUpperCase();

  return (
    <Link
      href={href}
      className={`${styles.resumeCard} rounded-xl flex flex-col md:flex-row group border border-tan/30 hover:border-deep-orange transition`}
    >
      <div className="md:w-72 h-48 md:h-auto relative overflow-hidden flex-shrink-0">
        <img
          src={posterUrl(item.posterPath)}
          alt={item.title}
          className={`${styles.resumeThumb} absolute inset-0 w-full h-full object-cover`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 bg-deep-orange text-faint-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
          {genreLabel}
        </div>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <button className={`${styles.playBtn} w-14 h-14 rounded-full flex items-center justify-center text-white`}>
            <svg className="w-6 h-6 ml-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h3 className="font-cinzel text-xl font-bold text-chocolate">{item.title}</h3>
              <p className="text-xs text-sandy mt-1">
                {isTv
                  ? `Season ${item.season || 1} · Episode ${item.episode || 1}`
                  : `${item.year || ""}${item.year ? " · " : ""}${item.genres?.slice(0, 2).join("/") || "Movie"} · ${formatDuration(item.duration)}`}
                {!isTv && ` · IMDb ${(item.voteAverage || 0).toFixed(1)}`}
              </p>
            </div>
            <button className="text-sandy hover:text-deep-orange transition">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-brown mt-2 line-clamp-2">
            {item.overview ||
              `Continue where you left off. ${remainingTime(item.currentTime, item.duration)} remaining.`}
          </p>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-brown mb-1.5">
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-deep-orange" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              <span className="font-semibold">Paused at {pausedAt}</span>
            </span>
            <span>{totalDuration}</span>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${Math.min(item.progress, 100)}%` }} />
          </div>
        </div>
      </div>
    </Link>
  );
}

interface ActivityItem {
  type: "watching" | "watchlist" | "completed" | "downloaded";
  title: string;
  meta?: string;
  timestamp: number;
  posterPath?: string;
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const badgeLabel: Record<string, string> = {
    watching: "STARTED WATCHING",
    watchlist: "ADDED TO WATCHLIST",
    completed: "COMPLETED",
    downloaded: "DOWNLOADED",
  };

  const badgeStyle: Record<string, string> = {
    watching: "bg-[#fef0e6] text-[#cc4d00]",
    watchlist: "bg-[#efe6db] text-[#3e2723]",
    completed: "bg-[#f5efe8] text-[#6b4423]",
    downloaded: "bg-[#f5efe8] text-[#6b4423]",
  };

  return (
    <div className={`${styles.activityRow} flex items-center gap-4 px-5 py-4 rounded-[14px] bg-[#faf6f0]`}>
      {/* Thumbnail */}
      <div className="relative w-[88px] shrink-0">
        <div className="aspect-[16/9] rounded-[10px] overflow-hidden bg-[#e8ddd0]">
          {item.posterPath ? (
            <img
              src={posterUrl(item.posterPath, "w185")}
              alt={item.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#c4b5a5]">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="3" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
        </div>
        {/* Play overlay for watching */}
        {item.type === "watching" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-white/85 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
              <svg className="w-3 h-3 text-[#3e2723] ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Middle: metadata */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold text-[#3e2723] leading-tight truncate">{item.title}</p>
        <p className="text-[12px] text-[#a0785a] mt-1.5 truncate">
          {item.meta && <span>{item.meta} · </span>}
          {timeAgo(item.timestamp)}
        </p>
      </div>

      {/* Right: status badge */}
      <div className="shrink-0">
        <span
          className={`inline-block text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-[0.5px] ${badgeStyle[item.type] || badgeStyle.watching}`}
        >
          {badgeLabel[item.type] || "WATCHING"}
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { watchlist, continueWatching } = useUserLibrary();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [channelCount, setChannelCount] = useState<number>(0);
  const [activityFilter, setActivityFilter] = useState<"all" | "watching" | "watchlist" | "completed">("all");
  const [profileIcon, setProfileIconState] = useState<string | null>(null);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  useEffect(() => {
    setProfileIconState(getProfileIcon());
  }, []);

  useEffect(() => {
    fetch("/api/live-tv/channels")
      .then((res) => res.json())
      .then((data: { channels?: { length: number }[] }) => {
        if (data.channels) {
          setChannelCount(data.channels.length);
        }
      })
      .catch(() => {});
  }, []);

  const resumeItems = useMemo(
    () =>
      continueWatching
        .filter((item) => item.progress < 98)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 3),
    [continueWatching]
  );

  const activities = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];
    continueWatching
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 6)
      .forEach((item) => {
        const isCompleted = item.progress >= 98;
        const meta =
          item.mediaType === "tv"
            ? `S${item.season || 1} E${item.episode || 1} Â· ${isCompleted ? "Completed" : `Stopped at ${formatDuration(item.currentTime)}`}`
            : `${item.genres?.[0] || "Movie"} Â· ${isCompleted ? "Completed" : `Stopped at ${formatDuration(item.currentTime)}`}`;
        items.push({
          type: isCompleted ? "completed" : "watching",
          title: item.title,
          meta,
          timestamp: item.updatedAt,
          posterPath: item.posterPath,
        });
      });
    watchlist
      .sort((a, b) => b.addedAt - a.addedAt)
      .slice(0, 4)
      .forEach((item) => {
        items.push({
          type: "watchlist",
          title: item.title,
          meta: `${item.genres?.[0] || (item.mediaType === "tv" ? "Series" : "Movie")} · ${formatDisplayYear(item.year)}`,
          timestamp: item.addedAt,
          posterPath: item.posterPath,
        });
      });
    return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);
  }, [continueWatching, watchlist]);

  const filteredActivities = useMemo(() => {
    if (activityFilter === "all") return activities;
    return activities.filter((a) => a.type === activityFilter);
  }, [activities, activityFilter]);

  const totalSeconds = useMemo(
    () => continueWatching.reduce((acc, item) => acc + (item.currentTime || 0), 0),
    [continueWatching]
  );
  const hours = Math.floor(totalSeconds / 3600);
  const streak = useMemo(() => computeStreak(continueWatching), [continueWatching]);
  const userName = user?.displayName || user?.username || "Watcher";

  const isPro = user?.subscriptionTier === "PRO";

  const watchTimeProgress = useMemo(() => {
    if (hours <= 0) return 0;
    const goal = Math.max(10, Math.ceil(hours / 10) * 10);
    return Math.min(100, Math.round((hours / goal) * 100));
  }, [hours]);

  const savedTitlesProgress = useMemo(() => {
    if (watchlist.length <= 0) return 0;
    const goal = Math.max(10, Math.ceil(watchlist.length / 10) * 10);
    return Math.min(100, Math.round((watchlist.length / goal) * 100));
  }, [watchlist.length]);

  const handleSelectProfileIcon = (icon: string) => {
    setProfileIcon(icon);
    setProfileIconState(icon);
    setShowProfileSelector(false);
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/") return pathname === "/";
    if (href === "/browse") return pathname === "/browse" && !pathname.includes("type=tv");
    if (href === "/browse?type=tv") return pathname.includes("type=tv");
    return pathname === href;
  };

  return (
    <div suppressHydrationWarning className={`min-h-screen font-sans text-chocolate ${styles.dashboardRoot}`}>
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className={`${styles.sidebar} fixed left-0 top-0 h-full w-64 z-40 hidden lg:flex flex-col`}>
          <div className="px-6 py-6 border-b border-tan/20">
            <div className="flex items-center gap-3">
              <div
                className={`${styles.eyeDeco} w-10 h-10 rounded-lg flex items-center justify-center relative`}
                style={{
                  background:
                    "linear-gradient(135deg, var(--chocolate) 0%, color-mix(in srgb, var(--chocolate) 85%, var(--deep-orange) 15%) 100%)",
                  boxShadow: "0 2px 12px color-mix(in srgb, var(--chocolate) 25%, transparent)",
                }}
              >
                <svg
                  className="w-5 h-5 text-light-orange"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 19c-3.87 0-7-3.13-7-7 0-3.87 3.13-7 7-7 3.87 0 7 3.13 7 7 0 3.87-3.13 7-7 7z" />
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                </svg>
              </div>
              <div>
                <h1 className="font-cinzel text-xl font-bold text-chocolate leading-none">CHITHIRA</h1>
                <p className="text-[10px] tracking-[0.2em] text-deep-orange font-semibold mt-1">THE GOD&apos;S EYE</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 py-4 overflow-y-auto">
            <p className="px-6 mb-2 text-[10px] uppercase tracking-[0.2em] text-sandy font-semibold">Browse</p>
            {browseNav.map((link) => (
              <SidebarNavLink
                key={link.href}
                {...link}
                active={isActive(link.href)}
                badge={link.label === "Live TV" ? `${channelCount}+` : undefined}
              />
            ))}

            <p className="px-6 mt-6 mb-2 text-[10px] uppercase tracking-[0.2em] text-sandy font-semibold">Library</p>
            {libraryNav.map((link) => (
              <SidebarNavLink
                key={link.href}
                {...link}
                active={isActive(link.href)}
                badge={link.label === "Watchlist" ? watchlist.length : link.label === "Downloads" ? 7 : undefined}
              />
            ))}

            <p className="px-6 mt-6 mb-2 text-[10px] uppercase tracking-[0.2em] text-sandy font-semibold">Account</p>
            {accountNav.map((link) => (
              <SidebarNavLink key={link.href} {...link} active={isActive(link.href)} />
            ))}
            <button
              className={`${styles.sidebarLink} group flex items-center gap-3 px-5 py-3 text-sm font-medium text-left w-full border-none cursor-pointer bg-transparent`}
              onClick={async () => {
                await logout();
                window.location.href = "/";
              }}
            >
              <span className="text-sandy group-hover:text-deep-orange transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </span>
              <span>Logout</span>
            </button>
          </nav>

          <div className="p-4 border-t border-tan/20">
            <button
              onClick={() => setShowProfileSelector(true)}
              className="w-full rounded-xl p-3 flex items-center gap-3 text-left transition-all hover:scale-[1.02]"
              style={{
                background:
                  "linear-gradient(135deg, var(--chocolate) 0%, color-mix(in srgb, var(--chocolate) 90%, var(--deep-orange) 10%) 100%)",
                boxShadow:
                  "0 2px 12px color-mix(in srgb, var(--chocolate) 20%, transparent), inset 0 1px 0 color-mix(in srgb, var(--faint-white) 6%, transparent)",
              }}
            >
              {profileIcon ? (
                <img
                  src={`/avatars/${profileIcon}`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-light-orange/80"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-light-orange to-deep-orange flex items-center justify-center font-bold text-chocolate flex-shrink-0 shadow-lg">
                  {getInitials(userName)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-faint-white truncate">{userName}</p>
                <div className="flex items-center gap-1">
                  {isPro ? (
                    <ProBadge />
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#A0785A]/20 text-[#A0785A]">
                      Free
                    </span>
                  )}
                </div>
              </div>
              <svg
                className="w-3 h-3 text-tan/60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </aside>

        {/* Mobile Header */}
        <div
          className={`lg:hidden fixed top-0 left-0 right-0 z-50 ${styles.topbar} px-4 py-3 flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <span className="font-cinzel text-lg font-bold text-chocolate">Dashboard</span>
          </div>
          <button
            type="button"
            aria-label="Toggle menu"
            className="p-2 rounded-lg hover:bg-light-orange-faint transition"
            onClick={() => setMobileMenuOpen((o) => !o)}
          >
            <svg
              className="w-6 h-6 text-chocolate"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {mobileMenuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-faint-white pt-20 px-6 pb-6 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-sandy font-semibold mb-2">Browse</p>
                <div className="space-y-1">
                  {browseNav.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                        isActive(link.href) ? "bg-chocolate text-faint-white" : "text-brown hover:bg-light-orange-faint"
                      }`}
                    >
                      <NavIcon name={link.icon} />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-sandy font-semibold mb-2">Library</p>
                <div className="space-y-1">
                  {libraryNav.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                        isActive(link.href) ? "bg-chocolate text-faint-white" : "text-brown hover:bg-light-orange-faint"
                      }`}
                    >
                      <NavIcon name={link.icon} />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 lg:ml-64 min-h-screen pt-[60px] lg:pt-0">
          {/* Desktop Topbar */}
          <header
            className={`${styles.topbar} sticky top-0 z-30 hidden lg:flex items-center justify-between px-8 py-4`}
          >
            <div className="flex items-center gap-2 text-xs text-sandy">
              <span>Chithira</span>
              <svg className="w-2 h-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span className="text-chocolate font-semibold">Dashboard</span>
            </div>

            <div className="flex-1 max-w-md mx-6">
              <div className={`relative ${styles.cardGlass} rounded-full`}>
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sandy"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  placeholder="Search for your next obsession..."
                  className="w-full bg-transparent border-0 rounded-full pl-11 pr-4 py-2 text-sm text-chocolate placeholder-sandy focus:outline-none transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className={`relative w-10 h-10 rounded-full ${styles.cardGlass} hover:border-deep-orange flex items-center justify-center text-chocolate hover:text-deep-orange transition`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-deep-orange rounded-full" />
              </button>
              <button
                className={`w-10 h-10 rounded-full ${styles.cardGlass} hover:border-deep-orange flex items-center justify-center text-chocolate hover:text-deep-orange transition`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="6" width="18" height="12" rx="2" />
                  <path d="M21 10H3" />
                  <path d="M7 15h.01" />
                </svg>
              </button>
              <button
                onClick={() => setShowProfileSelector(true)}
                className={`w-10 h-10 rounded-full overflow-hidden ${styles.cardGlass} hover:border-deep-orange transition`}
                aria-label="Change profile icon"
              >
                {profileIcon ? (
                  <img src={`/avatars/${profileIcon}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-light-orange to-deep-orange flex items-center justify-center font-bold text-chocolate">
                    {getInitials(userName)}
                  </div>
                )}
              </button>
            </div>
          </header>

          <div className="px-6 md:px-8 py-8 max-w-7xl mx-auto">
            {/* Cinematic Greeting */}
            <section className={`mb-10 ${styles.fadeUp}`}>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-faint-white via-faint-white to-cream border border-tan/20 p-6 md:p-8 shadow-sm">
                <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-light-orange-faint/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-8 h-px bg-gradient-to-r from-deep-orange to-transparent" />
                      <svg
                        className="w-3 h-3 text-deep-orange"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-[10px] tracking-[0.3em] uppercase text-deep-orange font-semibold">
                        The God&apos;s Eye Observes
                      </span>
                    </div>
                    <h1
                      className="font-cinzel text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                      style={{ textShadow: "0 2px 20px color-mix(in srgb, var(--deep-orange) 10%, transparent)" }}
                    >
                      Welcome back,
                      <br />
                      <span className="bg-gradient-to-r from-deep-orange via-light-orange to-deep-orange bg-clip-text text-transparent">
                        {userName}
                      </span>
                    </h1>
                    <p className="text-brown mt-4 max-w-lg text-sm leading-relaxed">
                      Every story, carved in light. Pick up where you left off, or let the eye find your next obsession.
                    </p>
                    {resumeItems.length > 0 && (
                      <a
                        href={`/movie/${resumeItems[0].id}`}
                        className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full bg-gradient-to-r from-deep-orange to-chocolate text-faint-white text-sm font-semibold hover:from-chocolate hover:to-chocolate transition-all shadow-lg shadow-deep-orange/20 hover:shadow-deep-orange/30"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        Continue Watching
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <p className="text-[10px] text-sandy uppercase tracking-[0.2em] font-semibold">Today</p>
                      <p className="font-cinzel text-base md:text-lg font-semibold text-chocolate mt-1">
                        {formatToday()}
                      </p>
                    </div>
                    <div className="w-px h-14 bg-gradient-to-b from-tan/60 to-transparent" />
                    <div className="text-right">
                      <p className="text-[10px] text-sandy uppercase tracking-[0.2em] font-semibold">Streak</p>
                      <p className="font-cinzel text-xl md:text-2xl font-bold text-deep-orange mt-1">{streak}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Dashboard Stats */}
            <section className={`grid grid-cols-1 md:grid-cols-3 gap-5 mb-12 ${styles.fadeUp} ${styles.delay1}`}>
              <StatCard
                icon={
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                }
                value={`${hours}`}
                valueUnit="hrs"
                label="Watch Time"
                badge={{ text: "+12%", color: "green" }}
                progress={watchTimeProgress}
              />
              <StatCard
                icon={
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                }
                value={`${watchlist.length}`}
                valueUnit="titles"
                label="Saved Titles"
                badge={{ text: "Active", color: "orange" }}
                progress={savedTitlesProgress}
              />
              <StatCard
                icon={
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                }
                value="0"
                valueUnit="offline"
                label="Downloads"
                badge={{ text: "8.4 GB", color: "brown" }}
                progress={0}
              />
            </section>

            {/* Upgrade Banner */}
            <div className={`mb-12 ${styles.fadeUp} ${styles.delay2}`}>
              <UpgradeBanner onUpgradeClick={() => setIsPricingOpen(true)} />
            </div>

            {/* Resume Watching */}
            {resumeItems.length > 0 && (
              <section className={`mb-12 ${styles.fadeUp} ${styles.delay2}`}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className={`${styles.sectionHeading} font-cinzel text-2xl font-bold text-[#3E2723]`}>
                    Resume Watching
                  </h2>
                  <Link
                    href="/history"
                    className="text-sm font-semibold text-[#E65100] hover:text-[#3E2723] transition flex items-center gap-1"
                  >
                    View All
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </div>
                <div className="space-y-4">
                  {resumeItems.map((item) => (
                    <ResumeCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* The Archive */}
            <section className={`mb-12 ${styles.fadeUp} ${styles.delay3}`}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className={`${styles.sectionHeading} font-cinzel text-2xl font-bold text-chocolate`}>
                    The Archive
                  </h2>
                  <p className="text-xs text-sandy mt-1 ml-4">{watchlist.length} titles preserved for your viewing</p>
                </div>
              </div>
              {watchlist.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {watchlist.slice(0, 12).map((item) => (
                    <Link key={item.id} href={`/movie/${item.id}`} className={`${styles.archiveCard}`}>
                      <img src={posterUrl(item.posterPath, "w342")} alt={item.title} loading="lazy" />
                      <div className={`${styles.archiveOverlay}`}>
                        <span className={`${styles.archiveQuality}`}>4K UHD</span>
                        <h3 className={`${styles.archiveTitle} font-cinzel font-bold text-sm mt-2`}>{item.title}</h3>
                        <p className={`${styles.archiveMeta} mt-1`}>
                          {item.year || ""}
                          {item.year && item.genres?.length ? " Â· " : ""}
                          {item.genres?.slice(0, 2).join(", ") || ""}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-faint-white border border-tan/30 rounded-2xl p-8 text-center">
                  <p className="text-sm text-brown">Your archive is empty. Start adding titles to your watchlist.</p>
                </div>
              )}
            </section>

            {/* Recent Activity */}
            <section className={`mb-12 ${styles.fadeUp} ${styles.delay4}`}>
              {/* Main card container */}
              <div className={styles.activityCard}>
                {/* Left orange accent bar */}
                <div className={styles.activityCardAccent} />

                {/* Card content */}
                <div className="p-6 md:p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-cinzel text-lg font-bold text-[#3e2723] tracking-[0.5px]">RECENT ACTIVITY</h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActivityFilter("all")}
                        className={`${styles.filterPill} ${activityFilter === "all" ? styles.filterPillActive : ""}`}
                      >
                        Filter
                      </button>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActivityFilter(
                              activityFilter === "all"
                                ? "watching"
                                : activityFilter === "watching"
                                  ? "watchlist"
                                  : activityFilter === "watchlist"
                                    ? "completed"
                                    : "all"
                            )
                          }
                          className={`${styles.filterPill} ${activityFilter !== "all" ? styles.filterPillActive : ""}`}
                        >
                          Filters
                        </button>
                      </div>
                      <Link
                        href="/dashboard?tab=activity"
                        className="text-[12px] font-semibold text-[#6b4423] hover:text-[#e65100] transition-colors whitespace-nowrap"
                      >
                        View All &rarr;
                      </Link>
                    </div>
                  </div>

                  {/* Activity rows */}
                  <div className="space-y-3">
                    {filteredActivities.length > 0 ? (
                      filteredActivities.map((item, i) => <ActivityRow key={i} item={item} />)
                    ) : (
                      <div className="p-8 text-center bg-[#faf6f0] rounded-[14px]">
                        <p className="text-sm text-[#a0785a]">
                          No activity yet. Start watching to see your history here.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <footer className="mt-12 py-6 border-t border-tan/30">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-brown font-cinzel tracking-wider">CHITHIRA · EVERY STORY, CARVED IN LIGHT</p>
                <div className="flex gap-5 text-xs">
                  <a href="#" className="text-brown hover:text-deep-orange transition">
                    Help Center
                  </a>
                  <a href="#" className="text-brown hover:text-deep-orange transition">
                    Privacy
                  </a>
                  <a href="#" className="text-brown hover:text-deep-orange transition">
                    Terms
                  </a>
                  <a href="#" className="text-brown hover:text-deep-orange transition">
                    Contact
                  </a>
                </div>
              </div>
            </footer>
          </div>

          {/* Pricing Modal */}
          <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />

          {/* Profile Icon Selector Modal */}
          {showProfileSelector && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-chocolate/60 backdrop-blur-sm">
              <div className="bg-faint-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-cinzel text-xl font-bold text-chocolate">Choose Your Avatar</h3>
                    <p className="text-xs text-brown mt-1">Select a profile icon to personalize your experience</p>
                  </div>
                  <button
                    onClick={() => setShowProfileSelector(false)}
                    className="w-8 h-8 rounded-full hover:bg-light-orange-faint flex items-center justify-center text-brown transition"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                  {PROFILE_ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => handleSelectProfileIcon(icon)}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition hover:scale-105 ${
                        profileIcon === icon
                          ? "border-deep-orange ring-2 ring-deep-orange/20"
                          : "border-transparent hover:border-tan"
                      }`}
                    >
                      <img src={`/avatars/${icon}`} alt="Avatar option" className="w-full h-full object-cover" />
                      {profileIcon === icon && (
                        <div className="absolute inset-0 bg-deep-orange/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-deep-orange" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: var(--cream);
        }
        ::-webkit-scrollbar-thumb {
          background: var(--tan);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: var(--deep-orange);
        }
      `}</style>
    </div>
  );
}
