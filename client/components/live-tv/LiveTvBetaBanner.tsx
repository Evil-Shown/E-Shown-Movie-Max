"use client";

import { useAfterHydration } from "@/lib/hooks/use-after-hydration";
import { useCallback, useState } from "react";

const STORAGE_KEY = "chithra_live_tv_beta_banner_dismissed";

export default function LiveTvBetaBanner() {
  const afterHydration = useAfterHydration();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "1";
  });

  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  }, []);

  if (!afterHydration || dismissed) return null;

  return (
    <div
      className="live-tv-beta-banner relative mb-5 mt-5 overflow-hidden rounded-xl border-2 border-red-500/70 bg-gradient-to-r from-red-950/90 via-red-900/50 to-red-950/80 shadow-[0_0_28px_rgba(239,68,68,0.28)]"
      role="alert"
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(-45deg,rgba(239,68,68,0.06)_0px,rgba(239,68,68,0.06)_10px,transparent_10px,transparent_20px)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute -left-8 top-0 h-full w-24 bg-red-500/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-8 top-0 h-full w-24 bg-orange-500/15 blur-3xl" aria-hidden />

      <div className="relative flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:p-5">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-400/50 bg-red-500/20 text-red-300 shadow-[0_0_16px_rgba(248,113,113,0.35)]"
            aria-hidden
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="animate-pulse rounded-full border border-red-300/60 bg-red-500 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white shadow-[0_0_18px_rgba(239,68,68,0.55)]">
                Beta
              </span>
              <p className="text-base font-bold text-red-50 sm:text-[17px]">
                Live TV is in early testing
              </p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-red-100/90">
              Streams may buffer, drop, or change without notice while we improve reliability.
              Your feedback helps us polish this feature.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 self-start rounded-lg border border-red-300/35 bg-red-950/60 px-3.5 py-1.5 text-xs font-semibold text-red-100 transition hover:border-red-200/60 hover:bg-red-900/70 hover:text-white"
          aria-label="Dismiss beta notice"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
