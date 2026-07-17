"use client";

import { useState } from "react";
import PricingModal from "./PricingModal";

export default function TrialCountdownBanner({ daysLeft }: { daysLeft: number }) {
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  if (daysLeft <= 0) return null;

  const isUrgent = daysLeft <= 2;

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-xl p-4 flex items-center justify-between gap-4 border ${
          isUrgent ? "bg-[#E65100]/10 border-[#E65100]/40" : "bg-[#FFB87A]/10 border-[#FFB87A]/40"
        }`}
      >
        <div className="flex items-center gap-3">
          {isUrgent ? (
            <svg
              className="w-5 h-5 text-[#E65100]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z" />
              <path d="M15 18H9v-5.17l2-2V6h2v4.83l2 2V18z" />
              <line x1="12" y1="2" x2="12" y2="4" />
              <path d="M10.29 2.29L8 5" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-[#FFB87A]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          )}
          <div>
            <p className="text-sm font-semibold text-[#FFFBF5]">
              {isUrgent ? "Your trial is ending soon!" : "You are on a Free Trial"}
            </p>
            <p className="text-xs text-[#FFFBF5]/60">
              {daysLeft} day{daysLeft !== 1 && "s"} left. Upgrade to keep Live TV, God&apos;s Eye, and offline
              downloads.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsPricingOpen(true)}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
            isUrgent ? "bg-[#E65100] text-white hover:bg-[#BF360C]" : "bg-[#FFB87A] text-[#3E2723] hover:bg-[#D4A574]"
          }`}
        >
          Upgrade Now
        </button>
      </div>

      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </>
  );
}
