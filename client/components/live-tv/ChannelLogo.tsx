"use client";

import Image from "next/image";
import { useState } from "react";
import type { LiveTvChannel } from "@/lib/live-tv/types";

interface ChannelLogoProps {
  channel: LiveTvChannel;
  className?: string;
}

export default function ChannelLogo({ channel, className = "" }: ChannelLogoProps) {
  // 0: Remote (if available)
  // 1: Local
  // 2: Initials
  const [errorLevel, setErrorLevel] = useState(0);

  const hasRemote = Boolean(channel.logo);
  const currentLevel = hasRemote ? errorLevel : Math.max(errorLevel, 1);

  const LOGO_DEV_TOKEN = "pk_CvtKnlevScSGAPFV3KyoLA";
  const src = currentLevel === 0 ? `${channel.logo}?token=${LOGO_DEV_TOKEN}` : `/channels/${channel.id}.png`;

  const style = channel.cinematicStyle;

  return (
    <div
      className={`relative h-full w-full overflow-hidden group transition-all duration-500 ${style?.hoverEffect || ""} ${className}`}
      style={{ backgroundColor: channel.logoColor }}
    >
      {/* Base Layer: Either Texture Image or Initials Badge */}
      {currentLevel >= 2 ? (
        <div className="flex h-full w-full items-center justify-center font-bold text-white z-0">
          {channel.logoInitials}
        </div>
      ) : (
        <Image
          src={src}
          alt={channel.name}
          fill
          className="object-cover transition-all duration-500 z-0"
          sizes="100px"
          onError={() => setErrorLevel((prev) => prev + 1)}
          style={style ? { filter: `contrast(${style.contrast}) brightness(0.9)` } : {}}
        />
      )}

      {/* Cinematic Depth & Lighting Overlays (Applies to both image and fallback) */}
      {style && (
        <>
          {/* Ambient & Primary Glow */}
          <div
            className="absolute inset-0 mix-blend-overlay opacity-80 transition-opacity duration-500 group-hover:opacity-100 z-10"
            style={{ background: style.overlayGradient }}
          />
          {/* Vignette Edge Darkening */}
          <div
            className="pointer-events-none absolute inset-0 z-20"
            style={{ background: style.vignette }}
          />
          {/* Animated Light Sweep on Hover */}
          <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full z-30" />
        </>
      )}
    </div>
  );
}
