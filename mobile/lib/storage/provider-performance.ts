import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StreamProvider } from '@chithra/core/providers';
import { STREAM_PROVIDERS } from '@chithra/core/providers';

const KEY = 'chithra-provider-performance';

interface ProviderStats {
  avgMs: number;
  samples: number;
  lastMs: number;
  updatedAt: number;
}

type PerformanceStore = Partial<Record<StreamProvider, ProviderStats>>;

async function readStore(): Promise<PerformanceStore> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PerformanceStore;
  } catch {
    return {};
  }
}

async function writeStore(store: PerformanceStore): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(store));
}

// --- In-memory cache -------------------------------------------------
// AsyncStorage is inherently async, but the player needs to read ranked
// providers synchronously during render/effects (matching the web app's
// sync localStorage behavior). This cache is hydrated once at app start
// (see hydratePerformanceCache, called from UserLibraryProvider) and kept
// current by every write below, so reads stay in sync with storage without
// requiring an await at the call site.
let cache: PerformanceStore = {};
let cacheHydrated = false;

export async function hydratePerformanceCache(): Promise<void> {
  cache = await readStore();
  cacheHydrated = true;
}

function rankFromCache(): StreamProvider[] {
  return [...STREAM_PROVIDERS].sort((a, b) => {
    const aMs = cache[a]?.avgMs ?? 12_000;
    const bMs = cache[b]?.avgMs ?? 12_000;
    return aMs - bMs;
  });
}

/** Synchronous — safe to call once hydratePerformanceCache() has resolved. */
export function getRankedProvidersSync(): StreamProvider[] {
  return rankFromCache();
}

/** Synchronous — safe to call once hydratePerformanceCache() has resolved. */
export function getBestProviderSync(preferred: StreamProvider): StreamProvider {
  if (!cacheHydrated) return preferred;
  const preferredStats = cache[preferred];
  const ranked = rankFromCache();
  const best = ranked[0];
  const bestStats = cache[best];

  if (!preferredStats) return preferred;
  if (!bestStats || best === preferred) return preferred;
  if (bestStats.avgMs + 1500 < preferredStats.avgMs) return best;
  return preferred;
}
// -----------------------------------------------------------------------

/** Record how long a provider took to load its embed (lower is better). */
export async function recordProviderLoad(provider: StreamProvider, loadMs: number): Promise<void> {
  const clamped = Math.max(400, Math.min(loadMs, 120_000));
  const store = await readStore();
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
  await writeStore(store);
  cache = store;
}

export async function getProviderPerformance(): Promise<PerformanceStore> {
  return readStore();
}

/** Providers sorted fastest-first using stored load times. */
export async function getRankedProviders(): Promise<StreamProvider[]> {
  const store = await readStore();
  return [...STREAM_PROVIDERS].sort((a, b) => {
    const aMs = store[a]?.avgMs ?? 12_000;
    const bMs = store[b]?.avgMs ?? 12_000;
    return aMs - bMs;
  });
}

export async function getBestProvider(preferred: StreamProvider): Promise<StreamProvider> {
  const store = await readStore();
  const ranked = await getRankedProviders();
  const preferredStats = store[preferred];
  const best = ranked[0];
  const bestStats = store[best];

  if (!preferredStats) return preferred;
  if (!bestStats || best === preferred) return preferred;

  // Switch default only when another provider is clearly faster on this device.
  if (bestStats.avgMs + 1500 < preferredStats.avgMs) return best;
  return preferred;
}
