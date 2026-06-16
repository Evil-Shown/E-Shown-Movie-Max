import type { StreamProvider } from "@/lib/providers";

const KEY = "chithra-stream-provider";

export function getPreferredProvider(): StreamProvider {
  if (typeof window === "undefined") return "vidsrc";
  const stored = localStorage.getItem(KEY);
  if (stored === "vidsrc" || stored === "vidlink" || stored === "superembed" || stored === "embedsu") {
    return stored;
  }
  return "vidsrc";
}

export function setPreferredProvider(provider: StreamProvider) {
  localStorage.setItem(KEY, provider);
}
