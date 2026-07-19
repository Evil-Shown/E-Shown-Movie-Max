"use client";

import { SUBTITLE_LANGUAGES, getSubtitleLanguageLabel } from "@/lib/subtitle-languages";
import type { SubtitleTrackResult } from "@/lib/subtitles-client";
import { useEffect, useMemo, useRef, useState } from "react";

interface PlayerSubtitlePickerProps {
  value: string;
  disabled?: boolean;
  loading?: boolean;
  tracks?: SubtitleTrackResult[];
  autoSinhalaAvailable?: boolean;
  onSearch?: () => void;
  onChange: (languageCode: string) => void;
  onTrackSelect?: (track: SubtitleTrackResult) => void;
}

export default function PlayerSubtitlePicker({
  value,
  disabled = false,
  loading = false,
  tracks = [],
  autoSinhalaAvailable = false,
  onSearch,
  onChange,
  onTrackSelect,
}: PlayerSubtitlePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    onSearch?.();
  }, [open, onSearch]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const activeLabel = value === "off" ? "Subtitles" : getSubtitleLanguageLabel(value);

  const topTracks = useMemo(() => {
    const byLang = new Map<string, SubtitleTrackResult[]>();
    for (const track of tracks) {
      const list = byLang.get(track.language) ?? [];
      list.push(track);
      byLang.set(track.language, list);
    }

    const order = ["si", "en", "ta", "hi", "es", "fr"];
    return order.flatMap((lang) => byLang.get(lang) ?? []).slice(0, 6);
  }, [tracks]);

  const filteredLanguages = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return SUBTITLE_LANGUAGES.filter((lang) => lang.code !== "off");
    return SUBTITLE_LANGUAGES.filter((lang) => {
      if (lang.code === "off") return false;
      return (
        lang.label.toLowerCase().includes(term) ||
        lang.code.toLowerCase().includes(term) ||
        (lang.nativeLabel?.toLowerCase().includes(term) ?? false)
      );
    });
  }, [query]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="pointer-events-auto flex h-10 items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur transition hover:border-[#f4c27a] hover:bg-[#f4c27a] hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-50 sm:h-8"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-3.5 w-3.5"
          aria-hidden
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M7 15h4M13 15h4M7 11h10" />
        </svg>
        <span className="max-w-[110px] truncate">{loading ? "Searching…" : activeLabel}</span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Subtitle search"
          className="absolute left-0 right-auto top-[calc(100%+8px)] z-20 w-[min(92vw,24rem)] overflow-hidden rounded-2xl border border-white/10 bg-[rgba(15,13,11,0.98)] shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur sm:left-auto sm:right-0 sm:w-[22rem]"
        >
          <div className="border-b border-white/8 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                Global subtitle search
              </p>
              {onSearch ? (
                <button
                  type="button"
                  onClick={onSearch}
                  className="rounded-full border border-[#f4c27a]/20 bg-[#f4c27a]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#f4c27a]"
                >
                  Refresh
                </button>
              ) : null}
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-stone-300">
              Sinhala comes first. If native Sinhala is missing, you can use auto-translation from English when
              available.
            </p>
            <div className="mt-3">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search languages..."
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-stone-500 outline-none transition focus:border-[#f4c27a] focus:bg-black/45"
              />
            </div>
          </div>

          <div className="max-h-[24rem] overflow-y-auto p-2">
            <button
              type="button"
              role="option"
              aria-selected={value === "off"}
              onClick={() => {
                onChange("off");
                setOpen(false);
              }}
              className="mb-2 flex w-full items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-left text-sm text-stone-100 transition hover:bg-white/8"
            >
              <span>Off</span>
              {value === "off" ? <span className="text-xs text-[#f4c27a]">✓</span> : null}
            </button>

            {autoSinhalaAvailable ? (
              <button
                type="button"
                role="option"
                aria-selected={value === "si-auto"}
                onClick={() => {
                  onChange("si-auto");
                  setOpen(false);
                }}
                className={`mb-2 flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left text-sm transition ${
                  value === "si-auto"
                    ? "border-[#f4c27a]/35 bg-[#f4c27a]/18 text-[#f4c27a] shadow-[0_0_0_1px_rgba(244,194,122,0.18)]"
                    : "border-[#f4c27a]/20 bg-[#f4c27a]/10 text-[#f4c27a] hover:bg-[#f4c27a]/15"
                }`}
              >
                <span className="flex flex-col">
                  <span>Sinhala (Auto)</span>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[#f7d98f]">
                    Preferred fallback for Sinhala viewers
                  </span>
                </span>
                {value === "si-auto" ? <span className="text-xs">✓</span> : null}
              </button>
            ) : null}

            <div className="mb-2 rounded-xl border border-white/6 bg-white/5 p-2">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                Suggested results
              </p>
              <div className="grid gap-2">
                {topTracks.length ? (
                  topTracks.map((track) => {
                    const active = track.language === value;
                    return (
                      <button
                        key={track.id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          onTrackSelect?.(track);
                          onChange(track.language);
                          setOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                          active ? "bg-[#f4c27a]/15 text-[#f4c27a]" : "bg-black/20 text-stone-100 hover:bg-black/35"
                        }`}
                      >
                        <span className="flex flex-col">
                          <span>{track.label}</span>
                          <span className="text-[10px] uppercase tracking-[0.14em] text-stone-400">
                            {track.language.toUpperCase()} track
                          </span>
                        </span>
                        {active ? <span className="text-xs">✓</span> : null}
                      </button>
                    );
                  })
                ) : (
                  <p className="px-1 py-2 text-sm text-stone-400">
                    No subtitle results yet. Try refreshing or choose a language below.
                  </p>
                )}
              </div>
            </div>

            {filteredLanguages.map((lang) => {
              const active = lang.code === value;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(lang.code);
                    setOpen(false);
                  }}
                  className={`mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                    active ? "bg-[#f4c27a]/15 text-[#f4c27a]" : "bg-white/5 text-stone-200 hover:bg-white/8"
                  }`}
                >
                  <span>{lang.nativeLabel ? `${lang.label} · ${lang.nativeLabel}` : lang.label}</span>
                  {active ? <span className="text-xs">✓</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
