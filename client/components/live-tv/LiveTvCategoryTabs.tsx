"use client";

import { LIVE_TV_CATEGORY_LABELS } from "@/lib/live-tv/channels";
import type { LiveTvCategoryFilter } from "@/lib/live-tv/types";

const TABS: { value: LiveTvCategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "local", label: LIVE_TV_CATEGORY_LABELS.local },
  { value: "sports", label: LIVE_TV_CATEGORY_LABELS.sports },
  { value: "entertainment", label: LIVE_TV_CATEGORY_LABELS.entertainment },
  { value: "news", label: LIVE_TV_CATEGORY_LABELS.news },
  { value: "documentary", label: LIVE_TV_CATEGORY_LABELS.documentary },
  { value: "kids", label: LIVE_TV_CATEGORY_LABELS.kids },
];

interface LiveTvCategoryTabsProps {
  activeCategory: LiveTvCategoryFilter;
  onCategoryChange: (category: LiveTvCategoryFilter) => void;
}

export default function LiveTvCategoryTabs({
  activeCategory,
  onCategoryChange,
}: LiveTvCategoryTabsProps) {
  return (
    <div className="flex w-max min-w-full gap-2">
      {TABS.map((tab) => {
        const active = activeCategory === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onCategoryChange(tab.value)}
            aria-pressed={active}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
              active
                ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white shadow-[0_4px_14px_rgba(201,106,43,0.28)]"
                : "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
