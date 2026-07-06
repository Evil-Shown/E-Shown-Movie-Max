"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

interface HomeSectionProps {
  className?: string;
  children: ReactNode;
}

export default function HomeSection({ className = "", children }: HomeSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      className={`home-section ${className}`}
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.98 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="mx-auto mb-0 h-px max-w-7xl origin-left bg-[var(--divider)]"
        initial={prefersReducedMotion ? false : { scaleX: 0 }}
        whileInView={prefersReducedMotion ? undefined : { scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
      {children}
    </motion.section>
  );
}
