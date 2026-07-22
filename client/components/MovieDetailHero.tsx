"use client";

import { useScroll, useTransform, motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";

interface MovieDetailHeroProps {
  backdropSrc: string;
}

export default function MovieDetailHero({ backdropSrc }: MovieDetailHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 240]);

  return (
    <section
      ref={ref}
      className="relative h-[42vh] min-h-[240px] max-h-[360px] overflow-hidden sm:h-auto sm:min-h-[70vh] sm:max-h-none"
    >
      <motion.div className="absolute inset-0" style={{ y: prefersReducedMotion ? 0 : y }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backdropSrc}
          alt=""
          className="h-full w-full object-cover object-[center_28%] sm:h-[120%] sm:object-top"
        />
      </motion.div>
      <div className="hero-overlay-detail absolute inset-0" />
    </section>
  );
}
