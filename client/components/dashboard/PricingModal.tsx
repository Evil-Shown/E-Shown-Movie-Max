"use client";

import { useState } from "react";

const freeFeatures = ["7-Day Trial Access Only", "1 Device at a time", "Ad-supported"];

const freeRestrictions = ["No Offline Downloads", "No Live TV Access", "No The God's Eye (Torrents)"];

const proFeatures = [
  "Unlimited Full Streaming",
  "4 Devices simultaneously",
  "Completely Ad-free",
  "Offline Downloads",
  "Full Live TV Access",
  "The God's Eye (Torrent Stream/Download)",
  "Early Access to Features & Content",
];

export default function PricingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [region, setRegion] = useState<"LKR" | "USD">("LKR");

  if (!isOpen) return null;

  const price = region === "LKR" ? "LKR 200.00" : "$0.99";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-[#FFFBF5] rounded-2xl overflow-hidden shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FFFBF5]/10 backdrop-blur-sm border border-[#FFFBF5]/20 flex items-center justify-center hover:bg-[#FFFBF5]/20 hover:scale-110 transition-all z-10"
        >
          <svg
            className="w-4 h-4 text-[#FFFBF5]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Free Plan */}
          <div className="p-8 border-r border-[#3E2723]/10 flex flex-col bg-[#FFFBF5]/50">
            <h3 className="text-xl font-bold text-[#3E2723] mb-1">Free</h3>
            <p className="text-[#3E2723]/60 text-sm mb-6">Basic trial experience</p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-[#3E2723]">LKR 0</span>
              <span className="text-[#3E2723]/60">/month</span>
            </div>

            <ul className="space-y-3 mb-4">
              {freeFeatures.map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-[#3E2723]/80 text-sm">
                  <svg
                    className="w-4 h-4 text-[#3E2723]/40 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {feat}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-4 border-t border-[#3E2723]/10 space-y-2">
              {freeRestrictions.map((res) => (
                <div key={res} className="flex items-center gap-2 text-[#3E2723]/50 text-xs">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <span className="line-through">{res}</span>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-3 border border-[#3E2723]/20 text-[#3E2723]/60 font-semibold rounded-lg cursor-default">
              Current Plan
            </button>
          </div>

          {/* Pro Plan */}
          <div className="p-8 bg-gradient-to-br from-[#3E2723] to-[#4E342E] flex flex-col relative">
            <div className="absolute top-0 right-0 bg-gradient-to-bl from-[#FFB87A] to-[#D4A574] text-[#3E2723] text-xs font-bold px-4 py-1 rounded-bl-xl flex items-center gap-1">
              <svg className="w-3 h-3 fill-[#3E2723]" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              RECOMMENDED
            </div>

            <h3 className="text-xl font-bold text-[#FFB87A] mb-1 mt-4 md:mt-0">Chithira Pro</h3>
            <p className="text-[#FFFBF5]/60 text-sm mb-6">The ultimate cinematic experience</p>

            <div className="text-center">
              <div className="flex items-center justify-center gap-3">
                <span className="text-lg text-[#FFFBF5]/40 line-through decoration-2">
                  {region === "LKR" ? "LKR 500" : "$2.49"}
                </span>
                <span className="text-4xl font-extrabold text-[#FFB87A]">{price}</span>
                <span className="text-[#FFFBF5]/40 text-sm self-end mb-1">/mo</span>
              </div>
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-red-500/15 border border-red-400/30">
                <span className="text-red-300 text-xs font-bold">🔥 Save 60%</span>
              </div>
              <div className="text-[#FFFBF5]/40 text-xs mt-3">
                {region === "LKR" ? "Only LKR 6.67 per day" : "Only $0.03 per day"} &bull; Cancel anytime
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setRegion("LKR")}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  region === "LKR" ? "bg-[#FFB87A] text-[#3E2723]" : "bg-[#FFFBF5]/10 text-[#FFFBF5]/60"
                }`}
              >
                Sri Lanka
              </button>
              <button
                onClick={() => setRegion("USD")}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  region === "USD" ? "bg-[#FFB87A] text-[#3E2723]" : "bg-[#FFFBF5]/10 text-[#FFFBF5]/60"
                }`}
              >
                Global
              </button>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {proFeatures.map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-[#FFFBF5]/90 text-sm">
                  <svg
                    className="w-4 h-4 text-[#FFB87A] flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {feat}
                </li>
              ))}
            </ul>

            <button className="w-full py-3 bg-gradient-to-r from-[#FFB87A] to-[#D4A574] text-[#3E2723] font-bold rounded-lg hover:shadow-[0_0_20px_rgba(255,184,122,0.3)] transition-all">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
