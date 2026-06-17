/** Central branding — CHITHRA — CINEMA (චිත්‍ර — Cinema) */

export const BRAND_NAME = "CHITHRA — CINEMA";
export const BRAND_NAME_PLAIN = "CHITHRA - CINEMA";
export const BRAND_NAME_SINHALA = "චිත්‍ර — Cinema";
export const BRAND_SHORT = "CHITHRA";

export const BRAND_DEVELOPER = "Damitha Samarakoon";

export const BRAND_TAGLINE =
  "Sri Lanka's home for films, series, and unlimited entertainment.";

export const BRAND_DESCRIPTION =
  "Stream, discover, and enjoy films and series on CHITHRA — CINEMA (චිත්‍ර — Cinema). Trending hits, timeless classics, and The God's Eye upload search.";

export function brandPageTitle(pageTitle?: string): string {
  return pageTitle ? `${pageTitle} | ${BRAND_NAME}` : BRAND_NAME;
}
