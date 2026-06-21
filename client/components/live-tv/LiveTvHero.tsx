"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUpVariant } from "@/lib/motion";

export default function LiveTvHero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden rounded-[24px] border border-[#d4af37]/40 p-[4px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      aria-labelledby="live-tv-title"
    >
      <div
        className="relative overflow-hidden rounded-[20px] border border-[#d4af37]/80 bg-[#0a0806]"
      >
        {/* Faux Marble Texture via Gradients */}
        <div 
          className="absolute inset-0 opacity-40 mix-blend-color-dodge"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, #d4af37 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, #d4af37 0%, transparent 50%),
              linear-gradient(45deg, transparent 40%, rgba(212, 175, 55, 0.1) 45%, transparent 50%),
              linear-gradient(-45deg, transparent 30%, rgba(212, 175, 55, 0.15) 35%, transparent 40%)
            `
          }}
        />
        
        {/* Dark vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-50" />

        <div className="relative grid min-h-[260px] grid-cols-1 items-center gap-6 p-8 sm:min-h-[300px] sm:p-12 lg:grid-cols-[1fr_260px]">
          <motion.div
            variants={prefersReducedMotion ? undefined : fadeUpVariant}
            initial="hidden"
            animate="visible"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#d4af37]/80">
              CHITHRA · LIVE BROADCAST
            </p>
            <h1
              id="live-tv-title"
              className="mt-4 font-[var(--font-playfair)] text-[40px] font-bold leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-[#fdfbfb] via-[#e2c173] to-[#8a6327] sm:text-[56px]"
            >
              Live TV
            </h1>
            <p className="mt-4 max-w-xl text-[16px] leading-[1.8] text-[#d4af37]/70">
              Stream local Sri Lankan channels and international networks — sports, news,
              entertainment, and more, all in one place.
            </p>

            {/* Gold Coins Row */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {[
                { top: "40+", bottom: "CHANNELS" },
                { top: "HD", bottom: "QUALITY" },
                { top: "24/7", bottom: "LIVE" },
              ].map((coin) => (
                <div 
                  key={coin.top} 
                  className="flex h-20 w-20 flex-col items-center justify-center rounded-full border border-[#fdfbfb]/30 bg-gradient-to-br from-[#f2d06b] via-[#d4af37] to-[#8a6327] shadow-[inset_0_4px_6px_rgba(255,255,255,0.4),inset_0_-4px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.6)]"
                >
                  <p className="font-[var(--font-playfair)] text-xl font-extrabold text-[#3d2a0e] drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]">
                    {coin.top}
                  </p>
                  <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-[#5e431a]">
                    {coin.bottom}
                  </p>
                </div>
              ))}
            </div>

            {/* Dark Pill Tags */}
            <div className="mt-6 flex flex-wrap gap-2.5">
              {["LOCAL", "SPORTS", "NEWS", "ENTERTAINMENT"].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-[#d4af37]/40 bg-gradient-to-b from-[#2a241c] to-[#120f0b] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#d4af37] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_8px_rgba(0,0,0,0.5)]"
                >
                  {label}
                </span>
              ))}
            </div>
          </motion.div>

          {/* 3D Astrolabe / Sphere */}
          <div
            className="relative mx-auto flex h-[220px] w-full max-w-[260px] items-center justify-center lg:mx-0 lg:h-[260px]"
            aria-hidden
          >
            {/* Outer Rings */}
            <div className="absolute h-56 w-56 rounded-full border-[8px] border-[#382b13] bg-gradient-to-br from-[#d4af37]/10 to-transparent shadow-[inset_0_0_20px_rgba(0,0,0,0.8),0_0_30px_rgba(0,0,0,0.5)]" />
            <div className="absolute h-48 w-48 rounded-full border-4 border-y-[#e2c173] border-x-[#8a6327] shadow-[0_0_20px_rgba(212,175,55,0.2)]" />
            
            {/* Rotating Armillary Rings */}
            <div className="absolute h-44 w-44 rounded-full border-2 border-[#d4af37] [transform-style:preserve-3d] [transform:rotateX(60deg)_rotateY(20deg)] animate-[spin_10s_linear_infinite]" />
            <div className="absolute h-44 w-44 rounded-full border-2 border-[#d4af37] [transform-style:preserve-3d] [transform:rotateX(60deg)_rotateY(80deg)] animate-[spin_12s_linear_infinite_reverse]" />
            <div className="absolute h-44 w-44 rounded-full border-2 border-[#d4af37] [transform-style:preserve-3d] [transform:rotateX(60deg)_rotateY(140deg)] animate-[spin_15s_linear_infinite]" />
            
            <div className="absolute h-[2px] w-48 bg-gradient-to-r from-transparent via-[#e2c173] to-transparent shadow-[0_0_10px_#d4af37]" />

            {/* Glowing Blue Core */}
            <div className="relative z-10 h-24 w-24 rounded-full bg-gradient-to-br from-[#4b8ce6] via-[#1c4b99] to-[#0a1a3a] shadow-[inset_0_-10px_20px_rgba(0,0,0,0.5),inset_0_10px_20px_rgba(255,255,255,0.4),0_0_40px_rgba(28,75,153,0.8)] flex items-center justify-center">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#f2d06b] to-[#8a6327] shadow-[0_0_15px_#f2d06b]" />
            </div>
            
            {/* Core Lights */}
            <div className="absolute top-1/3 left-1/3 h-2 w-2 rounded-full bg-white blur-[1px]" />
            <div className="absolute bottom-1/3 right-1/3 h-1 w-1 rounded-full bg-white blur-[1px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
