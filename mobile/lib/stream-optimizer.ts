import { PROVIDER_LABELS, STREAM_PROVIDERS, type StreamProvider } from './providers';
import { getRankedProvidersSync, getBestProviderSync } from './storage/provider-performance';

export { getBestProviderSync as getBestProvider };

export function getProvidersInOrder(current: StreamProvider): StreamProvider[] {
  const ranked = getRankedProvidersSync();
  return [current, ...ranked.filter((provider) => provider !== current)];
}

export function getNextProvider(current: StreamProvider): StreamProvider {
  const order = getProvidersInOrder(current);
  const index = order.indexOf(current);
  return order[(index + 1) % order.length];
}

/**
 * No-op on mobile — the web app's version opens early DOM preconnect/
 * dns-prefetch links to stream hosts before the WebView loads, which has
 * no React Native equivalent (there's no document.head to attach link
 * tags to). Kept as a function so call sites don't need special-casing.
 */
export function warmStreamProviders(_providers: StreamProvider[] = STREAM_PROVIDERS): void {
  // intentionally empty on mobile
}

/**
 * No-op on mobile — react-native NetInfo could provide a real signal here
 * (connection.type / isConnectionExpensive), but that's a separate
 * dependency; for now this always reports a normal connection, matching
 * the web app's safe fallback when `navigator.connection` is unavailable.
 */
export function isSlowConnection(): boolean {
  return false;
}

export function getStreamLoadTimeoutMs(): number {
  return isSlowConnection() ? 6500 : 9000;
}

export function getStabilityTip(): string | null {
  if (isSlowConnection()) {
    return 'Slow connection detected — we’ll auto-pick the fastest stream source for you.';
  }
  return null;
}

export function formatProviderSwitchMessage(next: StreamProvider): string {
  return `Switching to ${PROVIDER_LABELS[next]} for a smoother stream…`;
}
