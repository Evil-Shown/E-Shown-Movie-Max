"use client";

import { useEffect, useState, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ConnectionQuality = "offline" | "poor" | "moderate" | "good" | "strong";

interface ConnectionInfo {
  quality: ConnectionQuality;
  type: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface NetworkInformation {
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
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

// ─── Connection Info ──────────────────────────────────────────────────────────

function getConnectionInfo(): ConnectionInfo {
  const fallback: ConnectionInfo = { quality: "strong", type: "unknown", downlink: 0, rtt: 0, saveData: false };
  if (typeof navigator === "undefined") return fallback;
  if (!navigator.onLine) return { ...fallback, quality: "offline", type: "offline" };

  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn) return { ...fallback, type: "ethernet" };

  const downlink = conn.downlink ?? 0;
  const rtt = conn.rtt ?? 0;
  const effectiveType = conn.effectiveType ?? "unknown";
  const saveData = conn.saveData ?? false;

  let quality: ConnectionQuality;
  switch (effectiveType) {
    case "slow-2g":
    case "2g":
      quality = "poor";
      break;
    case "3g":
      quality = downlink >= 1.5 ? "moderate" : "poor";
      break;
    case "4g":
      quality = downlink >= 10 ? "strong" : downlink >= 3 ? "good" : "moderate";
      break;
    default:
      quality = downlink >= 10 ? "strong" : downlink >= 3 ? "good" : downlink >= 1 ? "moderate" : "poor";
  }

  return { quality, type: effectiveType, downlink, rtt, saveData };
}

// ─── Styling ──────────────────────────────────────────────────────────────────

const QUALITY = {
  offline: { color: "#ef4444", bg: "#ef4444", label: "Offline" },
  poor:    { color: "#f97316", bg: "#f97316", label: "Poor" },
  moderate:{ color: "#eab308", bg: "#eab308", label: "Moderate" },
  good:    { color: "#22c55e", bg: "#22c55e", label: "Good" },
  strong:  { color: "#10b981", bg: "#10b981", label: "Strong" },
} as const;

function fmtSpeed(mbps: number): string {
  if (mbps <= 0) return "—";
  if (mbps >= 1) return `${mbps.toFixed(1)} Mbps`;
  return `${Math.round(mbps * 1000)} Kbps`;
}

function fmtRtt(ms: number): string {
  return ms <= 0 ? "—" : ms <= 1 ? "<1 ms" : `${ms} ms`;
}

// ─── Signal Bars ──────────────────────────────────────────────────────────────

function SignalBars({ quality, size = "sm" }: { quality: ConnectionQuality; size?: "sm" | "md" }) {
  const count = { offline: 0, poor: 1, moderate: 2, good: 3, strong: 4 }[quality];
  const q = QUALITY[quality];
  return (
    <div className="flex items-end gap-[2.5px]" aria-label={`Connection: ${q.label}`}>
      {[0, 1, 2, 3].map((i) => {
        const active = i < count;
        const heights = size === "md" ? [6, 9, 13, 17] : [4, 7, 10, 13];
        return (
          <div
            key={i}
            className="rounded-[1.5px] transition-all duration-500"
            style={{
              width: size === "md" ? 4 : 3,
              height: active ? heights[i] : 3,
              backgroundColor: active ? q.color : "var(--border)",
              opacity: active ? 1 : 0.3,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Animated Speed ───────────────────────────────────────────────────────────

function AnimatedSpeed({ mbps }: { mbps: number }) {
  const [prev, setPrev] = useState(mbps);
  const [dir, setDir] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (mbps === prev) return;
    setDir(mbps > prev ? "up" : "down");
    setPrev(mbps);
    const t = setTimeout(() => setDir(null), 600);
    return () => clearTimeout(t);
  }, [mbps, prev]);

  return (
    <span className="inline-flex items-center gap-0.5 tabular-nums">
      {dir === "up" && <span className="text-[8px] text-emerald-400 transition-opacity">&#9650;</span>}
      {dir === "down" && <span className="text-[8px] text-orange-400 transition-opacity">&#9660;</span>}
      {fmtSpeed(mbps)}
    </span>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[10px] font-medium text-[var(--text-secondary)]">{label}</span>
      <span
        className={`text-[10px] font-semibold text-right tabular-nums ${
          highlight ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function TooltipPanel({ info, history, lastUpdated }: { info: ConnectionInfo; history: ConnectionQuality[]; lastUpdated: number }) {
  const typeMap: Record<string, string> = {
    "slow-2g": "Slow 2G", "2g": "2G", "3g": "3G", "4g": "4G",
    "5g": "5G", wifi: "WiFi", ethernet: "Ethernet", unknown: "Unknown", offline: "—",
  };

  return (
    <div className="min-w-[200px] space-y-0">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <SignalBars quality={info.quality} size="md" />
          <span className="text-xs font-bold" style={{ color: QUALITY[info.quality].color }}>
            {QUALITY[info.quality].label}
          </span>
        </div>
        <span className="text-[10px] font-semibold text-[var(--text-secondary)] capitalize">
          {typeMap[info.type] || info.type.replace("-", " ")}
        </span>
      </div>

      <div className="h-px bg-[var(--border)]/40 -mx-1 mb-2.5" />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] font-medium text-[var(--text-secondary)]">Download</span>
          <span className="text-[10px] font-semibold text-right tabular-nums text-[var(--accent-primary)]">
            <AnimatedSpeed mbps={info.downlink} />
          </span>
        </div>
        <DetailRow label="Latency" value={fmtRtt(info.rtt)} />
        <DetailRow label="Data Saver" value={info.saveData ? "Active" : "Off"} highlight={info.saveData} />
      </div>

      {history.length >= 3 && (
        <>
          <div className="h-px bg-[var(--border)]/40 -mx-1 my-2.5" />
          <div>
            <span className="text-[9px] font-semibold text-[var(--text-secondary)] block mb-1.5">Signal History</span>
            <div className="flex items-end gap-[3px] h-4">
              {history.map((q, i) => (
                <div
                  key={i}
                  className="w-[5px] rounded-[1px] transition-all duration-300"
                  style={{
                    height: `${({ offline: 4, poor: 6, moderate: 9, good: 12, strong: 16 }[q])}px`,
                    backgroundColor: QUALITY[q].color,
                    opacity: 0.3 + (i / history.length) * 0.7,
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}

      <div className="mt-2 pt-2 border-t border-[var(--border)]/40 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-[8px] font-semibold text-emerald-500 uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
        <span className="text-[8px] text-[var(--text-secondary)]/70 tabular-nums">
          {new Date(lastUpdated).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ConnectionIndicator() {
  const [info, setInfo] = useState<ConnectionInfo>({ quality: "strong", type: "unknown", downlink: 0, rtt: 0, saveData: false });
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<ConnectionQuality[]>([]);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const update = useCallback(() => {
    const next = getConnectionInfo();
    setInfo(next);
    setLastUpdated(Date.now());
    setHistory((h) => [...h.slice(-15), next.quality]);
  }, []);

  useEffect(() => {
    setHydrated(true);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn?.addEventListener) conn.addEventListener("change", update);

    const interval = setInterval(update, 3000);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      if (conn?.removeEventListener) conn.removeEventListener("change", update);
      clearInterval(interval);
    };
  }, [update]);

  // Smart position
  useEffect(() => {
    if (!open || !panelRef.current || !containerRef.current) return;
    const panel = panelRef.current;
    const rect = panel.getBoundingClientRect();
    const overflowRight = rect.right > window.innerWidth - 8;
    const overflowLeft = rect.left < 8;
    panel.style.setProperty("--tooltip-offset", "0px");
    if (overflowRight) {
      panel.style.setProperty("--tooltip-offset", `-${rect.right - window.innerWidth + 8}px`);
    }
    if (overflowLeft) {
      panel.style.setProperty("--tooltip-offset", `${8 - rect.left}px`);
    }
  }, [open]);

  const handleMouseEnter = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = undefined;
    }
    setOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
    }, 200);
  }, []);

  const handlePanelMouseEnter = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = undefined;
    }
  }, []);

  const q = QUALITY[info.quality];
  const isOffline = info.quality === "offline";
  const isPoor = info.quality === "poor";

  if (!hydrated) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-card)]/60 backdrop-blur-sm px-2.5 py-1 opacity-50">
        <SignalBars quality="strong" />
        <span className="text-[8px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">...</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className={`group relative flex items-center gap-2 rounded-full border backdrop-blur-sm px-2.5 py-1 transition-all duration-300 active:scale-95 ${
          isOffline
            ? "border-red-500/40 bg-red-500/10"
            : isPoor
              ? "border-orange-500/30 bg-orange-500/5"
              : "border-[var(--border)] bg-[var(--bg-card)]/60 hover:bg-[var(--bg-card)]/90 hover:border-[var(--accent-primary)]/25"
        }`}
      >
        <SignalBars quality={info.quality} />

        <div className="flex items-center gap-1">
          {(isOffline || isPoor) && (
            <span className="text-[8px] font-bold uppercase tracking-[0.1em]" style={{ color: q.color }}>
              {q.label}
            </span>
          )}
          {!isOffline && info.downlink > 0 && (
            <span className="text-[8px] font-medium text-[var(--text-muted)]/70 tabular-nums hidden sm:inline">
              {info.downlink.toFixed(1)}
            </span>
          )}
        </div>

        {info.saveData && (
          <span className="flex items-center rounded-sm bg-[var(--accent-primary)]/10 px-1 py-0.5 text-[6px] font-extrabold uppercase tracking-widest text-[var(--accent-primary)]">
            DS
          </span>
        )}
      </button>

      <div
        ref={panelRef}
        onMouseEnter={handlePanelMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`absolute top-full mt-1.5 z-[60] transition-all duration-200 origin-top ${
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        }`}
        style={{
          left: "50%",
          transform: `translateX(calc(-50% + var(--tooltip-offset, 0px)))`,
        }}
      >
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]/95 backdrop-blur-xl p-3.5 shadow-xl shadow-black/25">
          <TooltipPanel info={info} history={history} lastUpdated={lastUpdated} />
        </div>
      </div>
    </div>
  );
}
