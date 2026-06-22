"use client";

import { memo, useRef } from "react";
import { LIVE_TV_CATEGORY_LABELS } from "@/lib/live-tv/channels";
import { prefetchChannelStream } from "@/lib/live-tv/stream-cache";
import { getStreamForChannel } from "@/lib/live-tv/streams";
import type { LiveTvChannel } from "@/lib/live-tv/types";
import ChannelLogo from "@/components/live-tv/ChannelLogo";

interface LiveTvChannelCardProps {
  channel: LiveTvChannel;
  isSelected?: boolean;
  isFavorite?: boolean;
  compact?: boolean;
  priorityLogo?: boolean;
  onSelect: (channel: LiveTvChannel) => void;
  onToggleFavorite?: (channel: LiveTvChannel) => void;
}

function LiveTvChannelCard({
  channel,
  isSelected = false,
  isFavorite = false,
  compact = false,
  priorityLogo = false,
  onSelect,
  onToggleFavorite,
}: LiveTvChannelCardProps) {
  const hasStream = Boolean(channel.stream ?? getStreamForChannel(channel.id));
  const cardRef = useRef<HTMLButtonElement>(null);
  const moveRafRef = useRef<number | null>(null);

  const setCardMotion = (clientX: number, clientY: number, active: number) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width - 0.5) * 2;
    const py = ((clientY - rect.top) / rect.height - 0.5) * 2;
    const clamp = (value: number) => Math.max(-1, Math.min(1, value));
    const x = clamp(px);
    const y = clamp(py);

    const tx = x * 10;
    const ty = y * 10;
    const rx = -y * 8;
    const ry = x * 8;

    card.style.setProperty("--card-tx", `${tx.toFixed(2)}px`);
    card.style.setProperty("--card-ty", `${ty.toFixed(2)}px`);
    card.style.setProperty("--card-rx", `${rx.toFixed(2)}deg`);
    card.style.setProperty("--card-ry", `${ry.toFixed(2)}deg`);
    card.style.setProperty("--card-scale", active ? "1.03" : "1");
    card.style.setProperty("--card-glow-opacity", active ? "1" : "0");
    card.style.setProperty("--card-glow-strength", active ? "0.92" : "0");
    card.style.setProperty("--card-shine-opacity", active ? "1" : "0");
    card.style.setProperty("--card-spot-x", `${(x * 50 + 50).toFixed(2)}%`);
    card.style.setProperty("--card-spot-y", `${(y * 50 + 50).toFixed(2)}%`);
    card.style.setProperty("--card-spot-opacity", active ? "1" : "0");
  };

  const scheduleCardMotion = (clientX: number, clientY: number) => {
    if (moveRafRef.current !== null) cancelAnimationFrame(moveRafRef.current);
    moveRafRef.current = requestAnimationFrame(() => {
      setCardMotion(clientX, clientY, 1);
      moveRafRef.current = null;
    });
  };

  const resetCardMotion = () => {
    if (moveRafRef.current !== null) cancelAnimationFrame(moveRafRef.current);
    moveRafRef.current = null;
    setCardMotion(0, 0, 0);
  };

  return (
    <button
      type="button"
      ref={cardRef}
      onClick={() => onSelect(channel)}
      onMouseEnter={() => prefetchChannelStream(channel.id)}
      onFocus={() => prefetchChannelStream(channel.id)}
      onPointerEnter={(e) => setCardMotion(e.clientX, e.clientY, 1)}
      onPointerMove={(e) => scheduleCardMotion(e.clientX, e.clientY)}
      onPointerLeave={resetCardMotion}
      onPointerCancel={resetCardMotion}
      className={`group relative flex w-full flex-col overflow-hidden rounded-xl border text-left transition-all duration-200 ${
        compact ? "min-w-[128px]" : ""
      } ${
        isSelected
          ? "gold-glow border-[var(--accent-primary)] bg-[var(--bg-card)]"
          : "border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]"
      }`}
      aria-pressed={isSelected}
      aria-label={`Watch ${channel.name}`}
      style={{
        transformStyle: "preserve-3d",
        transform:
          "perspective(1100px) translate3d(var(--card-tx, 0px), var(--card-ty, 0px), 0) rotateX(var(--card-rx, 0deg)) rotateY(var(--card-ry, 0deg)) scale(var(--card-scale, 1))",
        transformOrigin: "center",
        willChange: "transform, box-shadow, border-color",
        transition:
          "transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 400ms cubic-bezier(0.2, 0.8, 0.2, 1), border-color 400ms ease",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
        style={{
          opacity: "var(--card-glow-opacity, 0)",
          background:
            "radial-gradient(circle at 50% 38%, rgba(217, 119, 6, 0.36), rgba(245, 158, 11, 0.18) 36%, rgba(234, 88, 12, 0.08) 58%, transparent 74%)",
          transform:
            "translate3d(calc(var(--card-tx, 0px) * 0.35), calc(var(--card-ty, 0px) * 0.35), 0) scale(var(--card-glow-strength, 0))",
          transformOrigin: "center",
          willChange: "transform, opacity",
          mixBlendMode: "screen",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out"
        style={{
          opacity: "var(--card-spot-opacity, 0)",
          background:
            "radial-gradient(circle at var(--card-spot-x, 50%) var(--card-spot-y, 38%), rgba(245,158,11,0.18), transparent 45%)",
          mixBlendMode: "screen",
          willChange: "background, opacity",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
        style={{
          opacity: "calc(var(--card-shine-opacity, 0) * 0.08)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 18%, transparent 34%, transparent 64%, rgba(255,255,255,0.08) 84%, rgba(255,255,255,0.14) 100%)",
          transform:
            "translate3d(calc(var(--card-tx, 0px) * -0.14), calc(var(--card-ty, 0px) * -0.14), 0)",
          willChange: "transform, opacity",
        }}
      />

      {/* Logo stage â€” matches hero featured tiles */}
      <div
        className={`relative flex w-full items-center justify-center bg-[var(--bg-secondary)] transition-transform duration-300 ease-out ${
          compact ? "aspect-square p-3" : "aspect-[4/3] p-4 sm:p-5"
        }`}
        style={{
          transform:
            "translate3d(calc(var(--card-tx, 0px) * -0.18), calc(var(--card-ty, 0px) * -0.28), 0)",
          willChange: "transform",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(circle at 50% 38%, rgba(201, 106, 43, 0.1), transparent 52%)",
          }}
        />

        <div
          className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-card)] shadow-sm transition-transform duration-300 ease-out ${
            compact ? "size-12" : "size-14 sm:size-16"
          }`}
          style={{
            transform:
              "translate3d(calc(var(--card-tx, 0px) * 0.5), calc(var(--card-ty, 0px) * -0.08), 0)",
            willChange: "transform",
          }}
        >
          <ChannelLogo
            channel={channel}
            variant="tile"
            priority={priorityLogo || isSelected}
            className={compact ? "size-9" : "size-10 sm:size-11"}
          />
        </div>

        <span
          className={`absolute right-2 top-2 h-1.5 w-1.5 rounded-full ring-2 ring-[var(--bg-secondary)] ${
            hasStream ? "bg-emerald-500" : "bg-amber-400"
          }`}
          title={hasStream ? "Stream ready" : "Resolves on play"}
          aria-hidden
          style={{
            transform:
              "translate3d(calc(var(--card-tx, 0px) * 0.75), calc(var(--card-ty, 0px) * -0.08), 0)",
            willChange: "transform",
          }}
        />

        {channel.isHd && (
          <span className="absolute left-2 top-2 rounded border border-[var(--border)] bg-[var(--bg-card)]/95 px-1 py-px text-[7px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            HD
          </span>
        )}

        {isSelected && (
          <span
            className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--accent-primary)] px-2 py-px text-[7px] font-bold uppercase tracking-wider text-[var(--text-inverse)]"
            style={{
              transform:
                "translate3d(calc(-50% + var(--card-tx, 0px) * 0.9), calc(var(--card-ty, 0px) * -0.12), 0)",
              willChange: "transform",
            }}
          >
            Live
          </span>
        )}

        {onToggleFavorite && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(channel);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite(channel);
              }
            }}
            aria-label={
              isFavorite
                ? `Remove ${channel.name} from favorites`
                : `Add ${channel.name} to favorites`
            }
            className={`absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
              isFavorite
                ? "border-[var(--accent-primary)] bg-[var(--gold-dim)] text-[var(--accent-primary)] opacity-100"
                : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] opacity-0 shadow-sm group-hover:opacity-100 hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
            }`}
            style={{
              transform:
                "translate3d(calc(var(--card-tx, 0px) * 0.62), calc(var(--card-ty, 0px) * -0.12), 0)",
              willChange: "transform, opacity",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-3 w-3"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </span>
        )}
      </div>

      <div
        className={`border-t border-[var(--border)] bg-[var(--bg-card)] ${
          compact ? "px-2 py-1.5" : "px-2.5 py-2"
        }`}
      >
        <h3
          className={`truncate font-medium leading-tight text-[var(--text-primary)] ${
            compact ? "text-[10px]" : "text-xs sm:text-[13px]"
          }`}
        >
          {channel.name}
        </h3>
        <p className="mt-0.5 truncate text-[9px] text-[var(--text-muted)]">
          {LIVE_TV_CATEGORY_LABELS[channel.category]}
          {channel.region === "local" ? " Â· LK" : ""}
        </p>
      </div>
    </button>
  );
}

export default memo(LiveTvChannelCard);
