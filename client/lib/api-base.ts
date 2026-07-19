/**
 * Resolves the backend API base URL for browser + server code.
 *
 * Priority:
 * 1. NEXT_PUBLIC_API_BASE_URL / BACKEND_API_URL (explicit, unless localhost on a live host)
 * 2. Browser on a real host → "" (same-origin `/api/v1/*` proxied by Next rewrite)
 * 3. Server on Vercel/production → Render URL
 * 4. Local → http://localhost:5000
 */
const RENDER_API = "https://chithra-cinema-api.onrender.com";

function isLocalHost(hostname: string): boolean {
  return !hostname || hostname === "localhost" || hostname === "127.0.0.1";
}

function isLocalUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

export function resolveApiBase(): string {
  let fromEnv = (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_GODS_EYE_API_URL ||
    process.env.NEXT_PUBLIC_TBOOM_API_URL ||
    process.env.BACKEND_API_URL ||
    ""
  )
    .trim()
    .replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const onLocalSite = isLocalHost(window.location.hostname);

    // Live site must never keep a baked-in localhost API URL
    if (!onLocalSite && fromEnv && isLocalUrl(fromEnv)) {
      console.warn(
        `[chithra-api] Ignoring localhost API env on ${window.location.host}. Using same-origin /api/v1 proxy → Render.`
      );
      fromEnv = "";
    }

    if (fromEnv) return fromEnv;
    if (!onLocalSite) {
      // Same-origin /api/v1/* → Vercel rewrite → Render
      return "";
    }
    return "http://localhost:5000";
  }

  // Server (SSR / Route Handlers)
  if (fromEnv && !isLocalUrl(fromEnv)) return fromEnv;
  if (fromEnv && isLocalUrl(fromEnv) && (process.env.VERCEL || process.env.NODE_ENV === "production")) {
    return RENDER_API;
  }

  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return RENDER_API;
  }

  return fromEnv || "http://localhost:5000";
}

/** Absolute API URL — never empty. Use when a full URL is required (embeds, external tools). */
export function resolveApiBaseAbsolute(): string {
  const base = resolveApiBase();
  return base || RENDER_API;
}

export const DEFAULT_PRODUCTION_API = RENDER_API;
