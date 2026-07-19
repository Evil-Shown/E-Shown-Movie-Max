"use client";

import { Canvas } from "@react-three/fiber";
import dynamic from "next/dynamic";

const ParticleField = dynamic(() => import("./ParticleField"), { ssr: false });

interface HeroParticlesCanvasProps {
  count: number;
  scrollProgress: number;
}

export default function HeroParticlesCanvas({ count, scrollProgress }: HeroParticlesCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ParticleField count={count} scrollProgress={scrollProgress} />
    </Canvas>
  );
}
