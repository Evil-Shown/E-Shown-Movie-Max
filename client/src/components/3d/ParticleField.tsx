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
}

interface ParticlesProps {
  count: number;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}

function Particles({ count, mouse }: ParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, () => ({
      baseX: (Math.random() - 0.5) * 14,
      baseZ: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 8,
      speed: 0.002 + Math.random() * 0.004,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.3 + Math.random() * 0.5,
    }));
  }, [count]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const mouseX = mouse.current.x * 0.0015;
    const mouseZ = mouse.current.y * 0.0015;
    const time = state.clock.elapsedTime;

    particles.forEach((particle, i) => {
      particle.y += particle.speed * delta * 60;
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
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.018, 6, 6]} />
      <meshBasicMaterial color="#C9A84C" transparent opacity={0.8} depthWrite={false} />
    </instancedMesh>
  );
}

export default function ParticleField() {
  const mouse = useRef({ x: 0, y: 0 });

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

  return <Particles count={300} mouse={mouse} />;
}
