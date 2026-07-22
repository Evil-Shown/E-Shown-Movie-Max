"use client";

import { useCallback, useRef, useState } from "react";

function formatTime(seconds: number): string {
  if (!seconds || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

interface PlayerScrubberProps {
  currentTime: number;
  duration: number;
  isTrailer: boolean;
  loaded: boolean;
}

export default function PlayerScrubber({
  currentTime,
  duration,
  isTrailer,
  loaded,
}: PlayerScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  const progress = currentTime / duration;
  const hoverRatio = hoverTime !== null ? hoverTime / duration : 0;

  const getTimeFromPosition = useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track) return 0;
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return ratio * duration;
    },
    [duration]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      setHoverTime(getTimeFromPosition(e.clientX));
    },
    [getTimeFromPosition]
  );

  const handlePointerLeave = useCallback(() => {
    setHoverTime(null);
  }, []);

  if (isTrailer || !loaded || duration <= 0) return null;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-[9]"
      style={{ padding: "22px 0 6px" }}
      ref={trackRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {hoverTime !== null && (
        <div
          className="pointer-events-none absolute z-20"
          style={{
            left: `${hoverRatio * 100}%`,
            bottom: "calc(100% + 6px)",
            transform: "translateX(-50%)",
          }}
        >
          <div
            className="rounded-md px-2 py-0.5 text-[11px] font-medium shadow-lg"
            style={{
              background: "rgba(232,164,74,0.95)",
              color: "#1c1917",
              whiteSpace: "nowrap",
            }}
          >
            {formatTime(hoverTime)}
          </div>
        </div>
      )}
    </div>
  );
}
