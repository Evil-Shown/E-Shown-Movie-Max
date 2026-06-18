type Props = {
  peers: number;
  progress: number;
  downloadSpeedMbps: number;
  uploadSpeedMbps?: number;
};

function formatSpeed(mbps: number) {
  if (mbps >= 1) return `${mbps.toFixed(2)} MB/s`;
  return `${(mbps * 1024).toFixed(0)} KB/s`;
}

function estimateBufferEta(progress: number, speedMbps: number) {
  if (progress >= 100 || speedMbps <= 0) return "Ready";
  const remaining = 100 - progress;
  const seconds = Math.ceil((remaining / 100) * (100 / speedMbps));
  if (seconds < 60) return `~${seconds}s to buffer`;
  return `~${Math.ceil(seconds / 60)}m to buffer`;
}

export default function StreamingStats({
  peers,
  progress,
  downloadSpeedMbps,
  uploadSpeedMbps = 0
}: Props) {
  return (
    <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-cool)]">
        Stream Stats
      </p>
      <div className="mt-2 grid gap-2 text-xs text-[var(--text-secondary)] sm:grid-cols-2">
        <span>Download: {formatSpeed(downloadSpeedMbps)}</span>
        <span>Upload: {formatSpeed(uploadSpeedMbps)}</span>
        <span>Peers: {peers}</span>
        <span>Buffer: {progress.toFixed(0)}%</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-card)]">
        <div
          className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-300"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-[var(--text-secondary)]">{estimateBufferEta(progress, downloadSpeedMbps)}</p>
    </div>
  );
}
