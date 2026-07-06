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

function HexLogo() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10 transition-transform duration-[600ms] ease-out group-hover:rotate-[60deg] group-hover:drop-shadow-[0_0_12px_rgba(201,168,76,0.6)]">
      <polygon
        points="24,2 43,12 43,36 24,46 5,36 5,12"
        fill="none"
        stroke="var(--gold-primary)"
        strokeWidth="1.2"
      />
      <circle cx="24" cy="24" r="6" fill="none" stroke="var(--gold-primary)" strokeWidth="1" />
      <circle cx="24" cy="24" r="2.5" fill="var(--gold-primary)" />
      <path
        d="M14 18c2-3 5-4 10-4s8 1 10 4M14 30c2 3 5 4 10 4s8-1 10-4"
        fill="none"
        stroke="var(--gold-primary)"
        strokeWidth="0.8"
        opacity="0.7"
      />
      <path
        d="M8 24h6M34 24h6"
        fill="none"
        stroke="var(--gold-primary)"
        strokeWidth="0.8"
        opacity="0.5"
      />
    </svg>
  );
}

function FilmClapper({ open }: { open: boolean }) {
  return (
    <div className="relative h-6 w-8" aria-hidden>
      <span
        className={`absolute left-0 top-0 h-2.5 w-full origin-bottom-left bg-[var(--gold-primary)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "-rotate-[28deg] -translate-y-1" : "rotate-0"
        }`}
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, rgba(32,38,54,0.92) 0, rgba(32,38,54,0.92) 3px, transparent 3px, transparent 6px)",
        }}
      />
      <span className="absolute bottom-0 left-0 h-3.5 w-full rounded-sm border border-[var(--gold-primary)] bg-[var(--bg-elevated)]" />
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      data-cursor="link"
      className={`group relative px-4 py-2 text-sm font-medium transition-colors duration-300 ${
        active ? "text-[var(--gold-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--gold-primary)]"
      }`}
    >
      {label}
      <span
        className={`absolute bottom-0 left-4 right-4 h-px origin-left bg-[var(--gold-primary)] transition-transform duration-300 ${
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
    </Link>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
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
        className={`fixed inset-x-0 top-0 z-50 h-[72px] transition-all duration-500 ${
          scrolled
            ? "glass-panel border-b border-[rgba(212,168,67,0.12)]"
            : "border-b border-transparent bg-gradient-to-b from-[rgba(23,27,36,0.82)] to-transparent"
        }`}
        style={scrolled ? { background: "rgba(32, 38, 54, 0.9)" } : undefined}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Link href="/" data-cursor="link" className="group flex shrink-0 items-center gap-3">
            <HexLogo />
            <div className="leading-tight">
              <span className="font-cinzel block text-base tracking-[0.3em] text-[var(--gold-primary)]">
                E·SHOWN
              </span>
              <span className="block text-[9px] font-medium uppercase tracking-[0.35em] text-[var(--text-secondary)]">
                Movie Max
              </span>
            </div>
          </Link>

          <nav className="hidden items-center md:flex">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/search"
              data-cursor="link"
              aria-label="Search"
              className="animate-pulse-ring rounded-full p-2 text-[var(--text-secondary)] transition hover:text-[var(--gold-primary)] active:scale-95"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </Link>

            <span className="hidden h-6 w-px bg-[var(--border-mid)] sm:block" />

            <Link
              href="/browse"
              data-cursor="link"
              className="hidden rounded-none border border-[var(--border-hot)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--gold-primary)] transition duration-200 hover:bg-[var(--gold-primary)] hover:text-black active:scale-95 sm:inline-flex"
            >
              Watch Free
            </Link>

            <button
              type="button"
              aria-label="Toggle menu"
              data-cursor="link"
              className="p-2 md:hidden active:scale-95"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <FilmClapper open={menuOpen} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-[rgba(23,27,36,0.97)] md:hidden"
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={link.href}
                  data-cursor="link"
                  onClick={() => setMenuOpen(false)}
                  className="font-cinzel text-3xl tracking-[0.2em] text-[var(--text-primary)] active:scale-95"
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
