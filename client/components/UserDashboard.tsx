"use client";

import Link from "next/link";
import { useState } from "react";

export default function UserDashboard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)] px-3 py-1.5 transition-all hover:border-[var(--accent-primary)] hover:shadow-sm"
        aria-label="User dashboard"
        aria-expanded={isOpen}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-warm)] text-[10px] font-bold text-white">
          U
        </div>
        <svg
          className={`h-3 w-3 text-[var(--text-secondary)] transition-transform ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-lg">
            <div className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-warm)] px-4 py-3">
              <p className="text-sm font-semibold text-white">User Dashboard</p>
              <p className="text-xs text-white/80">Welcome to CHITHRA</p>
            </div>
            <div className="py-2">
              <Link
                href="/watchlist"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                My Watchlist
              </Link>
              <Link
                href="/browse"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                  <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Continue Watching
              </Link>
              <Link
                href="/live-tv"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                  <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Live TV
              </Link>
              <Link
                href="/gods-eye"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                The God&apos;s Eye
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
