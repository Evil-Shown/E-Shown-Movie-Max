"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";

const ParticleField = dynamic(() => import("./ParticleField"), { ssr: false });

export default function HeroParticles() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(window.innerWidth >= 768);
    const onResize = () => setShow(window.innerWidth >= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!show) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[1]">
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          gl={{ antialias: true, alpha: true }}
          style={{ position: "absolute", inset: 0 }}
        >
          <ParticleField />
        </Canvas>
      </Suspense>
    </div>
  );
}
