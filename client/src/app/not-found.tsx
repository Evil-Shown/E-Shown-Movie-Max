import GlowOrb from "@/components/3d/GlowOrb";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
      <GlowOrb color="rgba(201,168,76,0.2)" size={500} x="20%" y="40%" blur={120} opacity={0.35} />
      <GlowOrb color="rgba(26,143,255,0.15)" size={600} x="80%" y="60%" blur={140} opacity={0.3} />

      <p
        className="font-cinzel text-[10rem] font-bold leading-none sm:text-[15rem]"
        style={{
          background: "linear-gradient(135deg, var(--gold-primary), var(--electric-blue))",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        404
      </p>
      <h1 className="font-cormorant mt-4 text-3xl italic text-[var(--text-primary)]">
        This reel has gone dark.
      </h1>
      <p className="mt-3 max-w-md text-sm text-[var(--text-secondary)]">
        The page you&apos;re looking for doesn&apos;t exist in our catalog.
      </p>
      <Link
        href="/"
        className="font-cinzel mt-10 bg-[var(--gold-primary)] px-8 py-3 text-xs font-bold uppercase tracking-[0.25em] text-black transition hover:bg-[var(--gold-bright)]"
      >
        Return to Main Stage
      </Link>
    </div>
  );
}
