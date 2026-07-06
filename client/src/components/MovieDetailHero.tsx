"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface MovieDetailHeroProps {
  backdropSrc: string;
}

export default function MovieDetailHero({ backdropSrc }: MovieDetailHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);

  return (
    <section ref={ref} className="relative min-h-[70vh] overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: prefersReducedMotion ? 0 : y }}>
        <Image src={backdropSrc} alt="" fill priority sizes="100vw" className="object-cover" />
      </motion.div>
      <div className="hero-overlay-detail absolute inset-0" />
    </section>
  );
}
