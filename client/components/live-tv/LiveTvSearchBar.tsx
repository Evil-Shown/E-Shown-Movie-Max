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
    <div className="relative w-full max-w-2xl">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8c6b5d]"
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
        className="w-full rounded-full border border-white/60 bg-white/50 py-3.5 pl-12 pr-6 text-base font-medium text-[#3d2e1f] shadow-[inset_0_2px_8px_rgba(0,0,0,0.02),0_4px_12px_rgba(0,0,0,0.02)] backdrop-blur-xl transition-all placeholder:text-[#8c6b5d]/70 focus:border-[#c96a2b]/50 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#c96a2b]/10"
      />
      {typeof resultCount === "number" && localValue.trim() && (
        <span className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold text-[#c96a2b] shadow-sm">
          {resultCount} found
        </span>
      )}
    </div>
  );
}
