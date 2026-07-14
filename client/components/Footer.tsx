"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BRAND_DEVELOPER, BRAND_NAME, BRAND_NAME_SINHALA, BRAND_TAGLINE } from "@/lib/brand";

const exploreLinks = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse Library" },
  { href: "/search", label: "Search Movies" },
];

const genres = ["Sci-Fi", "Drama", "Action", "Horror", "Comedy"];

export default function Footer() {
  const pathname = usePathname();
  const [desktopVersion, setDesktopVersion] = useState<string | null>(null);

  useEffect(() => {
    const version = window.chithraDesktop?.appVersion;
    if (window.chithraDesktop?.isDesktopApp && version) {
      setDesktopVersion(`Desktop v${version}`);
    }
  }, []);

  if (pathname === "/dashboard" || pathname === "/settings") return null;

  return (
    <footer className="mt-auto border-t border-[var(--border-strong)] bg-[var(--bg-secondary)]">
      <div className="mx-auto max-w-[1280px] px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <p className="font-[var(--font-playfair)] text-xl font-bold tracking-wide text-[var(--text-primary)]">
              {BRAND_NAME}
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{BRAND_NAME_SINHALA}</p>
            <p className="mt-3 max-w-xs text-[13px] italic leading-relaxed text-[var(--text-muted)]">{BRAND_TAGLINE}</p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent-cool)]">Explore</p>
            <ul className="mt-4 space-y-2">
              {exploreLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent-cool)]">Genres</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {genres.map((genre) => (
                <li key={genre}>
                  <Link
                    href={`/browse?genre=${encodeURIComponent(genre)}`}
                    className="inline-flex rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    {genre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent-cool)]">Legal</p>
            <ul className="mt-4 space-y-2 text-[13px] text-[var(--text-secondary)]">
              <li>Movie data and posters courtesy of TMDB.</li>
              <li>Trailers open from public YouTube embeds.</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--border)] pt-6 text-center text-[11px] text-[var(--text-muted)]">
          <p>
            (c) {new Date().getFullYear()} {BRAND_NAME} · Developed by {BRAND_DEVELOPER}
          </p>
          {desktopVersion ? <p className="mt-1 text-[10px] uppercase tracking-[0.18em]">{desktopVersion}</p> : null}
        </div>
      </div>
    </footer>
  );
}
