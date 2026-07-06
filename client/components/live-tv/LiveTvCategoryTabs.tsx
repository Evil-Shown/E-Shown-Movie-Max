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
    <div className="flex flex-wrap gap-2.5">
      {TABS.map((tab) => {
        const active = activeCategory === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onCategoryChange(tab.value)}
            className={`rounded-full px-5 py-2.5 text-[13px] font-bold tracking-wide transition-all duration-300 ${
              active
                ? "bg-gradient-to-r from-[#c96a2b] to-[#e88a4a] text-white shadow-[0_4px_14px_rgba(201,106,43,0.35)]"
                : "border border-white/60 bg-white/40 text-[#8c6b5d] shadow-[0_2px_8px_rgba(0,0,0,0.02)] backdrop-blur-md hover:bg-white/70 hover:text-[#c96a2b] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
