"use client";

import { useMemo } from "react";

export default function CinematicGrain() {
  const filterId = useMemo(() => "cinematic-grain-filter", []);

  return (
    <svg
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[999] h-full w-full opacity-[0.025]"
    >
      <defs>
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch">
            <animate
              attributeName="baseFrequency"
              dur="12s"
              values="0.75;0.85;0.75"
              repeatCount="indefinite"
            />
          </feTurbulence>
        </filter>
      </defs>
      <rect width="100%" height="100%" filter={`url(#${filterId})`} />
    </svg>
  );
}
