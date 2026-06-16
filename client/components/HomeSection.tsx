"use client";

import { ReactNode } from "react";

interface HomeSectionProps {
  className?: string;
  children: ReactNode;
}

export default function HomeSection({ className = "", children }: HomeSectionProps) {
  return (
    <section className={`home-section ${className}`}>
      <div className="mx-auto mb-0 h-px max-w-7xl bg-[var(--divider)]" />
      {children}
    </section>
  );
}
