"use client";

import { useReducedMotion } from "framer-motion";
import { ReactNode, useRef, useState } from "react";

interface FloatingCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

export default function FloatingCard({
  children,
  className = "",
  maxTilt = 12,
}: FloatingCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (prefersReducedMotion || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = ((y - centerY) / centerY) * -maxTilt;
    const tiltY = ((x - centerX) / centerX) * maxTilt;

    setTilt({ x: tiltX, y: tiltY });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{ perspective: "1000px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        style={{
          transform: prefersReducedMotion
            ? undefined
            : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(8px)`,
          transformStyle: "preserve-3d",
          transition: prefersReducedMotion ? undefined : "transform 0.12s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}
