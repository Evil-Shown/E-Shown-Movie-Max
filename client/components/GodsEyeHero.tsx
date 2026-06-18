"use client";

export default function GodsEyeHero() {
  return (
    <section
      className="relative overflow-hidden rounded-t-2xl border-b border-[rgba(200,100,30,0.18)] bg-[linear-gradient(135deg,rgba(32,21,13,0.98),rgba(23,15,10,0.98))]"
      aria-labelledby="gods-eye-title"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(circle at 18% 20%, rgba(200, 90, 30, 0.22), transparent 28%), radial-gradient(circle at 80% 35%, rgba(232, 200, 154, 0.12), transparent 24%)",
        }}
      />

      <div className="relative grid min-h-[280px] grid-cols-1 items-center gap-6 p-6 sm:min-h-[300px] sm:p-8 lg:grid-cols-[1fr_220px]">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c85a1e]">
            CHITHRA · Streaming Platform
          </p>

          <h1
            id="gods-eye-title"
            className="mt-3 font-[var(--font-cinzel)] text-4xl font-bold leading-[1.05] tracking-wide text-[#e8c89a] sm:text-5xl"
          >
            The God&apos;s <span className="text-[#c85a1e]">Eye</span>
          </h1>

          <p className="mt-3 max-w-xl text-sm font-light tracking-[0.12em] text-[rgba(232,200,154,0.62)] uppercase">
            Search, stream, and download from one place
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div>
              <p className="font-[var(--font-cinzel)] text-xl font-bold text-[#e8c89a]">∞</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[rgba(200,100,30,0.75)]">Titles</p>
            </div>
            <div className="hidden h-8 w-px bg-[rgba(200,100,30,0.25)] sm:block" aria-hidden />
            <div>
              <p className="font-[var(--font-cinzel)] text-xl font-bold text-[#e8c89a]">4K</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[rgba(200,100,30,0.75)]">Quality</p>
            </div>
            <div className="hidden h-8 w-px bg-[rgba(200,100,30,0.25)] sm:block" aria-hidden />
            <div>
              <p className="font-[var(--font-cinzel)] text-xl font-bold text-[#e8c89a]">24/7</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[rgba(200,100,30,0.75)]">Uptime</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {["Discover", "Stream", "Download"].map((label) => (
              <span
                key={label}
                className="rounded-full border border-[rgba(200,100,30,0.35)] bg-[rgba(200,100,30,0.06)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[rgba(232,200,154,0.88)]"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div
          className="relative mx-auto flex h-[180px] w-full max-w-[220px] items-center justify-center lg:mx-0 lg:h-[200px]"
          aria-hidden
        >
          <div className="absolute h-36 w-36 rounded-full border border-[rgba(200,100,30,0.2)]" />
          <div className="absolute h-28 w-28 rounded-full border border-[rgba(200,100,30,0.28)]" />
          <div className="absolute h-20 w-20 rounded-full border border-[rgba(200,100,30,0.36)]" />
          <svg className="relative z-[1] h-12 w-[4.5rem]" viewBox="0 0 70 50" role="presentation">
            <defs>
              <radialGradient id="godsEyeIris" cx="50%" cy="45%" r="65%">
                <stop offset="0%" stopColor="#c85a1e" />
                <stop offset="72%" stopColor="#8f3c12" />
                <stop offset="100%" stopColor="#3d1a05" />
              </radialGradient>
              <clipPath id="godsEyeClip">
                <path d="M5 25 Q35 4 65 25 Q35 46 5 25Z" />
              </clipPath>
            </defs>
            <path d="M5 25 Q35 4 65 25 Q35 46 5 25Z" fill="#0f0a06" stroke="#c85a1e" strokeWidth="1.5" />
            <g clipPath="url(#godsEyeClip)">
              <circle cx="35" cy="25" r="16" fill="url(#godsEyeIris)" />
              <circle cx="35" cy="25" r="8" fill="#0a0504" />
              <circle cx="30" cy="21" r="2.5" fill="rgba(255,200,150,0.4)" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
