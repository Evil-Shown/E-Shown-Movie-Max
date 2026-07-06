"use client";

import { PROVIDER_LABELS, STREAM_PROVIDERS, type StreamProvider } from "@/lib/providers";
import { useUserLibrary } from "@/components/UserLibraryProvider";

interface ProviderSwitcherProps {
  className?: string;
}

export default function ProviderSwitcher({ className = "" }: ProviderSwitcherProps) {
  const { preferredProvider, setProvider } = useUserLibrary();

  return (
    <div className={className}>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
        Stream Provider
      </label>
      <select
        value={preferredProvider}
        onChange={(e) => setProvider(e.target.value as StreamProvider)}
        className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
      >
        {STREAM_PROVIDERS.map((provider) => (
          <option key={provider} value={provider}>
            {PROVIDER_LABELS[provider]}
          </option>
        ))}
      </select>
    </div>
  );
}
