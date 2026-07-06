import Image from "next/image";

export type TorrentCardData = {
  name?: string;
  seeders?: number | string;
  leechers?: number | string;
  magnet?: string;
  size?: string;
  uploaded?: string;
  health: string;
  readiness: string;
  seedersNumber: number;
  leechersNumber: number;
  parsed: {
    cleanTitle: string;
    year: string | null;
    quality: string | null;
    source: string | null;
    codec: string | null;
    language: string | null;
    group?: string | null;
  };
  posterUrl?: string | null;
};

type Props = {
  result: TorrentCardData;
  isStreaming?: boolean;
  magnetHref: string | null;
  onStream: () => void;
  onDownload: () => void;
  onCopyMagnet: () => void;
  onShare: () => void;
  onResolveMagnet?: () => void;
  onSecurityCheck?: () => void;
  onMagnetHelp?: () => void;
  onOpenTorrentApp?: () => void;
  resolving?: boolean;
  checkingSecurity?: boolean;
  downloadDisabled?: boolean;
};

function healthClass(health: string) {
  if (health === "Excellent") return "border-emerald-500/35 bg-emerald-500/15 text-emerald-700";
  if (health === "Good") return "border-amber-500/35 bg-amber-500/15 text-amber-700";
  return "border-red-500/35 bg-red-500/15 text-red-600";
}

export default function TBoomResultCard({
  result,
  isStreaming,
  magnetHref,
  onStream,
  onDownload,
  onCopyMagnet,
  onShare,
  onResolveMagnet,
  onSecurityCheck,
  onMagnetHelp,
  onOpenTorrentApp,
  resolving,
  checkingSecurity,
  downloadDisabled
}: Props) {
  const title = result.parsed.cleanTitle || result.name || "Unknown";
  const initial = title.charAt(0).toUpperCase();

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-main)] p-4">
      <div className="flex gap-4">
        <div className="relative h-[110px] w-[80px] shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-card)]">
          {result.posterUrl ? (
            <Image
              src={result.posterUrl}
              alt=""
              fill
              sizes="80px"
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#7C3AED]/30 to-[#F59E0B]/20 text-2xl font-bold text-[var(--accent-primary)]">
              {initial}
            </div>
          )}
          <span
            className={`absolute right-1 top-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${healthClass(result.health)}`}
          >
            {result.health}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="truncate text-base font-semibold text-[var(--text-primary)]">{result.name}</h4>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            {[result.parsed.year, result.parsed.quality, result.parsed.codec].filter(Boolean).join(" · ")}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            {[result.parsed.source, result.parsed.language, result.parsed.group].filter(Boolean).join(" · ")}
          </p>
          <div className="my-2 h-px bg-[var(--border)]" />
          <p className="text-xs text-[var(--text-secondary)]">
            🌱 Seeders: {result.seedersNumber} · ☁ Leechers: {result.leechersNumber}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            📦 Size: {result.size || "—"} · 📅 {result.uploaded || "—"}
          </p>
          <span className="mt-1 inline-block rounded-full border border-sky-500/35 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
            {result.readiness}
          </span>
        </div>
      </div>

      {magnetHref ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onStream}
            disabled={isStreaming}
            className="inline-flex rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[#e0883d] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-70"
          >
            {isStreaming ? "Streaming..." : "▶ Stream"}
          </button>
          <button
            type="button"
            onClick={onDownload}
            disabled={downloadDisabled}
            className="inline-flex rounded-full bg-gradient-to-r from-emerald-600 to-lime-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-70"
          >
            ⬇ Download
          </button>
          <button
            type="button"
            onClick={onCopyMagnet}
            className="inline-flex rounded-full border border-[var(--border-strong)] px-3 py-2 text-xs font-medium text-[var(--text-primary)]"
            title="Copy magnet"
          >
            🔗
          </button>
          <button
            type="button"
            onClick={onShare}
            className="inline-flex rounded-full border border-[var(--border-strong)] px-3 py-2 text-xs font-medium text-[var(--text-primary)]"
            title="Share"
          >
            📤
          </button>
          {onOpenTorrentApp && (
            <button
              type="button"
              onClick={onOpenTorrentApp}
              className="inline-flex rounded-full border border-[var(--border-strong)] px-3 py-2 text-xs text-[var(--text-secondary)]"
            >
              Open in Torrent App
            </button>
          )}
          {onMagnetHelp && (
            <button type="button" onClick={onMagnetHelp} className="text-xs text-[var(--text-secondary)] underline">
              Magnet help
            </button>
          )}
          {onSecurityCheck && (
            <button
              type="button"
              onClick={onSecurityCheck}
              disabled={checkingSecurity}
              className="text-xs text-teal-700 underline disabled:opacity-70"
            >
              {checkingSecurity ? "Checking..." : "Security"}
            </button>
          )}
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p className="text-sm text-[var(--text-secondary)]">Magnet link unavailable.</p>
          {onResolveMagnet && (
            <button
              type="button"
              onClick={onResolveMagnet}
              disabled={resolving}
              className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs disabled:opacity-70"
            >
              {resolving ? "Resolving..." : "Resolve Magnet"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
