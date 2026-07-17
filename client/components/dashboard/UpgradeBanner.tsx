"use client";

export default function UpgradeBanner({ onUpgradeClick }: { onUpgradeClick: () => void }) {
  const features = [
    {
      icon: (
        <svg
          className="w-3.5 h-3.5 text-[#D4A574]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="2" />
          <path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14" />
        </svg>
      ),
      text: "Live TV & Ad-free Streaming",
    },
    {
      icon: (
        <svg
          className="w-3.5 h-3.5 text-[#D4A574]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
      text: "The God's Eye (Torrent Stream)",
    },
    {
      icon: (
        <svg
          className="w-3.5 h-3.5 text-[#D4A574]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      text: "Offline Downloads",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#D4A574]/30 bg-gradient-to-br from-[#3E2723] via-[#4E342E] to-[#3E2723] p-6 md:p-8 shadow-xl">
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#FFB87A]/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#E65100]/20 rounded-full blur-3xl" />

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 z-10">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-[#FFB87A]/10 border border-[#FFB87A]/30">
            <svg
              className="w-3.5 h-3.5 text-[#FFB87A]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              <line x1="12" y1="17.77" x2="12" y2="2" />
              <polyline points="12 9 6 14" />
            </svg>
            <span className="text-xs font-semibold text-[#FFB87A] uppercase tracking-wider">Chithira Pro</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#FFFBF5] mb-2" style={{ fontFamily: "Cinzel, serif" }}>
            Unlock The God&apos;s Eye & Live TV
          </h2>
          <p className="text-[#FFFBF5]/60 text-sm mb-4 max-w-lg">
            Don&apos;t be limited by the 7-day trial. Upgrade to Pro for unlimited torrent downloading, movies and tv
            series offline downloads, and best cinematic quality and fast streaming.
          </p>

          <div className="flex flex-wrap gap-4 mb-4">
            {features.map((feat) => (
              <div
                key={feat.text}
                className="flex items-center gap-2 text-sm text-[#FFFBF5]/80 bg-[#FFFBF5]/5 px-3 py-1.5 rounded-lg border border-[#FFFBF5]/10"
              >
                {feat.icon}
                {feat.text}
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex flex-col items-center gap-3 bg-[#FFFBF5]/5 backdrop-blur-sm p-6 rounded-xl border border-[#FFFBF5]/10 min-w-[260px]">
          <div className="absolute -top-3 right-4 bg-[#FFB87A] text-[#3E2723] text-[10px] font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
            LIMITED OFFER
          </div>
          <div className="text-center">
            <span className="text-[#FFFBF5]/60 text-xs uppercase tracking-wider">Limited Time Offer</span>
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="text-lg text-[#FFFBF5]/40 line-through decoration-2">LKR 500</span>
              <span className="text-4xl font-extrabold text-[#FFB87A]">LKR 200</span>
              <span className="text-[#FFFBF5]/40 text-sm self-end mb-1">/mo</span>
            </div>
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-red-500/15 border border-red-400/30">
              <span className="text-red-300 text-xs font-bold">🔥 Save 60%</span>
            </div>
            <div className="text-[#FFFBF5]/40 text-xs mt-3">Only LKR 6.67 per day &bull; Cancel anytime</div>
            <div className="text-[#FFFBF5]/40 text-xs mt-1">or $0.99/month for global users</div>
            <div className="text-[#FFFBF5]/30 text-xs mt-1">
              or <span className="text-[#FFB87A]/70 font-semibold">LKR 2,000</span>/yr &bull;{" "}
              <span className="text-[#FFB87A]/70">$9.99</span>/yr
            </div>
          </div>

          <button
            onClick={onUpgradeClick}
            className="w-full mt-2 px-6 py-3 bg-gradient-to-r from-[#FFB87A] to-[#D4A574] text-[#3E2723] font-bold rounded-lg hover:shadow-[0_0_20px_rgba(255,184,122,0.4)] transition-all duration-300 transform hover:scale-105"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
}
