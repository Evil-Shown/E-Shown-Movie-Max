"use client";

import type { Movie } from "@/lib/types";
import { backdropUrl, formatRuntime, posterUrl } from "@/lib/movies";
import HeroParticles from "@/components/3d/HeroParticles";
import FloatingCard from "@/components/3d/FloatingCard";
import PlayButton from "@/components/PlayButton";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef, useState } from "react";
import { fadeUpVariant, staggerContainer } from "@/lib/motion";

interface HeroBannerProps {
  movie: Movie;
}

function AnimatedTitle({ title }: { title: string }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <h1 className="font-cinzel text-cinema-glow text-5xl font-bold leading-[1.05] text-[var(--text-primary)] sm:text-6xl lg:text-7xl xl:text-8xl">
        {title}
      </h1>
    );
  }

  return (
    <h1
      className="font-cinzel text-cinema-glow text-5xl font-bold leading-[1.05] text-[var(--text-primary)] sm:text-6xl lg:text-7xl xl:text-8xl"
      style={{ textShadow: "0 0 80px rgba(212,168,67,0.3)" }}
    >
      {title.split("").map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </h1>
  );
}

export default function HeroBanner({ movie }: HeroBannerProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [scrollProgress, setScrollProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => setScrollProgress(v));

  const backdropY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const backdropScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.94]);
  const scrollLabelOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const runtimePct = Math.min(100, Math.round((movie.runtime / 200) * 100));

  return (
    <section ref={sectionRef} className="relative h-screen min-h-[700px] overflow-hidden">
      <motion.div
        style={{
          y: prefersReducedMotion ? 0 : backdropY,
          scale: prefersReducedMotion ? 1 : backdropScale,
        }}
        className="absolute inset-0 will-change-transform"
      >
        <Image
          src={backdropUrl(movie.backdropPath)}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      <div className="hero-overlay absolute inset-0" />
      <HeroParticles scrollProgress={scrollProgress} />
      <div className="scanline" />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <motion.div
          style={{
            opacity: prefersReducedMotion ? 1 : contentOpacity,
            scale: prefersReducedMotion ? 1 : contentScale,
          }}
          className="max-w-2xl rounded-3xl border border-white/10 bg-[rgba(32,38,54,0.38)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-sm will-change-transform sm:p-7"
          variants={prefersReducedMotion ? undefined : staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={prefersReducedMotion ? undefined : fadeUpVariant} className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-[var(--gold-primary)]" />
            <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--gold-bright)]">
              Now Featuring
            </p>
            <span className="h-px w-8 bg-[var(--gold-primary)]" />
          </motion.div>

          <motion.div variants={prefersReducedMotion ? undefined : fadeUpVariant}>
            <AnimatedTitle title={movie.title} />
          </motion.div>

          <motion.p
            variants={prefersReducedMotion ? undefined : fadeUpVariant}
            className="font-cormorant mt-4 text-xl italic text-[var(--gold-bright)] opacity-[0.85] sm:text-2xl"
          >
            &ldquo;{movie.tagline}&rdquo;
          </motion.p>

          <motion.div
            variants={prefersReducedMotion ? undefined : fadeUpVariant}
            className="mt-5 flex flex-wrap items-center gap-3 text-sm"
          >
            <span className="animate-pulse-ring inline-flex items-center gap-1 border border-[var(--gold-primary)] px-2 py-0.5 text-[var(--gold-primary)]">
              ★ {movie.rating.toFixed(1)}
            </span>
            <span className="text-[var(--text-secondary)]">{movie.year}</span>
            <span className="text-[var(--text-dim)]">·</span>
            <span className="text-[var(--text-secondary)]">{formatRuntime(movie.runtime)}</span>
            {movie.genres.map((genre) => (
              <span
                key={genre}
                className="rounded-full border border-[var(--border-subtle)] bg-[rgba(32,38,54,0.48)] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[var(--text-secondary)]"
              >
                {genre}
              </span>
            ))}
          </motion.div>

          <motion.p
            variants={prefersReducedMotion ? undefined : fadeUpVariant}
            className="mt-5 line-clamp-3 max-w-xl text-base leading-relaxed text-[var(--text-secondary)]"
          >
            {movie.overview}
          </motion.p>

          <motion.div variants={prefersReducedMotion ? undefined : fadeUpVariant} className="mt-6 flex flex-wrap gap-4">
            <PlayButton movie={movie} label="Play Now" />
            <Link
              href={`/movie/${movie.id}`}
              data-cursor="link"
              className="inline-flex h-12 min-w-[160px] items-center justify-center rounded-full border border-[rgba(212,168,67,0.46)] bg-[rgba(32,38,54,0.46)] px-8 text-sm text-[var(--text-secondary)] transition hover:border-[var(--border-hot)] hover:bg-[rgba(212,168,67,0.1)] hover:text-[var(--text-primary)] active:scale-95"
            >
              More Info
            </Link>
          </motion.div>

          <motion.div variants={prefersReducedMotion ? undefined : fadeUpVariant} className="mt-6">
            <p className="text-[9px] uppercase tracking-[0.3em] text-[var(--text-dim)]">Runtime</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">{formatRuntime(movie.runtime)}</p>
            <div className="mt-2 h-0.5 w-[200px] bg-[rgba(212,168,67,0.15)]">
              <div className="h-full bg-[var(--gold-primary)]" style={{ width: `${runtimePct}%` }} />
            </div>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-24 right-8 hidden lg:block">
          <FloatingCard>
            <div className="animate-float">
              <div className="h-[390px] w-[260px] overflow-hidden rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.38),0_0_40px_rgba(212,168,67,0.14)] ring-1 ring-[var(--border-mid)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={posterUrl(movie.posterPath, "w500")}
                  alt={movie.title}
                  width={260}
                  height={390}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </FloatingCard>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 flex w-48 -translate-x-1/2 flex-col items-center gap-2">
        <motion.span
          style={{ opacity: prefersReducedMotion ? 1 : scrollLabelOpacity }}
          className="text-[10px] uppercase tracking-[0.4em] text-[rgba(240,237,228,0.3)]"
        >
          Scroll
        </motion.span>
        <div className="relative h-0.5 w-full overflow-hidden rounded-full bg-[rgba(212,168,67,0.15)]">
          <motion.div
            style={{ width: prefersReducedMotion ? "30%" : progressWidth }}
            className="animate-shimmer h-full bg-gradient-to-r from-[var(--gold-primary)] via-[var(--gold-bright)] to-[var(--gold-primary)]"
          />
        </div>
      </div>
    </section>
  );
}
