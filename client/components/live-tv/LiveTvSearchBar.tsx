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

  return (
    <div className="relative">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
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
        placeholder="Search channels by name or category…"
        aria-label="Search live TV channels"
        className="w-full rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] py-3 pl-11 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[rgba(201,106,43,0.2)]"
      />
      {typeof resultCount === "number" && localValue.trim() && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">
          {resultCount} found
        </span>
      )}
    </div>
  );
}
