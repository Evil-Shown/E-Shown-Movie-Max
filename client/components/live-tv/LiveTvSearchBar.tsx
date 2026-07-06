"use client";

import { useEffect, useState } from "react";

interface LiveTvSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
}

export default function LiveTvSearchBar({ value, onChange, resultCount }: LiveTvSearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (localValue !== value) onChange(localValue);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [localValue, onChange, value]);

  const showCount = typeof resultCount === "number" && localValue.trim();

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
        aria-hidden
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="search"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder="Search channels…"
        aria-label="Search live TV channels"
        className={`w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] py-3 pl-11 text-sm text-[var(--text-primary)] transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)]/45 focus:bg-[var(--bg-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/15 ${
          showCount ? "pr-24" : "pr-4"
        }`}
      />
      {showCount ? (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--accent-primary)]">
          {resultCount} found
        </span>
      ) : null}
    </div>
  );
}
