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

  if (currentLevel >= 2) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center font-bold text-white ${className}`}
        style={{ backgroundColor: channel.logoColor }}
      >
        {channel.logoInitials}
      </div>
    );
  }

  const LOGO_DEV_TOKEN = "pk_CvtKnlevScSGAPFV3KyoLA";
  const src = currentLevel === 0 ? `${channel.logo}?token=${LOGO_DEV_TOKEN}` : `/channels/${channel.id}.png`;

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{ backgroundColor: channel.logoColor }}
    >
      <Image
        src={src}
        alt={channel.name}
        fill
        className="object-cover"
        sizes="100px"
        onError={() => setErrorLevel((prev) => prev + 1)}
      />
    </div>
  );
}
