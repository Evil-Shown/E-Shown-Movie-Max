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
    <section ref={ref} className="relative min-h-[70vh] overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: prefersReducedMotion ? 0 : y }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={backdropSrc} alt="" className="h-[120%] w-full object-cover" />
      </motion.div>
      <div className="hero-overlay-detail absolute inset-0" />
    </section>
  );
}
