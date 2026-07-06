"use client";

import GlowOrb from "@/components/3d/GlowOrb";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUpVariant } from "@/lib/motion";

export default function LiveTvHero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)]"
      aria-labelledby="live-tv-title"
    >
      <div
        className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,rgba(28,25,23,0.98),rgba(23,20,18,0.96))]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 25%, rgba(201,106,43,0.22), transparent 32%), radial-gradient(circle at 85% 70%, rgba(74,124,142,0.16), transparent 28%)",
        }}
      >
        <GlowOrb
          color="rgba(201,106,43,0.28)"
          size={280}
          x="12%"
          y="35%"
          blur={90}
          opacity={0.7}
          className="hidden sm:block"
        />
        <GlowOrb
          color="rgba(74,124,142,0.22)"
          size={240}
          x="88%"
          y="60%"
          blur={80}
          opacity={0.6}
          animationDelay="1.2s"
          className="hidden sm:block"
        />

        <div className="cinema-sweep pointer-events-none absolute inset-0 opacity-40" aria-hidden />

        <div className="relative grid min-h-[260px] grid-cols-1 items-center gap-6 p-6 sm:min-h-[280px] sm:p-8 lg:grid-cols-[1fr_200px]">
          <motion.div
            variants={prefersReducedMotion ? undefined : fadeUpVariant}
            initial="hidden"
            animate="visible"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c96a2b]">
              CHITHRA · Live Broadcast
            </p>
            <h1
              id="live-tv-title"
              className="mt-3 font-[var(--font-playfair)] text-[32px] font-bold leading-[1.1] text-[#f7f4ef] sm:text-[40px]"
            >
              Live TV
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-[1.7] text-[rgba(247,244,239,0.72)]">
              Stream local Sri Lankan channels and international networks — sports, news,
              entertainment, and more, all in one place.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <div>
                <p className="font-[var(--font-playfair)] text-xl font-bold text-[#e8a44a]">40+</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[rgba(201,106,43,0.75)]">
                  Channels
                </p>
              </div>
              <div className="hidden h-8 w-px bg-[rgba(201,106,43,0.25)] sm:block" aria-hidden />
              <div>
                <p className="font-[var(--font-playfair)] text-xl font-bold text-[#e8a44a]">HD</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[rgba(201,106,43,0.75)]">
                  Quality
                </p>
              </div>
              <div className="hidden h-8 w-px bg-[rgba(201,106,43,0.25)] sm:block" aria-hidden />
              <div>
                <p className="font-[var(--font-playfair)] text-xl font-bold text-[#e8a44a]">24/7</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[rgba(201,106,43,0.75)]">
                  Live
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {["Local", "Sports", "News", "Entertainment"].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-[rgba(201,106,43,0.35)] bg-[rgba(201,106,43,0.08)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[rgba(247,244,239,0.88)]"
                >
                  {label}
                </span>
              ))}
            </div>
          </motion.div>

          <div
            className="relative mx-auto flex h-[160px] w-full max-w-[200px] items-center justify-center lg:mx-0 lg:h-[180px]"
            aria-hidden
          >
            <div className="absolute h-32 w-32 rounded-full border border-[rgba(201,106,43,0.2)]" />
            <div className="absolute h-24 w-24 rounded-full border border-[rgba(201,106,43,0.3)] animate-[pulse-ring_2s_ease-out_infinite]" />
            <div className="relative z-[1] flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(201,106,43,0.15)] border border-[rgba(201,106,43,0.4)]">
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-[#e8a44a]" aria-hidden>
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 3" />
                </svg>
              </div>
              <span className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[rgba(232,164,74,0.8)]">
                On Air
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
