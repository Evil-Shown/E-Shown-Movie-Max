"use client";

import { movies } from "@/lib/movies";
import { useCountUp } from "@/lib/hooks/useCountUp";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";

function StatItem({
  end,
  suffix,
  label,
  decimals = 0,
  enabled,
}: {
  end: number;
  suffix?: string;
  label: string;
  decimals?: number;
  enabled: boolean;
}) {
  const value = useCountUp(end, enabled, 1200, decimals);
  return (
    <div className="px-4 text-center sm:px-6">
      <p className="font-cinzel text-2xl text-[var(--gold-primary)]">
        {value}
        {suffix}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}

export default function CtaBanner() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  const avgRating = movies.reduce((s, m) => s + m.rating, 0) / movies.length;

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  const spotX = (offset: number) => `${(mouse.x * 20 + offset).toFixed(1)}%`;
  const spotY = (offset: number) => `${(mouse.y * 15 + offset).toFixed(1)}%`;

  return (
    <section
      ref={ref}
      onMouseMove={handleMouseMove}
      className="surface-texture relative overflow-hidden border-y border-[rgba(212,168,67,0.2)] py-[100px]"
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #303752 0%, #242b3d 52%, #1f2636 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 42% at 50% 0%, rgba(212,168,67,0.14), transparent)",
        }}
      />

      {!prefersReducedMotion && (
        <>
          <div
            className="pointer-events-none absolute h-64 w-64 rounded-full opacity-40 blur-3xl transition-all duration-500 ease-out"
            style={{
              left: spotX(15),
              top: spotY(10),
              background: "radial-gradient(circle, rgba(212,168,67,0.35), transparent 70%)",
            }}
          />
          <div
            className="pointer-events-none absolute h-56 w-56 rounded-full opacity-30 blur-3xl transition-all duration-700 ease-out"
            style={{
              left: spotX(55),
              top: spotY(25),
              background: "radial-gradient(circle, rgba(212,168,67,0.25), transparent 70%)",
            }}
          />
          <div
            className="pointer-events-none absolute h-48 w-48 rounded-full opacity-25 blur-3xl transition-all duration-600 ease-out"
            style={{
              left: spotX(35),
              top: spotY(45),
              background: "radial-gradient(circle, rgba(74,144,217,0.3), transparent 70%)",
            }}
          />
        </>
      )}

      <div
        aria-hidden
        className="film-strip-deco pointer-events-none absolute bottom-0 left-6 top-0 hidden w-8 opacity-30 lg:block"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center rounded-[2rem] border border-white/10 bg-[rgba(23,27,36,0.28)] px-6 py-12 text-center shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-sm">
        <span className="absolute left-8 top-1/2 hidden h-20 w-px -translate-y-1/2 bg-[var(--border-mid)] lg:block" />
        <span className="absolute right-8 top-1/2 hidden h-20 w-px -translate-y-1/2 bg-[var(--border-mid)] lg:block" />

        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-cinzel text-[10px] uppercase tracking-[0.5em] text-[var(--gold-bright)]"
        >
          Unlimited Cinema
        </motion.p>
        <h2 className="font-cinzel text-cinema-glow mt-6 text-4xl text-[var(--text-primary)] sm:text-5xl">
          Every Story.
          <span className="mt-2 block indent-8">Every World.</span>
        </h2>
        <p className="font-cormorant mt-6 text-[1.2rem] italic text-[var(--text-secondary)]">
          From blockbusters to hidden gems — curated for the discerning viewer.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-0">
          {[
            { end: movies.length, suffix: "+", label: "Curated Films", decimals: 0 },
            { end: 12, suffix: "", label: "Genres", decimals: 0 },
            { end: avgRating, suffix: "", label: "Avg Rating", decimals: 1 },
          ].map((stat, i) => (
            <div key={stat.label} className="flex items-center">
              {i > 0 && <span className="mx-6 hidden h-8 w-px bg-[var(--border-mid)] sm:block" />}
              <StatItem
                end={stat.end}
                suffix={stat.suffix}
                label={stat.label}
                decimals={stat.decimals}
                enabled={inView}
              />
            </div>
          ))}
        </div>

        <Link
          href="/browse"
          data-cursor="link"
          className="font-cinzel mt-10 rounded-full bg-[var(--gold-primary)] px-12 py-4 text-sm font-bold uppercase tracking-[0.2em] text-black shadow-[0_14px_34px_rgba(212,168,67,0.22)] transition hover:bg-[var(--gold-bright)] active:scale-95"
        >
          Explore the Library
        </Link>
      </div>
    </section>
  );
}
