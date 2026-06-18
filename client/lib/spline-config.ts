/** Published Spline 3D carousel for CHITHRA desktop startup splash. */
export const SPLINE_STARTUP_SCENE_URL =
  process.env.NEXT_PUBLIC_SPLINE_STARTUP_SCENE?.trim() ||
  "https://my.spline.design/3dcarouselcopycopy-EERZuWzvfxto5y6qXs6oUfkQ-545/";

/** Cinema intro — each phase gets more time than the browser-only intro. */
export const CINEMA_INTRO_PHASE2_MS = 4000;
export const CINEMA_INTRO_PHASE3_MS = 9000;
/** Cinema intro finishes (phase 3 ends, crossfade begins). */
export const CINEMA_INTRO_TOTAL_MS = 13000;

/** How long the 3D scene plays after the cinema intro (ms). */
export const SPLINE_STARTUP_DURATION_MS = 10000;

/** Crossfade from cinema intro into the 3D scene (ms). */
export const SPLINE_STAGE_TRANSITION_MS = 1000;

/** Fade out when the whole startup sequence ends (ms). */
export const SPLINE_STARTUP_FADE_MS = 650;

const PLACEHOLDER_HINTS = ["your-scene", "YOUR-ID", "example.com"];

export function isSplineProdSceneUrl(url: string): boolean {
  return url.includes("prod.spline.design") && url.includes("scene.splinecode");
}

export function isSplineMyDesignUrl(url: string): boolean {
  return url.includes("my.spline.design");
}

/** True when env points at a real scene (not docs/placeholder text). */
export function hasValidSplineStartupUrl(url: string = SPLINE_STARTUP_SCENE_URL): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (PLACEHOLDER_HINTS.some((hint) => lower.includes(hint))) return false;
  return isSplineProdSceneUrl(url) || isSplineMyDesignUrl(url);
}

/** Total desktop startup duration when both cinema + 3D play. */
export function desktopStartupTotalMs(includeSpline: boolean): number {
  if (!includeSpline) return CINEMA_INTRO_TOTAL_MS + SPLINE_STARTUP_FADE_MS;
  return (
    CINEMA_INTRO_TOTAL_MS +
    SPLINE_STAGE_TRANSITION_MS +
    SPLINE_STARTUP_DURATION_MS +
    SPLINE_STARTUP_FADE_MS
  );
}

/** 3D-only splash on repeat desktop launches (no cinema intro). */
export function desktopSplineOnlyTotalMs(): number {
  return SPLINE_STARTUP_DURATION_MS + SPLINE_STARTUP_FADE_MS;
}
