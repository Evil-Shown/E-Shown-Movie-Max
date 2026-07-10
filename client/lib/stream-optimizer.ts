import { PROVIDER_LABELS, STREAM_PROVIDERS, type StreamProvider } from "@/lib/providers";
import { getRankedProviders } from "@/lib/storage/provider-performance";

export const PROVIDER_ORIGINS: Record<StreamProvider, string[]> = {
  vidfast: ["https://vidfast.pro"],
  vidlink: ["https://vidlink.pro"],
  superembed: ["https://multiembed.mov"],
  autoembed: ["https://autoembed.co"],
  vidsrcpm: ["https://vidsrc.pm"],
  vidsrc: ["https://vidsrc.cc"],
};

const warmedOrigins = new Set<string>();

export function isSlowConnection(): boolean {
  if (typeof navigator === "undefined") return false;
  const connection = (
    navigator as Navigator & {
      connection?: {
        saveData?: boolean;
        effectiveType?: string;
        downlink?: number;
      };
    }
  ).connection;

  if (!connection) return false;
  if (connection.saveData) return true;
  if (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g") return true;
  if (typeof connection.downlink === "number" && connection.downlink > 0 && connection.downlink < 1.5) {
    return true;
  }
  return false;
}

export function getStreamLoadTimeoutMs(provider?: StreamProvider): number {
  const base = isSlowConnection() ? 14_000 : 10_000;
  if (provider === "vidsrc" || provider === "vidsrcpm") {
    return isSlowConnection() ? 12_000 : 8_000;
  }
  return base;
}

/** How long to wait after iframe shell loads before switching if playback never starts. */
export function getPlaybackConfirmTimeoutMs(): number {
  return isSlowConnection() ? 28_000 : 16_000;
}

/** Warm only the fastest providers on slow links to avoid connection churn. */
export function warmStreamProvidersForPlayback() {
  const providers = isSlowConnection() ? getRankedProviders().slice(0, 2) : getRankedProviders().slice(0, 4);
  warmStreamProviders(providers);
}

export function getProvidersInOrder(current: StreamProvider): StreamProvider[] {
  const ranked = getRankedProviders();
  return [current, ...ranked.filter((provider) => provider !== current)];
}

export function getNextProvider(current: StreamProvider): StreamProvider {
  const order = getProvidersInOrder(current);
  const index = order.indexOf(current);
  return order[(index + 1) % order.length];
}

/** Open early connections to stream hosts before the iframe loads. */
export function warmStreamProviders(providers: StreamProvider[] = STREAM_PROVIDERS) {
  if (typeof document === "undefined") return;

  for (const provider of providers) {
    for (const origin of PROVIDER_ORIGINS[provider]) {
      if (warmedOrigins.has(origin)) continue;
      warmedOrigins.add(origin);

      const preconnect = document.createElement("link");
      preconnect.rel = "preconnect";
      preconnect.href = origin;
      preconnect.crossOrigin = "anonymous";
      document.head.appendChild(preconnect);

      const dns = document.createElement("link");
      dns.rel = "dns-prefetch";
      dns.href = origin;
      document.head.appendChild(dns);
    }
  }
}

export function getStabilityTip(): string | null {
  if (isSlowConnection()) {
    return "Slow connection — give the stream a moment to buffer. We'll only switch sources if nothing loads.";
  }
  return null;
}

export function formatProviderSwitchMessage(next: StreamProvider): string {
  return `Blocked or empty on this host — switching to ${PROVIDER_LABELS[next]}…`;
}

import { isEmbedPlaybackStarted } from "@/lib/embed-events";

/** True when an embed player reports playback started (VidSrc family). */
export function isEmbedPlaybackMessage(data: unknown): boolean {
  return isEmbedPlaybackStarted(data);
}
