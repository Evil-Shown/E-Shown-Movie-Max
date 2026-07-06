"use client";

import GlowOrb from "@/components/3d/GlowOrb";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUpVariant } from "@/lib/motion";

export default function LiveTvHero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/40 shadow-[0_16px_40px_rgb(0,0,0,0.04)] backdrop-blur-2xl"
      aria-labelledby="live-tv-title"
    >
      <div
        className="relative overflow-hidden rounded-[32px]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 25%, rgba(201,106,43,0.12), transparent 45%), radial-gradient(circle at 85% 70%, rgba(245,158,11,0.12), transparent 45%)",
        }}
      >
        <GlowOrb
          color="rgba(201,106,43,0.15)"
          size={350}
          x="5%"
          y="20%"
          blur={120}
          opacity={0.8}
          className="hidden sm:block"
        />
        <GlowOrb
          color="rgba(245,158,11,0.12)"
          size={400}
          x="85%"
          y="70%"
          blur={100}
          opacity={0.7}
          animationDelay="1.2s"
          className="hidden sm:block"
        />

        <div className="relative grid min-h-[260px] grid-cols-1 items-center gap-6 p-8 sm:min-h-[300px] sm:p-12 lg:grid-cols-[1fr_240px]">
          <motion.div
            variants={prefersReducedMotion ? undefined : fadeUpVariant}
            initial="hidden"
            animate="visible"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#c96a2b]">
              CHITHRA · Live Broadcast
            </p>
            <h1
              id="live-tv-title"
              className="mt-4 font-[var(--font-playfair)] text-[36px] font-extrabold leading-[1.1] text-[#3d2e1f] sm:text-[48px]"
            >
              Live TV
            </h1>
            <p className="mt-4 max-w-xl text-[16px] leading-[1.8] text-[#5c4a3d]">
              Stream local Sri Lankan channels and international networks — sports, news,
              entertainment, and more, all in one place.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <div>
                <p className="font-[var(--font-playfair)] text-2xl font-bold text-[#c96a2b]">40+</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8c6b5d]">
                  Channels
                </p>
              </div>
              <div className="hidden h-10 w-[2px] bg-gradient-to-b from-transparent via-[#c96a2b]/20 to-transparent sm:block" aria-hidden />
              <div>
                <p className="font-[var(--font-playfair)] text-2xl font-bold text-[#c96a2b]">HD</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8c6b5d]">
                  Quality
                </p>
              </div>
              <div className="hidden h-10 w-[2px] bg-gradient-to-b from-transparent via-[#c96a2b]/20 to-transparent sm:block" aria-hidden />
              <div>
                <p className="font-[var(--font-playfair)] text-2xl font-bold text-[#c96a2b]">24/7</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8c6b5d]">
                  Live
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-2.5">
              {["Local", "Sports", "News", "Entertainment"].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-white/80 bg-white/50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a5c4d] shadow-[0_2px_10px_rgba(0,0,0,0.02)] backdrop-blur-sm"
                >
                  {label}
                </span>
              ))}
            </div>
          </motion.div>

          <div
            className="relative mx-auto flex h-[180px] w-full max-w-[240px] items-center justify-center lg:mx-0 lg:h-[200px]"
            aria-hidden
          >
            <div className="absolute h-40 w-40 rounded-full border border-white/50 bg-white/30 shadow-[0_0_40px_rgba(201,106,43,0.05)] backdrop-blur-xl" />
            <div className="absolute h-32 w-32 rounded-full border border-[#c96a2b]/30 animate-[pulse-ring_2.5s_ease-out_infinite]" />
            <div className="relative z-[1] flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white bg-white/90 shadow-[0_8px_32px_rgba(201,106,43,0.15)] backdrop-blur-2xl">
                <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-[#c96a2b]" aria-hidden>
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 3" />
                </svg>
              </div>
              <span className="mt-4 text-[11px] font-bold uppercase tracking-[0.25em] text-[#c96a2b] drop-shadow-sm">
                On Air
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
