"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getLogoCandidates } from "@/lib/live-tv/logos";
import type { LiveTvChannel } from "@/lib/live-tv/types";

interface ChannelLogoProps {
  channel: LiveTvChannel;
  className?: string;
  variant?: "clean" | "cinematic" | "tile";
  priority?: boolean;
}

export default function ChannelLogo({
  channel,
  className = "",
  variant = "cinematic",
  priority = false,
}: ChannelLogoProps) {
  const candidates = useMemo(
    () => getLogoCandidates(channel.id, channel.logo),
    [channel.id, channel.logo]
  );

  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [channel.id, candidates]);

  const style = channel.cinematicStyle;
  const isClean = variant === "clean" || variant === "tile";
  const isTile = variant === "tile";
  const showInitials = candidateIndex >= candidates.length;

  const handleError = () => {
    setCandidateIndex((prev) => prev + 1);
  };

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden ${
        isTile ? "" : "h-full w-full"
      } ${isClean ? "" : "group transition-all duration-500"} ${!isClean && style?.hoverEffect ? style.hoverEffect : ""} ${className}`}
      style={{
        backgroundColor: isTile ? "transparent" : channel.logoColor,
      }}
    >
      {showInitials ? (
        <div
          className={`flex items-center justify-center font-bold ${
            isTile
              ? "size-full text-[11px] sm:text-xs"
              : "h-full w-full text-sm tracking-wide text-white"
          }`}
          style={{
            background: isTile
              ? "transparent"
              : `linear-gradient(135deg, ${channel.logoColor} 0%, color-mix(in srgb, ${channel.logoColor} 70%, black) 100%)`,
          }}
        >
          <span
            className="flex items-center justify-center"
            style={
              isTile
                ? { color: channel.logoColor }
                : {
                    color: channel.logoColor,
                    textShadow: "0 0 20px rgba(255,255,255,0.15)",
                  }
            }
          >
            {channel.logoInitials}
          </span>
        </div>
      ) : isTile || isClean ? (
        <img
          src={candidates[candidateIndex]}
          alt={channel.name}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onError={handleError}
          className={
            isTile
              ? "max-h-full max-w-full object-contain drop-shadow-[0_1px_3px_rgba(28,25,23,0.12)]"
              : "mx-auto h-full w-full max-h-full object-contain p-2"
          }
        />
      ) : (
        <Image
          src={candidates[candidateIndex]}
          alt={channel.name}
          fill
          priority={priority}
          className="z-0 object-cover transition-all duration-500"
          sizes="120px"
          onError={handleError}
          unoptimized
          style={
            style ? { filter: `contrast(${style.contrast}) brightness(0.9)` } : undefined
          }
        />
      )}

      {!isClean && style && (
        <>
          <div
            className="absolute inset-0 z-10 mix-blend-overlay opacity-80 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: style.overlayGradient }}
          />
          <div
            className="pointer-events-none absolute inset-0 z-20"
            style={{ background: style.vignette }}
          />
        </>
      )}
    </div>
  );
}
