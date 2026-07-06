"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";

const ParticleField = dynamic(() => import("./ParticleField"), { ssr: false });

interface HeroParticlesProps {
  scrollProgress?: number;
}

export default function HeroParticles({ scrollProgress = 0 }: HeroParticlesProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(window.innerWidth >= 768 ? 300 : 80);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (count === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[1]">
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          gl={{ antialias: true, alpha: true }}
          style={{ position: "absolute", inset: 0 }}
        >
          <ParticleField count={count} scrollProgress={scrollProgress} />
        </Canvas>
      </Suspense>
    </div>
  );
}
