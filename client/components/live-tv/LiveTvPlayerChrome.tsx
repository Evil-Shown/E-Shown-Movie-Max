"use client";

import type { ReactNode } from "react";
import type { LiveTvChannel } from "@/lib/live-tv/types";
import ChannelLogo from "@/components/live-tv/ChannelLogo";

interface LiveTvPlayerChromeProps {
  channel: LiveTvChannel;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isLoading: boolean;
  canSeek: boolean;
  atLiveEdge: boolean;
  seekProgress: number;
  showControls: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onVolumeChange: (v: number) => void;
  onSeek: (progress: number) => void;
  onGoLive: () => void;
  onRewind: (seconds: number) => void;
  onFullscreen: () => void;
}

function ControlButton({
  onClick,
  label,
  children,
  active = false,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
        active
          ? "bg-white/20 text-white"
          : "text-white/80 hover:bg-white/15 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export default function LiveTvPlayerChrome({
  channel,
  isPlaying,
  isMuted,
  volume,
  isLoading,
  canSeek,
  atLiveEdge,
  seekProgress,
  showControls,
  onTogglePlay,
  onToggleMute,
  onVolumeChange,
  onSeek,
  onGoLive,
  onRewind,
  onFullscreen,
}: LiveTvPlayerChromeProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${
        showControls || isLoading ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Top fade — channel identity */}
      <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 via-black/20 to-transparent px-5 pb-16 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/15 bg-black/30 backdrop-blur-md">
            <ChannelLogo channel={channel} variant="clean" className="h-full w-full" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-[var(--font-playfair)] text-base font-bold text-white sm:text-lg">
              {channel.name}
            </p>
            <p className="truncate text-[11px] text-white/55">
              {channel.region === "local" ? "Sri Lanka" : "International"}
              {channel.isHd ? " · HD" : ""}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {isLoading ? (
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/70 backdrop-blur-sm">
                Connecting…
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-red-900/30">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden />
                Live
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="pointer-events-auto bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-12 sm:px-5 sm:pb-5">
        {/* DVR scrub bar — no time labels */}
        {canSeek && (
          <div className="mb-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onGoLive}
              className={`shrink-0 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
                atLiveEdge
                  ? "bg-red-600 text-white shadow-md shadow-red-900/40"
                  : "bg-white/15 text-white/90 hover:bg-red-600 hover:text-white"
              }`}
            >
              {atLiveEdge ? "● Live" : "Go Live"}
            </button>
            <div className="relative flex-1">
              <input
                type="range"
                min={0}
                max={1000}
                value={Math.round(seekProgress * 1000)}
                onChange={(e) => onSeek(Number(e.target.value) / 1000)}
                aria-label="Seek within live buffer"
                className="live-tv-seek h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-[var(--accent-primary)]"
                style={{
                  background: `linear-gradient(to right, var(--accent-primary) ${seekProgress * 100}%, rgba(255,255,255,0.2) ${seekProgress * 100}%)`,
                }}
              />
              <div
                className="pointer-events-none absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-red-500 ring-2 ring-red-500/30"
                aria-hidden
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 sm:gap-2">
          <ControlButton onClick={onTogglePlay} label={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 pl-0.5">
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            )}
          </ControlButton>

          {canSeek && (
            <>
              <ControlButton onClick={() => onRewind(10)} label="Rewind 10 seconds">
                <span className="text-[10px] font-bold">-10s</span>
              </ControlButton>
              <ControlButton onClick={() => onRewind(30)} label="Rewind 30 seconds">
                <span className="text-[10px] font-bold">-30s</span>
              </ControlButton>
            </>
          )}

          <div className="flex items-center gap-1.5">
            <ControlButton onClick={onToggleMute} label={isMuted ? "Unmute" : "Mute"}>
              {isMuted || volume === 0 ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M23 9l-6 6M17 9l6 6" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" strokeLinecap="round" />
                </svg>
              )}
            </ControlButton>
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume * 100}
              onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
              aria-label="Volume"
              className="hidden h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/25 accent-white sm:block"
            />
          </div>

          <div className="flex-1" />

          <ControlButton onClick={onFullscreen} label="Fullscreen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
              <path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </ControlButton>
        </div>
      </div>
    </div>
  );
}
