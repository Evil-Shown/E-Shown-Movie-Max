import { getLogoCandidates } from "@/lib/live-tv/logos";
import type { LiveTvChannel } from "@/lib/live-tv/types";
import ChannelLogoImage from "./ChannelLogoImage";

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
  const candidates = getLogoCandidates(channel.id, channel.logo);
  const style = channel.cinematicStyle;
  const isClean = variant === "clean" || variant === "tile";
  const isTile = variant === "tile";

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden ${
        isTile ? "" : "h-full w-full"
      } ${isClean ? "" : "group transition-all duration-500"} ${!isClean && style?.hoverEffect ? style.hoverEffect : ""} ${className}`}
      style={{
        backgroundColor: isTile ? "transparent" : channel.logoColor,
      }}
    >
      <ChannelLogoImage
        channel={channel}
        candidates={candidates}
        variant={variant}
        priority={priority}
        isClean={isClean}
        isTile={isTile}
        style={style}
      />
    </div>
  );
}
