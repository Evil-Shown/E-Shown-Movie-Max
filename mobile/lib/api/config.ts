import Constants from 'expo-constants';

/**
 * Resolves the API base URL (shared with the web/desktop client).
 *
 * Priority:
 *  1. EXPO_PUBLIC_API_URL — explicit override, set this for production
 *     (e.g. your deployed Vercel URL) or if auto-detection ever picks the
 *     wrong network interface.
 *  2. Auto-detected from Expo's dev server connection (Constants.expoConfig
 *     .hostUri gives the same LAN IP:port Metro is already using — no need
 *     to hardcode or manually look up your PC's IP).
 *  3. Falls back to localhost, which only works in a web/simulator context
 *     on the same machine as the backend, never on a physical phone.
 */
function resolveApiBaseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) return `http://${host}:3000`;
  }

  return 'http://localhost:3000';
}

export const API_BASE_URL = resolveApiBaseUrl();
