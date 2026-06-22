import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StreamProvider } from '../providers';
import { STREAM_PROVIDERS } from '../providers';

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
