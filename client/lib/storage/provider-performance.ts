import type { StreamProvider } from "@/lib/providers";
import { STREAM_PROVIDERS } from "@/lib/providers";

const KEY = "chithra-provider-performance";

interface ProviderStats {
  avgMs: number;
  samples: number;
  lastMs: number;
  updatedAt: number;
}

type PerformanceStore = Partial<Record<StreamProvider, ProviderStats>>;

function readStore(): PerformanceStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PerformanceStore;
  } catch {
    return {};
  }
}

function writeStore(store: PerformanceStore) {
  localStorage.setItem(KEY, JSON.stringify(store));
}

/** Record how long a provider took to load its embed (lower is better). */
export function recordProviderLoad(provider: StreamProvider, loadMs: number) {
  if (typeof window === "undefined") return;
  const clamped = Math.max(400, Math.min(loadMs, 120_000));
  const store = readStore();
  const prev = store[provider];
  const samples = (prev?.samples ?? 0) + 1;
  const weight = Math.min(samples, 8);
  const avgMs = prev ? (prev.avgMs * (weight - 1) + clamped) / weight : clamped;

  store[provider] = {
    avgMs: Math.round(avgMs),
    samples,
    lastMs: Math.round(clamped),
    updatedAt: Date.now(),
  };
  writeStore(store);
}

export function getProviderPerformance(): PerformanceStore {
  return readStore();
}

/** Record a failed or blocked playback attempt so we rank this provider lower. */
export function recordProviderFailure(provider: StreamProvider) {
  recordProviderLoad(provider, 90_000);
}

/** Providers sorted fastest-first; flaky hosts deprioritized. */
export function getRankedProviders(): StreamProvider[] {
  const store = readStore();
  const penalty: Partial<Record<StreamProvider, number>> = {
    vidsrc: 10_000,
    vidsrcpm: 6_000,
  };
  return [...STREAM_PROVIDERS].sort((a, b) => {
    const aMs = (store[a]?.avgMs ?? 12_000) + (penalty[a] ?? 0);
    const bMs = (store[b]?.avgMs ?? 12_000) + (penalty[b] ?? 0);
    return aMs - bMs;
  });
}

export function getBestProvider(preferred: StreamProvider): StreamProvider {
  const ranked = getRankedProviders();
  const preferredStats = readStore()[preferred];
  const best = ranked[0];
  const bestStats = readStore()[best];

  if (!preferredStats) return preferred;
  if (!bestStats || best === preferred) return preferred;

  // Switch default only when another provider is clearly faster on this device.
  if (bestStats.avgMs + 1500 < preferredStats.avgMs) return best;
  return preferred;
}
