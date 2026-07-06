"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

interface Particle {
  baseX: number;
  baseZ: number;
  y: number;
  speed: number;
  phase: number;
  phaseSpeed: number;
  isBlue: boolean;
}

export default function ParticleField({
  count = 300,
  scrollProgress = 0,
}: {
  count?: number;
  scrollProgress?: number;
}) {
  const goldRef = useRef<THREE.InstancedMesh>(null);
  const blueRef = useRef<THREE.InstancedMesh>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      baseX: (Math.random() - 0.5) * 14,
      baseZ: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 8,
      speed: 0.002 + Math.random() * 0.004,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.3 + Math.random() * 0.5,
      isBlue: i % 5 === 0,
    }));
  }, [count]);

  const goldCount = useMemo(() => particles.filter((p) => !p.isBlue).length, [particles]);
  const blueCount = useMemo(() => particles.filter((p) => p.isBlue).length, [particles]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouse.current = {
        x: e.clientX - window.innerWidth / 2,
        y: e.clientY - window.innerHeight / 2,
      };
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  useFrame((state, delta) => {
    const mouseX = mouse.current.x * 0.0015;
    const mouseZ = mouse.current.y * 0.0015;
    const time = state.clock.elapsedTime;
    let gi = 0;
    let bi = 0;

    particles.forEach((particle) => {
      const isLowerHalf = particle.y < 1;
      const windMultiplier = isLowerHalf ? 1 + scrollProgress * 4 : 1;
      particle.y += particle.speed * delta * 60 * windMultiplier;
      particle.phase += particle.phaseSpeed * delta;

      if (particle.y > 5) {
        particle.y = -5;
        particle.baseX = (Math.random() - 0.5) * 14;
        particle.baseZ = (Math.random() - 0.5) * 10;
      }

      const swayX = Math.sin(particle.phase + time * 0.2) * 0.35;
      const swayZ = Math.cos(particle.phase * 0.7 + time * 0.15) * 0.25;

      dummy.position.set(
        particle.baseX + swayX + mouseX,
        particle.y,
        particle.baseZ + swayZ + mouseZ
      );
      dummy.updateMatrix();

      if (particle.isBlue && blueRef.current) {
        blueRef.current.setMatrixAt(bi++, dummy.matrix);
      } else if (goldRef.current) {
        goldRef.current.setMatrixAt(gi++, dummy.matrix);
      }
    });

    if (goldRef.current) {
      goldRef.current.instanceMatrix.needsUpdate = true;
    }
    if (blueRef.current) {
      blueRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh ref={goldRef} args={[undefined, undefined, goldCount]}>
        <sphereGeometry args={[0.018, 6, 6]} />
        <meshBasicMaterial color="#D4A843" transparent opacity={0.7} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={blueRef} args={[undefined, undefined, blueCount]}>
        <sphereGeometry args={[0.014, 6, 6]} />
        <meshBasicMaterial color="#4A90D9" transparent opacity={0.4} depthWrite={false} />
      </instancedMesh>
    </>
  );
}
