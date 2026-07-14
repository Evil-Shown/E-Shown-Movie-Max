"use client";

import { useState } from "react";
import PricingModal from "./PricingModal";

interface ProFeatureGateProps {
  featureName: string;
  description?: string;
  children: React.ReactNode;
  isPro: boolean;
}

export default function ProFeatureGate({ featureName, description, children, isPro }: ProFeatureGateProps) {
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="relative w-full min-h-[400px] flex items-center justify-center rounded-2xl border border-[#3E2723]/20 bg-gradient-to-br from-[#3E2723] via-[#4E342E] to-[#3E2723] overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#E65100]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#FFB87A]/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center p-8 max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FFB87A]/10 border border-[#FFB87A]/30 mb-6">
            <svg
              className="w-7 h-7 text-[#FFB87A]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-[#FFFBF5] mb-2" style={{ fontFamily: "Cinzel, serif" }}>
            {featureName} is a Pro Feature
          </h2>

          <p className="text-[#FFFBF5]/60 text-sm mb-8">
            {description || `Unlock ${featureName} and elevate your streaming experience with Chithira Pro.`}
          </p>

          <div className="space-y-3 mb-8 text-left bg-[#FFFBF5]/5 p-4 rounded-xl border border-[#FFFBF5]/10">
            <div className="flex items-center gap-2 text-sm text-[#FFFBF5]/80">
              <svg
                className="w-3.5 h-3.5 text-[#FFB87A] flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                <line x1="12" y1="17.77" x2="12" y2="2" />
                <polyline points="12 9 6 14" />
              </svg>
              No Ads & Unlimited Streaming
            </div>
            <div className="flex items-center gap-2 text-sm text-[#FFFBF5]/80">
              <svg
                className="w-3.5 h-3.5 text-[#FFB87A] flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                <line x1="12" y1="17.77" x2="12" y2="2" />
                <polyline points="12 9 6 14" />
              </svg>
              Offline Downloads
            </div>
            <div className="flex items-center gap-2 text-sm text-[#FFFBF5]/80">
              <svg
                className="w-3.5 h-3.5 text-[#FFB87A] flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                <line x1="12" y1="17.77" x2="12" y2="2" />
                <polyline points="12 9 6 14" />
              </svg>
              The God&apos;s Eye & Live TV
            </div>
          </div>

          <button
            onClick={() => setIsPricingOpen(true)}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#FFB87A] to-[#D4A574] text-[#3E2723] font-bold rounded-lg hover:shadow-[0_0_20px_rgba(255,184,122,0.4)] transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 fill-[#3E2723]" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Upgrade to Pro
          </button>
        </div>
      </div>

      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </>
  );
}
