"use client";

import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

type ErrorFallbackProps = {
  error: Error & { digest?: string };
  reset: () => void;
  /** When true, render a self-contained page (no surrounding layout). */
  standalone?: boolean;
};

export default function ErrorFallback({ error, reset, standalone = false }: ErrorFallbackProps) {
  const content = (
    <div
      className={
        standalone
          ? "flex min-h-screen flex-col items-center justify-center px-6 py-16"
          : "section-base flex min-h-[50vh] items-center justify-center px-6 py-16"
      }
    >
      <div className="w-full max-w-lg rounded-2xl border border-red-500/25 bg-[var(--bg-card)] p-8 shadow-[var(--shadow-md)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-cool)]">
          Unexpected error
        </p>
        <h1 className="mt-2 font-[var(--font-playfair)] text-3xl font-semibold text-[var(--text-primary)]">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          {error.message || "This page ran into a problem. You can try again or return home."}
        </p>
        {error.digest && <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">Error ID: {error.digest}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Try again
          </button>
          {standalone ? (
            <a
              href="/"
              className="inline-flex rounded-full border border-[var(--border-strong)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
            >
              Go home
            </a>
          ) : (
            <Link
              href="/"
              className="inline-flex rounded-full border border-[var(--border-strong)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
            >
              Go home
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  if (standalone) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <header className="border-b border-[var(--border)] px-6 py-4">
          <p className="text-sm font-semibold tracking-wide text-[var(--text-primary)]">{BRAND_NAME}</p>
        </header>
        {content}
      </div>
    );
  }

  return content;
}
