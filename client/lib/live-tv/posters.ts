import type { LiveTvChannel } from "./types";

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pick<T>(items: T[], indexSeed: number): T {
  return items[indexSeed % items.length];
}

function getCategoryPalette(channel: LiveTvChannel) {
  switch (channel.category) {
    case "news":
      return {
        base: ["#06111f", "#0b1e34", "#12335f"],
        accent: ["rgba(56, 189, 248, 0.42)", "rgba(59, 130, 246, 0.26)"],
        overlay:
          "radial-gradient(circle at 20% 25%, rgba(148, 163, 184, 0.18), transparent 22%), radial-gradient(circle at 78% 18%, rgba(96, 165, 250, 0.18), transparent 20%), linear-gradient(160deg, rgba(6, 11, 31, 0.05), rgba(6, 11, 31, 0.78) 72%, rgba(2, 6, 23, 0.96) 100%)",
        texture:
          "radial-gradient(circle at 30% 38%, rgba(255,255,255,0.08) 0 1px, transparent 1.5px), linear-gradient(90deg, rgba(148,163,184,0.06) 0 1px, transparent 1px)",
      };
    case "kids":
      return {
        base: ["#2b124c", "#7c3aed", "#ec4899"],
        accent: ["rgba(253, 224, 71, 0.34)", "rgba(34, 211, 238, 0.28)"],
        overlay:
          "radial-gradient(circle at 18% 20%, rgba(255, 255, 255, 0.22), transparent 16%), radial-gradient(circle at 78% 24%, rgba(255, 255, 255, 0.12), transparent 12%), linear-gradient(180deg, rgba(255,255,255,0.04), rgba(2,6,23,0.76) 78%, rgba(2,6,23,0.94) 100%)",
        texture:
          "radial-gradient(circle at 24% 30%, rgba(255,255,255,0.18) 0 2px, transparent 2.5px), radial-gradient(circle at 70% 18%, rgba(255,255,255,0.10) 0 1.5px, transparent 2px)",
      };
    case "sports":
      return {
        base: ["#2b0b0b", "#7f1d1d", "#ea580c"],
        accent: ["rgba(248, 113, 113, 0.42)", "rgba(245, 158, 11, 0.3)"],
        overlay:
          "radial-gradient(circle at 48% 22%, rgba(255,255,255,0.14), transparent 16%), radial-gradient(circle at 20% 74%, rgba(255,255,255,0.07), transparent 18%), linear-gradient(180deg, rgba(255,255,255,0.03), rgba(2,6,23,0.74) 72%, rgba(2,6,23,0.94) 100%)",
        texture:
          "repeating-linear-gradient(115deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 16px)",
      };
    case "entertainment":
      return {
        base: ["#18051d", "#4c1d95", "#be185d"],
        accent: ["rgba(236, 72, 153, 0.42)", "rgba(168, 85, 247, 0.3)"],
        overlay:
          "radial-gradient(circle at 52% 18%, rgba(255,255,255,0.16), transparent 14%), radial-gradient(circle at 22% 64%, rgba(255,255,255,0.07), transparent 18%), linear-gradient(180deg, rgba(255,255,255,0.02), rgba(2,6,23,0.76) 72%, rgba(2,6,23,0.95) 100%)",
        texture:
          "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.14) 0 1.5px, transparent 2px), radial-gradient(circle at 72% 40%, rgba(255,255,255,0.09) 0 1px, transparent 1.5px)",
      };
    case "documentary":
      return {
        base: ["#06211c", "#0f3d35", "#a16207"],
        accent: ["rgba(20, 184, 166, 0.4)", "rgba(245, 158, 11, 0.24)"],
        overlay:
          "radial-gradient(circle at 22% 28%, rgba(255,255,255,0.10), transparent 18%), radial-gradient(circle at 72% 16%, rgba(255,255,255,0.08), transparent 14%), linear-gradient(180deg, rgba(255,255,255,0.03), rgba(2,6,23,0.76) 72%, rgba(2,6,23,0.94) 100%)",
        texture:
          "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 18px)",
      };
    default:
      return {
        base: ["#111111", "#1f2937", "#7c2d12"],
        accent: ["rgba(217, 119, 6, 0.35)", "rgba(148, 163, 184, 0.18)"],
        overlay:
          "radial-gradient(circle at 20% 24%, rgba(255,255,255,0.10), transparent 18%), radial-gradient(circle at 82% 18%, rgba(255,255,255,0.06), transparent 14%), linear-gradient(180deg, rgba(255,255,255,0.02), rgba(2,6,23,0.78) 72%, rgba(2,6,23,0.96) 100%)",
        texture:
          "radial-gradient(circle at 32% 38%, rgba(255,255,255,0.08) 0 1px, transparent 1.5px), radial-gradient(circle at 72% 22%, rgba(255,255,255,0.05) 0 1px, transparent 1.5px)",
      };
  }
}

export function getChannelPosterStyles(channel: LiveTvChannel) {
  const seed = hashString(channel.id);
  const palette = getCategoryPalette(channel);
  const angle = 120 + (seed % 110);
  const highlightX = 18 + (seed % 54);
  const highlightY = 12 + ((seed >> 3) % 34);
  const secondaryX = 68 + ((seed >> 5) % 22);
  const secondaryY = 22 + ((seed >> 7) % 36);
  const baseA = pick(palette.base, seed);
  const baseB = pick(palette.base, seed >> 2);
  const baseC = pick(palette.base, seed >> 4);
  const accentA = pick(palette.accent, seed);
  const accentB = pick(palette.accent, seed >> 1);

  return {
    backgroundColor: baseA,
    backgroundImage: [
      `radial-gradient(circle at ${highlightX}% ${highlightY}%, ${accentA}, transparent 28%)`,
      `radial-gradient(circle at ${secondaryX}% ${secondaryY}%, ${accentB}, transparent 22%)`,
      `linear-gradient(${angle}deg, ${baseA} 0%, ${baseB} 44%, ${baseC} 100%)`,
      palette.texture,
      palette.overlay,
    ].join(", "),
  };
}
