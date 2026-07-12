"use client";

import { useEffect, useState } from "react";

type ConnectionQuality = "offline" | "poor" | "good" | "strong";

interface ConnectionInfo {
  quality: ConnectionQuality;
  type?: string;
  downlink?: number;
}

interface NetworkInformation {
  downlink?: number;
  effectiveType?: string;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

declare global {
  interface Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }
}

function getConnectionQuality(): ConnectionInfo {
  if (typeof navigator === "undefined") {
    return { quality: "strong" };
  }

  if (!navigator.onLine) {
    return { quality: "offline" };
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  if (connection) {
    const downlink = connection.downlink;
    const effectiveType = connection.effectiveType;

    if (effectiveType === "slow-2g" || effectiveType === "2g") {
      return { quality: "poor", type: effectiveType, downlink };
    }

    if (effectiveType === "3g" || (downlink && downlink < 1.5)) {
      return { quality: "good", type: effectiveType, downlink };
    }

    if (effectiveType === "4g" && downlink && downlink >= 1.5) {
      return { quality: "strong", type: effectiveType, downlink };
    }
  }

  return { quality: "strong" };
}

function SignalBars({ quality }: { quality: ConnectionQuality }) {
  const getColor = () => {
    switch (quality) {
      case "offline":
        return "#dc2626";
      case "poor":
        return "#f59e0b";
      case "good":
        return "#eab20b";
      case "strong":
        return "#10b981";
    }
  };

  const getBarCount = () => {
    switch (quality) {
      case "offline":
        return 0;
      case "poor":
        return 1;
      case "good":
        return 2;
      case "strong":
        return 3;
    }
  };

  const barCount = getBarCount();
  const color = getColor();

  return (
    <div className="flex items-end gap-[2px]" aria-label={`Connection: ${quality}`}>
      {[1, 2, 3].map((bar) => (
        <div
          key={bar}
          className="w-[3px] rounded-[1px] transition-all duration-300"
          style={{
            height: `${bar * 4 + 2}px`,
            backgroundColor: bar <= barCount ? color : "rgba(0,0,0,0.15)",
          }}
        />
      ))}
    </div>
  );
}

export default function ConnectionIndicator() {
  const [connection, setConnection] = useState<ConnectionInfo>({ quality: "strong" });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const updateConnection = () => {
      setConnection(getConnectionQuality());
    };

    updateConnection();

    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);

    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn?.addEventListener) {
      conn.addEventListener("change", updateConnection);
    }

    return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
      if (conn?.removeEventListener) {
        conn.removeEventListener("change", updateConnection);
      }
    };
  }, []);

  const getTooltip = () => {
    switch (connection.quality) {
      case "offline":
        return "No internet connection";
      case "poor":
        return "Poor connection - streaming may be affected";
      case "good":
        return "Good connection";
      case "strong":
        return "Strong connection";
    }
  };

  if (!hydrated) {
    return (
      <div
        className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-2 py-1 transition-all hover:border-[var(--accent-primary)]"
        aria-label="Connection: checking..."
      >
        <SignalBars quality="strong" />
        <span className="text-[9px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Connecting</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-2 py-1 transition-all hover:border-[var(--accent-primary)]"
      title={getTooltip()}
      aria-label={getTooltip()}
    >
      <SignalBars quality={connection.quality} />
      <span className="text-[9px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
        {connection.quality === "offline" ? "Offline" : connection.quality}
      </span>
    </div>
  );
}
