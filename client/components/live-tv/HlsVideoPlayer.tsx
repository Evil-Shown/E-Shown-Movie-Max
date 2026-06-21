"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface HlsVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export default function HlsVideoPlayer({ src, poster, className = "" }: HlsVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        capLevelToPlayerSize: true,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((err) => {
          console.log("Autoplay prevented:", err);
        });
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // For Safari, which natively supports HLS
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch((err) => {
          console.log("Autoplay prevented:", err);
        });
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={`h-full w-full object-cover ${className}`}
      controls
      autoPlay
      playsInline
      poster={poster}
      muted
    />
  );
}
