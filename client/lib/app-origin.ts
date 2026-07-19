/**
 * Public site origin for OAuth redirects and absolute client links.
 * Never returns localhost when the user is already on a live host.
 */
const PRODUCTION_APP = "https://chithracinema.vercel.app";

function isLocalHost(hostname: string): boolean {
  return !hostname || hostname === "localhost" || hostname === "127.0.0.1";
}

function isLocalUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

export function getPublicAppOrigin(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_APP_URL || "").trim().replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const { protocol, hostname, origin } = window.location;
    if (!isLocalHost(hostname)) {
      return origin;
    }
    // Local browser: allow env override to a production app for OAuth testing
    if (fromEnv && !isLocalUrl(fromEnv)) return fromEnv;
    return origin || `${protocol}//${hostname}`;
  }

  if (fromEnv && !isLocalUrl(fromEnv)) return fromEnv;
  if (process.env.VERCEL || process.env.NODE_ENV === "production") return PRODUCTION_APP;
  return fromEnv || "http://localhost:3000";
}

export const DEFAULT_PRODUCTION_APP = PRODUCTION_APP;
