"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/search", label: "Search" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`group relative px-1 py-2 text-[13px] font-medium tracking-[0.05em] underline-offset-4 ${
        active
          ? "text-[var(--text-primary)] underline decoration-[var(--accent-primary)]"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline hover:decoration-[var(--accent-primary)]"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 h-[96px] transition-all duration-300 ease-in-out sm:h-[118px] ${
          scrolled
            ? "border-b border-[var(--border)] bg-[rgba(247,244,239,0.82)] backdrop-blur-[6px] backdrop-saturate-[1.08]"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="relative mx-auto grid h-full max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6">
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>

          <button
            type="button"
            aria-label="Toggle menu"
            className="justify-self-start rounded-md p-2 text-[var(--text-primary)] md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              {menuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>

          <Link
            href="/"
            className="chithra-header-lockup justify-self-center"
            aria-label="Chithra streaming platform home"
          >
            <svg
              className="chithra-header-vimana"
              width="120"
              height="32"
              viewBox="0 0 200 54"
              fill="none"
              aria-hidden="true"
            >
              <ellipse cx="100" cy="34" rx="56" ry="10" fill="rgba(201,106,43,0.06)" />
              <path d="M56 34 Q100 12 144 34" fill="rgba(201,106,43,0.04)" />
              <line x1="100" y1="12" x2="100" y2="4" strokeWidth="1" />
              <circle cx="100" cy="3" r="2.5" fill="#C96A2B" opacity="0.65" stroke="none" />
              <path d="M56 34 L20 27 L34 36 Z" fill="rgba(201,106,43,0.04)" />
              <path d="M144 34 L180 27 L166 36 Z" fill="rgba(201,106,43,0.04)" />
              <path d="M86 44 L80 53 L94 47 Z" fill="rgba(201,106,43,0.04)" />
              <path d="M114 44 L120 53 L106 47 Z" fill="rgba(201,106,43,0.04)" />
              <circle cx="100" cy="34" r="2.5" fill="rgba(201,106,43,0.45)" stroke="none" />
              <circle cx="76" cy="33" r="1.3" fill="rgba(201,106,43,0.22)" stroke="none" />
              <circle cx="124" cy="33" r="1.3" fill="rgba(201,106,43,0.22)" stroke="none" />
            </svg>
            <span className="chithra-header-eyebrow">streaming platform</span>
            <span className="chithra-header-title">
              CHITH<span>RA</span>
            </span>
            <span className="chithra-header-subtitle">චිත්‍ර · රේඛා</span>
            <span className="chithra-header-region">Hela - Sri Lanka</span>
          </Link>

          <div className="flex items-center justify-end gap-2 justify-self-end">
            <Link
              href="/search"
              aria-label="Search"
              className="rounded-full p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </Link>

            <Link
              href="/browse"
              className="hidden rounded-full bg-[var(--bg-dark)] px-5 py-2 text-xs font-semibold text-[var(--text-inverse)] sm:inline-flex"
            >
              Watch Free
            </Link>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-[rgba(247,244,239,0.92)] backdrop-blur-[6px] backdrop-saturate-[1.08] md:hidden"
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-[var(--font-playfair)] text-2xl text-[var(--text-primary)]"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
