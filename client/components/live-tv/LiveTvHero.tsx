"use client";

import { getStreamableChannelCount } from "@/lib/live-tv/channels";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUpVariant } from "@/lib/motion";
import allChannelsArt from "@/assets/images/Allchaneels.webp";

export default function LiveTvHero() {
  const prefersReducedMotion = useReducedMotion();
  const streamableCount = getStreamableChannelCount();

  return (
    <section
      className="theme-cinema-ambient relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)]"
      aria-labelledby="live-tv-title"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(circle at 12% 30%, rgba(201, 106, 43, 0.12), transparent 40%), radial-gradient(circle at 88% 20%, rgba(201, 106, 43, 0.06), transparent 35%)",
        }}
      />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        animate={
          prefersReducedMotion
            ? undefined
            : {
                opacity: [0.28, 0.45, 0.3],
                scale: [1, 1.02, 1],
              }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 12, repeat: Infinity, ease: "easeInOut" }
        }
        style={{
          background:
            "radial-gradient(circle at 18% 16%, rgba(232, 164, 74, 0.12), transparent 20%), radial-gradient(circle at 82% 20%, rgba(74, 124, 142, 0.08), transparent 22%), radial-gradient(circle at 50% 90%, rgba(201, 106, 43, 0.08), transparent 26%)",
        }}
      />

      <div className="relative grid grid-cols-1 items-center gap-6 p-5 sm:gap-8 sm:p-8 lg:grid-cols-[1fr_auto] lg:gap-12">
        <motion.div
          variants={prefersReducedMotion ? undefined : fadeUpVariant}
          initial="hidden"
          animate="visible"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent-cool)]">
            CHITHRA · Live TV
          </p>

          <h1
            id="live-tv-title"
            className="mt-2 font-[var(--font-playfair)] text-[32px] font-bold leading-tight text-[var(--text-primary)] sm:text-[40px]"
          >
            Live Television
          </h1>

          <p className="mt-3 max-w-lg text-[15px] leading-[1.7] text-[var(--text-secondary)]">
            Stream Sri Lankan channels and international networks — sports, news,
            and entertainment in one place.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            {[
              { value: `${streamableCount}+`, label: "Live Streams" },
              { value: "HD", label: "Quality" },
              { value: "24/7", label: "Live" },
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-3">
                {i > 0 && (
                  <span className="hidden h-8 w-px bg-[var(--border)] sm:block" aria-hidden />
                )}
                <div>
                  <span className="font-[var(--font-playfair)] text-xl font-bold text-[var(--text-primary)]">
                    {stat.value}
                  </span>
                  <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {["Local", "Sports", "News", "Entertainment"].map((label) => (
              <span
                key={label}
                className="rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)]"
              >
                {label}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={prefersReducedMotion ? undefined : fadeUpVariant}
          initial="hidden"
          animate="visible"
          className="hidden lg:block"
          aria-hidden
        >
          <motion.div
            className="overflow-hidden rounded-2xl"
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    y: [0, -6, 0],
                    scale: [1, 1.015, 1],
                  }
            }
            transition={
              prefersReducedMotion
                ? undefined
                : { duration: 8.5, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <div className="relative h-[240px] w-[460px]">
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-10"
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { opacity: [0.18, 0.3, 0.2], x: [-8, 8, -8] }
                }
                transition={
                  prefersReducedMotion
                    ? undefined
                    : { duration: 10, repeat: Infinity, ease: "easeInOut" }
                }
                style={{
                  background:
                    "linear-gradient(135deg, rgba(201, 106, 43, 0.18) 0%, rgba(232, 164, 74, 0.08) 28%, transparent 56%, rgba(74, 124, 142, 0.1) 100%)",
                  mixBlendMode: "screen",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-20"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 32%, rgba(2,6,23,0.14) 100%)",
                }}
              />
              <Image
                src={allChannelsArt}
                alt=""
                fill
                priority
                className="object-contain object-center"
                sizes="460px"
                placeholder="blur"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
