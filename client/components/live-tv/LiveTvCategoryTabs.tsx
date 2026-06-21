"use client";

import { LIVE_TV_CATEGORY_LABELS } from "@/lib/live-tv/channels";
import type { LiveTvCategoryFilter } from "@/lib/live-tv/types";

const TABS: { value: LiveTvCategoryFilter; label: string }[] = [
  { value: "all", label: "All Channels" },
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
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const active = activeCategory === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onCategoryChange(tab.value)}
            className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
              active
                ? "border-[var(--bg-dark)] bg-[var(--bg-dark)] text-[var(--text-inverse)]"
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
