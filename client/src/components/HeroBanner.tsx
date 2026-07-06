"use client";

import type { Movie } from "@/lib/types";
import { backdropUrl, formatRuntime, posterUrl } from "@/lib/movies";
import HeroParticles from "@/components/3d/HeroParticles";
import FloatingCard from "@/components/3d/FloatingCard";
import PlayButton from "@/components/PlayButton";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { fadeUpVariant, staggerContainer } from "@/lib/motion";

interface HeroBannerProps {
  movie: Movie;
}

function AnimatedTitle({ title }: { title: string }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <h1 className="font-cinzel text-5xl font-bold leading-[1.05] text-[var(--text-primary)] sm:text-6xl lg:text-7xl xl:text-8xl">
        {title}
      </h1>
    );
  }

  return (
    <h1
      className="font-cinzel text-5xl font-bold leading-[1.05] text-[var(--text-primary)] sm:text-6xl lg:text-7xl xl:text-8xl"
      style={{ textShadow: "0 0 80px rgba(201,168,76,0.3)" }}
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
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const backdropY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const runtimePct = Math.min(100, Math.round((movie.runtime / 200) * 100));

  return (
    <section ref={sectionRef} className="relative h-screen min-h-[700px] overflow-hidden">
      <motion.div style={{ y: prefersReducedMotion ? 0 : backdropY }} className="absolute inset-0 scale-105">
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
      <HeroParticles />
      <div className="scanline" />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-2xl"
          variants={prefersReducedMotion ? undefined : staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={prefersReducedMotion ? undefined : fadeUpVariant} className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-[var(--gold-primary)]" />
            <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--gold-primary)]">
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
                className="border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--text-dim)]"
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
              className="inline-flex h-12 min-w-[160px] items-center justify-center border border-[rgba(201,168,76,0.4)] px-8 text-sm text-[rgba(240,237,228,0.8)] transition hover:border-[var(--border-hot)] hover:text-[var(--text-primary)]"
            >
              More Info
            </Link>
          </motion.div>

          <motion.div variants={prefersReducedMotion ? undefined : fadeUpVariant} className="mt-6">
            <p className="text-[9px] uppercase tracking-[0.3em] text-[var(--text-dim)]">Runtime</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">{formatRuntime(movie.runtime)}</p>
            <div className="mt-2 h-0.5 w-[200px] bg-[rgba(201,168,76,0.15)]">
              <div
                className="h-full bg-[var(--gold-primary)]"
                style={{ width: `${runtimePct}%` }}
              />
            </div>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-24 right-8 hidden lg:block">
          <FloatingCard>
            <div className="animate-float">
              <div className="h-[390px] w-[260px] overflow-hidden rounded-xl ring-1 ring-[var(--border-mid)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={posterUrl(movie.posterPath, "w500")}
                  alt={movie.title}
                  width={260}
                  height={390}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="poster-reflection relative mt-2 h-16 w-[260px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={posterUrl(movie.posterPath, "w500")}
                  alt=""
                  width={260}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </FloatingCard>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.4em] text-[rgba(240,237,228,0.3)]">
          Scroll
        </span>
        <div className="relative h-10 w-px bg-[rgba(201,168,76,0.2)]">
          <div className="scroll-line-indicator absolute inset-0 bg-[var(--gold-primary)]" />
        </div>
      </div>
    </section>
  );
}
