"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useUserLibrary } from "@/components/UserLibraryProvider";
import NavIcon from "@/components/NavIcon";
import { posterUrl } from "@/lib/movies";
import { getProfileIcon } from "@/lib/storage/profile-icon";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
} from "@/lib/storage/notifications";
import type { LocalNotification } from "@/lib/storage/notifications";
import dashboardStyles from "../dashboard/Dashboard.module.css";
import styles from "./Notifications.module.css";

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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function SidebarNavLink({
  href,
  label,
  icon,
  badge,
}: {
  href: string;
  label: string;
  icon: string;
  badge?: string | number;
}) {
  return (
    <Link
      href={href}
      className={`${dashboardStyles.sidebarLink} group flex items-center gap-3 px-5 py-3 text-sm font-medium`}
    >
      <span className="transition-colors text-white/80 group-hover:text-white/80">
        <NavIcon name={icon} />
      </span>
      <span className="flex-1">{label}</span>
      {badge !== undefined && (
        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold text-[#d4a574]/60 bg-[#d4a574]/10">{badge}</span>
      )}
    </Link>
  );
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
  { href: "/dashboard?tab=activity", label: "History", icon: "history" },
  { href: "/watchlist", label: "Downloads", icon: "downloads" },
  { href: "/watchlist", label: "Favorites", icon: "favorites" },
];

const accountNav = [{ href: "/settings", label: "Settings", icon: "settings" }];

export default function NotificationsPage() {
  const { user, logout } = useAuth();
  const { watchlist } = useUserLibrary();
  const router = useRouter();

  const [notifications, setNotificationsState] = useState<LocalNotification[]>([]);
  const [profileIcon, setProfileIconState] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    setProfileIconState(getProfileIcon());
  }, []);

  useEffect(() => {
    setNotificationsState(getNotifications());
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileMenuOpen]);

  const unread = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const userName = user?.displayName || user?.username || "Watcher";

  const refresh = () => setNotificationsState(getNotifications());

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    refresh();
  };

  const handleClearAll = () => {
    clearAllNotifications();
    refresh();
    setOpenMenuId(null);
  };

  const handleNotificationClick = (id: string) => {
    markNotificationRead(id);
    refresh();
    setOpenMenuId(null);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleMenuToggle = (id: string) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const sorted = useMemo(() => [...notifications].sort((a, b) => b.timestamp - a.timestamp), [notifications]);

  return (
    <div suppressHydrationWarning className={`font-sans text-chocolate min-h-full ${styles.pageRoot}`}>
      <div className="flex min-h-full">
        {/* Desktop Sidebar */}
        <aside className={`${dashboardStyles.sidebar} fixed left-0 top-0 h-full w-64 z-40 hidden lg:flex flex-col`}>
          <div className="px-6 py-6 border-b border-[#d4a574]/15">
            <div className="flex items-center gap-3">
              <div className={`${dashboardStyles.eyeDeco} w-10 h-10 relative`} />
              <div>
                <h1 className="font-cinzel text-xl font-bold text-[#fffbf5] leading-none">CHITHIRA</h1>
              </div>
            </div>
          </div>

          <nav className={`${dashboardStyles.sidebarNav} flex-1 py-4 overflow-y-auto`}>
            <p className="px-6 mb-2 text-[10px] uppercase tracking-[0.2em] text-white/60 font-semibold">Browse</p>
            {browseNav.map((link) => (
              <SidebarNavLink key={link.href} {...link} />
            ))}

            <p className="px-6 mt-6 mb-2 text-[10px] uppercase tracking-[0.2em] text-white/60 font-semibold">Library</p>
            {libraryNav.map((link) => (
              <SidebarNavLink
                key={link.label}
                {...link}
                badge={link.label === "Watchlist" ? watchlist.length : undefined}
              />
            ))}

            <p className="px-6 mt-6 mb-2 text-[10px] uppercase tracking-[0.2em] text-white/60 font-semibold">Account</p>
            {accountNav.map((link) => (
              <SidebarNavLink key={link.href} {...link} />
            ))}
            <button
              type="button"
              className={`${dashboardStyles.sidebarLink} group flex items-center gap-3 px-5 py-3 text-sm font-medium text-left w-full border-none cursor-pointer bg-transparent`}
              onClick={handleLogout}
            >
              <span className="text-[#d4a574]/80 group-hover:text-[#e65100] transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </span>
              <span>Logout</span>
            </button>
          </nav>

          <div className="p-4 border-t border-[#d4a574]/15">
            <div
              className="w-full rounded-xl p-3 flex items-center gap-3"
              style={{
                background: "linear-gradient(135deg, rgba(212, 165, 116, 0.15) 0%, rgba(107, 68, 35, 0.25) 100%)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(212, 165, 116, 0.2)",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
            >
              {profileIcon ? (
                <img
                  src={`/avatars/${profileIcon}`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-[#d4a574]/60"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e65100] to-[#cc4d00] flex items-center justify-center font-bold text-[#fffbf5] flex-shrink-0 shadow-lg">
                  {getInitials(userName)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#fffbf5] truncate">{userName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <svg className="w-3 h-3 text-[#d4a574]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="text-[9px] text-[#d4a574] font-semibold tracking-wide">Member</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Header */}
        <div
          className={`lg:hidden fixed top-0 left-0 right-0 z-50 ${dashboardStyles.topbar} px-4 py-3 flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <span className="font-cinzel text-lg font-bold text-chocolate">Notifications</span>
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

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 z-40 bg-black/50 transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden
            />
            <nav
              className="lg:hidden fixed top-0 left-0 z-50 h-full w-[min(20rem,80vw)] overflow-y-auto bg-faint-white px-6 pb-6 pt-20 shadow-2xl"
              aria-label="Mobile navigation"
            >
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-sandy font-semibold mb-2">Browse</p>
                  <div className="space-y-1">
                    {browseNav.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-brown hover:bg-light-orange-faint"
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
                        key={link.label}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-brown hover:bg-light-orange-faint"
                      >
                        <NavIcon name={link.icon} />
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </nav>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-64 pt-[60px] lg:pt-0 flex flex-col">
          {/* Desktop Topbar */}
          <header
            className={`${dashboardStyles.topbar} sticky top-0 z-30 hidden lg:flex items-center justify-between px-8 py-4`}
          >
            <div className="flex items-center gap-2 text-xs text-sandy">
              <span>Chithira</span>
              <svg className="w-2 h-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span className="text-chocolate font-semibold">Notifications</span>
            </div>

            <div className="flex-1 max-w-md mx-6">
              <form className={`relative ${dashboardStyles.cardGlass} rounded-full`} onSubmit={handleSearchSubmit}>
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
                  type="search"
                  aria-label="Search for movies and series"
                  placeholder="Search for your next obsession..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 rounded-full pl-11 pr-4 py-2 text-sm text-chocolate placeholder-sandy focus:outline-none transition"
                />
              </form>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="w-10 h-10 rounded-full bg-faint-white border border-tan/20 flex items-center justify-center text-chocolate hover:text-deep-orange hover:border-deep-orange transition"
                aria-label="Dashboard"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              </Link>
            </div>
          </header>

          {/* Notifications Content */}
          <div className="flex-1 p-6 md:p-8">
            <div className={styles.container}>
              <div className={styles.headerRow}>
                <h1 className={styles.headerTitle}>Notifications Hub</h1>
                <div className={styles.headerActions}>
                  {unread > 0 && (
                    <button type="button" onClick={handleMarkAllRead} className={styles.btnOutline}>
                      Mark all as read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button type="button" onClick={handleClearAll} className={styles.btnFilled}>
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              <hr className={styles.divider} />

              {sorted.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg
                    className={styles.emptyIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <p className={styles.emptyTitle}>All caught up!</p>
                  <p className={styles.emptyText}>No notifications yet.</p>
                </div>
              ) : (
                <div className={styles.listWrapper}>
                  <div className="flex flex-col gap-3">
                    {sorted.map((n) => {
                      const isUnread = !n.read;

                      return (
                        <div
                          key={n.id}
                          className={`${styles.notificationCard} ${isUnread ? styles.notificationCardUnread : ""}`}
                        >
                          <div className={styles.posterThumb}>
                            {n.posterPath ? (
                              <img src={posterUrl(n.posterPath, "w342")} alt="" loading="lazy" />
                            ) : (
                              <div className={styles.posterFallback}>
                                <svg
                                  className="w-5 h-5"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                              </div>
                            )}
                          </div>

                          <div className={styles.content}>
                            <p className={styles.title}>{n.title}</p>
                            <p className={styles.meta}>{n.message}</p>
                            <p className={styles.timestamp}>{timeAgo(n.timestamp)}</p>
                          </div>

                          <div className={styles.rightSection}>
                            <span className={`${styles.badge} ${isUnread ? styles.badgeUnread : styles.badgeRead}`}>
                              {isUnread ? "Unread" : "Read"}
                            </span>
                            <div className="relative">
                              <button
                                type="button"
                                className={styles.actionBtn}
                                aria-label="More actions"
                                aria-expanded={openMenuId === n.id}
                                onClick={() => handleMenuToggle(n.id)}
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                  <circle cx="12" cy="5" r="2" />
                                  <circle cx="12" cy="12" r="2" />
                                  <circle cx="12" cy="19" r="2" />
                                </svg>
                              </button>
                              {openMenuId === n.id && (
                                <>
                                  <div className="fixed inset-0 z-50" onClick={() => setOpenMenuId(null)} />
                                  <div className={styles.actionMenu}>
                                    {isUnread && (
                                      <button
                                        type="button"
                                        className={styles.actionMenuItem}
                                        onClick={() => handleNotificationClick(n.id)}
                                      >
                                        <svg
                                          className="w-3.5 h-3.5"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                        >
                                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                          <circle cx="12" cy="12" r="3" />
                                        </svg>
                                        Mark as read
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      className={styles.actionMenuItem}
                                      onClick={() => {
                                        handleClearAll();
                                      }}
                                    >
                                      <svg
                                        className="w-3.5 h-3.5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                      >
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                      </svg>
                                      Remove
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

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
        </div>
      </div>
    </div>
  );
}
