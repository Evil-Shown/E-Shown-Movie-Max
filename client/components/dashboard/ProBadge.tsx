"use client";

export default function ProBadge({ glow = true }: { glow?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#D4A574] to-[#FFB87A] text-[#3E2723] ${
        glow ? "shadow-[0_0_10px_rgba(212,165,116,0.4)]" : ""
      }`}
    >
      <svg className="w-2.5 h-2.5 fill-[#3E2723]" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      Pro Member
    </span>
  );
}
