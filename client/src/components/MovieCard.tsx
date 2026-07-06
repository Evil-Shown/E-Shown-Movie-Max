"use client";

import type { Movie } from "@/lib/types";
import { posterUrl } from "@/lib/movies";
import FloatingCard from "@/components/3d/FloatingCard";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { scaleInVariant } from "@/lib/motion";

interface MovieCardProps {
  movie: Movie;
  priority?: boolean;
  rank?: number;
}

export default function MovieCard({ movie, priority = false, rank }: MovieCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={scaleInVariant}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
      className="relative shrink-0"
    >
      {rank !== undefined && (
        <span
          aria-hidden
          className="font-cinzel pointer-events-none absolute -bottom-2 -left-1 z-0 text-5xl leading-none text-[var(--gold-dim)] sm:text-6xl"
        >
          {String(rank).padStart(2, "0")}
        </span>
      )}

      <FloatingCard className="relative z-10">
        <Link href={`/movie/${movie.id}`} className="group relative block">
          <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-[var(--bg-surface)] ring-1 ring-[var(--border-subtle)] transition duration-300 group-hover:gold-glow group-hover:ring-[var(--border-hot)]">
            <div className="absolute inset-0 z-10 opacity-0 transition duration-300 group-hover:animate-shimmer group-hover:opacity-100" />

            <Image
              src={posterUrl(movie.posterPath, "w342")}
              alt={movie.title}
              fill
              sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 200px"
              priority={priority}
              className="object-cover transition duration-500 group-hover:scale-[1.06] group-hover:brightness-75"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-void)] via-transparent to-transparent opacity-90" />

            <div className="absolute inset-x-0 bottom-0 z-20 p-3 transition duration-300 group-hover:translate-y-full group-hover:opacity-0">
              <p className="line-clamp-2 text-sm font-semibold text-[var(--text-primary)]">
                {movie.title}
              </p>
              <div className="mt-1 flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                <span className="text-[var(--gold-primary)]">★</span>
                {movie.rating.toFixed(1)}
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full p-3 transition duration-300 group-hover:translate-y-0">
              <div className="flex flex-wrap gap-1">
                {movie.genres.slice(0, 2).map((g) => (
                  <span
                    key={g}
                    className="border border-[var(--border-subtle)] px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-[var(--text-dim)]"
                  >
                    {g}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">{movie.director}</p>
              <span className="mt-2 inline-block bg-[var(--gold-primary)] px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-black">
                Explore
              </span>
            </div>

            <div className="absolute right-2 top-2 z-20 flex h-8 w-8 scale-0 items-center justify-center rounded-full border border-[var(--gold-primary)] bg-transparent transition duration-300 group-hover:scale-100">
              <svg viewBox="0 0 24 24" fill="white" className="ml-0.5 h-3 w-3">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </Link>
      </FloatingCard>
    </motion.div>
  );
}
