"use client";

import { getFeaturedChannels, getStreamableChannelCount } from "@/lib/live-tv/channels";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUpVariant } from "@/lib/motion";
import ChannelLogo from "@/components/live-tv/ChannelLogo";

export default function LiveTvHero() {
  const prefersReducedMotion = useReducedMotion();
  const featured = getFeaturedChannels().slice(0, 6);
  const streamableCount = getStreamableChannelCount();

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)]"
      aria-labelledby="live-tv-title"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(circle at 12% 30%, rgba(201, 106, 43, 0.12), transparent 40%), radial-gradient(circle at 88% 20%, rgba(201, 106, 43, 0.06), transparent 35%)",
        }}
      />

      <div className="relative grid grid-cols-1 items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:gap-12">
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
          <div className="grid grid-cols-3 gap-3">
            {featured.map((channel) => (
              <div
                key={channel.id}
                className="flex h-[72px] w-[96px] items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-2 shadow-sm"
              >
                <ChannelLogo channel={channel} variant="clean" className="h-full w-full" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
