"use client";

import ConnectionIndicator from "@/components/ConnectionIndicator";
import InstantSearch from "@/components/InstantSearch";
import ProtectedLink from "@/components/ProtectedLink";
import UserDashboard from "@/components/UserDashboard";
import { useWatchlistLibrary } from "@/components/UserLibraryProvider";
import { BRAND_NAME, BRAND_NAME_SINHALA } from "@/lib/brand";
import { useAfterHydration } from "@/lib/hooks/use-after-hydration";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./Header.module.css";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Movies", series: false },
  { href: "/browse?type=tv", label: "Series", series: true },
  { href: "/watchlist", label: "Watchlist", protected: true },
  { href: "/live-tv", label: "Live TV", protected: true },
  { href: "/anime", label: "Anime" },
];

function NavLink({
  href,
  label,
  series,
  protected: isProtected,
}: {
  href: string;
  label: string;
  series?: boolean;
  protected?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const afterHydration = useAfterHydration();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const isBrowse = pathname === "/browse";
    const isTv = searchParams.get("type") === "tv";

    if (href === "/") {
      setActive(pathname === "/");
    } else if (series) {
      setActive(isBrowse && isTv);
    } else if (href === "/browse") {
      setActive(isBrowse && !isTv);
    } else {
      setActive(pathname === href || pathname.startsWith(`${href}/`));
    }
  }, [afterHydration, href, pathname, searchParams, series]);

  const linkContent = (
    <span className={`${styles.navLink} ${afterHydration && active ? styles.navLinkActive : ""} whitespace-nowrap`}>
      {label}
    </span>
  );

  if (isProtected) {
    return (
      <ProtectedLink href={href} className="inline-block">
        {linkContent}
      </ProtectedLink>
    );
  }

  return (
    <Link
      href={href}
      className={`${styles.navLink} ${afterHydration && active ? styles.navLinkActive : ""} whitespace-nowrap`}
    >
      {label}
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard" || pathname === "/settings" || pathname === "/notifications";
  const { watchlistCount } = useWatchlistLibrary();
  const afterHydration = useAfterHydration();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    document.body.classList.toggle("dashboard-page", isDashboard);
    return () => document.body.classList.remove("dashboard-page");
  }, [isDashboard]);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY.current;

        setScrolled(currentY > 24);

        if (menuOpen) {
          setHidden(false);
        } else if (currentY < 80) {
          setHidden(false);
        } else if (delta > 6) {
          setHidden(true);
        } else if (delta < -6) {
          setHidden(false);
        }

        lastScrollY.current = currentY;
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  useEffect(() => {
    document.body.classList.toggle("header-hidden", hidden && !menuOpen);
    return () => document.body.classList.remove("header-hidden");
  }, [hidden, menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  if (isDashboard) return null;

  return (
    <>
      <header
        className={`${styles.header} ${scrolled ? styles.headerScrolled : ""} ${hidden ? styles.headerHidden : ""}`}
      >
        <div className={styles.headerGlow} aria-hidden />
        <div className={styles.headerSheen} aria-hidden />
        <div className={styles.headerGoldBar} aria-hidden />

        <div className={styles.inner}>
          <button
            type="button"
            aria-label="Toggle menu"
            className={styles.menuButton}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              {menuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>

          <nav className={styles.leftNav}>
            <ConnectionIndicator />
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                series={link.series}
                protected={link.protected}
              />
            ))}
          </nav>

          <Link href="/" className={styles.logo} aria-label={`${BRAND_NAME} home`}>
            <svg
              className={styles.logoVimana}
              width="120"
              height="32"
              viewBox="0 0 200 54"
              fill="none"
              aria-hidden="true"
            >
              <ellipse cx="100" cy="34" rx="56" ry="10" fill="rgba(201,106,43,0.12)" />
              <path d="M56 34 Q100 12 144 34" fill="rgba(201,106,43,0.08)" />
              <line x1="100" y1="12" x2="100" y2="4" strokeWidth="1" />
              <circle cx="100" cy="3" r="2.5" fill="#C96A2B" opacity="0.75" stroke="none" />
              <path d="M56 34 L20 27 L34 36 Z" fill="rgba(201,106,43,0.08)" />
              <path d="M144 34 L180 27 L166 36 Z" fill="rgba(201,106,43,0.08)" />
              <path d="M86 44 L80 53 L94 47 Z" fill="rgba(201,106,43,0.08)" />
              <path d="M114 44 L120 53 L106 47 Z" fill="rgba(201,106,43,0.08)" />
              <circle cx="100" cy="34" r="2.5" fill="rgba(201,106,43,0.55)" stroke="none" />
              <circle cx="76" cy="33" r="1.3" fill="rgba(201,106,43,0.35)" stroke="none" />
              <circle cx="124" cy="33" r="1.3" fill="rgba(201,106,43,0.35)" stroke="none" />
            </svg>
            <span className={styles.logoEyebrow}>streaming platform</span>
            <span className={styles.logoTitle}>
              CHITH<span>RA</span>
            </span>
            <span className={styles.logoSubtitle}>{BRAND_NAME_SINHALA}</span>
          </Link>

          <div className={styles.rightActions}>
            <div className="hidden xl:block">
              <InstantSearch />
            </div>

            <ProtectedLink href="/gods-eye" className={styles.tBoomButton}>
              THE GOD&apos;S EYE
            </ProtectedLink>

            <ProtectedLink href="/watchlist" aria-label="Watchlist" className={`${styles.searchButton} relative`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              {afterHydration && watchlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent-primary)] px-1 text-[9px] font-bold text-white">
                  {watchlistCount > 9 ? "9+" : watchlistCount}
                </span>
              )}
            </ProtectedLink>

            <Link href="/search" aria-label="Search" className={`${styles.searchButton} md:hidden`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </Link>

            <UserDashboard />
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className={styles.mobileLink}>
              {link.label}
            </Link>
          ))}
          <ProtectedLink href="/gods-eye" onClick={() => setMenuOpen(false)} className={styles.mobileWatch}>
            THE GOD&apos;S EYE
          </ProtectedLink>
        </div>
      )}
    </>
  );
}
