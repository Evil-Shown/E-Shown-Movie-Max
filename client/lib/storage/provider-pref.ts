import type { StreamProvider } from "@/lib/providers";
import { DEFAULT_STREAM_PROVIDER, STREAM_PROVIDERS } from "@/lib/providers";

const KEY = "chithra-stream-provider";
const LEGACY_PROVIDERS = new Set(["embedsu"]);

export function getPreferredProvider(): StreamProvider {
  if (typeof window === "undefined") return DEFAULT_STREAM_PROVIDER;
  const stored = localStorage.getItem(KEY);
  if (stored && STREAM_PROVIDERS.includes(stored as StreamProvider)) {
    return stored as StreamProvider;
  }
  if (stored && LEGACY_PROVIDERS.has(stored)) {
    localStorage.setItem(KEY, DEFAULT_STREAM_PROVIDER);
  }
  return DEFAULT_STREAM_PROVIDER;
}

export function setPreferredProvider(provider: StreamProvider) {
  localStorage.setItem(KEY, provider);
}
