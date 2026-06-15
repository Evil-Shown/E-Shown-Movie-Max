interface GlowOrbProps {
  color?: string;
  size?: number;
  x?: string;
  y?: string;
  blur?: number;
  opacity?: number;
  animationDelay?: string;
  className?: string;
}

export default function GlowOrb({
  color = "rgba(201,168,76,0.35)",
  size = 320,
  x = "50%",
  y = "50%",
  blur = 80,
  opacity = 0.6,
  animationDelay = "0s",
  className = "",
}: GlowOrbProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute animate-float ${className}`}
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
        animationDelay,
        opacity,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: `blur(${blur}px)`,
      }}
    />
  );
}
