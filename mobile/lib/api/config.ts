import Constants from "expo-constants";

const ALLOW_HTTP_IN_DEV = typeof __DEV__ !== "undefined" && __DEV__;

function resolveApiBaseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL;

  if (explicit) {
    const url = explicit.replace(/\/$/, "");

    if (url.startsWith("http://")) {
      if (!ALLOW_HTTP_IN_DEV) {
        throw new Error(
          "[CHITHRA] EXPO_PUBLIC_API_URL uses HTTP, which is insecure in production. " +
            "Set EXPO_PUBLIC_API_URL to an HTTPS URL, or omit it to use auto-detection in development."
        );
      }
      // Allowed only in dev mode — Metro dev server on LAN
      return url;
    }

    return url;
  }

  // Auto-detect from Expo dev server (LAN — dev only)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    if (host) {
      return `http://${host}:3000`;
    }
  }

  if (!ALLOW_HTTP_IN_DEV) {
    throw new Error(
      "[CHITHRA] No EXPO_PUBLIC_API_URL configured. " +
        "Set EXPO_PUBLIC_API_URL to the HTTPS URL of your production API server."
    );
  }

  // Dev-only fallback for simulator
  return "http://localhost:3000";
}

export const API_BASE_URL = resolveApiBaseUrl();
