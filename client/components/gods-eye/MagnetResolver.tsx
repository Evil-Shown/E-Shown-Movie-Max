import StreamingStats from "@/components/TBoom/StreamingStats";
import { formatTime } from "./torrent-utils";
import type { MagnetResolverState } from "./hooks/useMagnetResolver";

type MagnetResolverProps = MagnetResolverState;

export function ContinueWatchingBanner({
  continueWatching,
  startTorrent,
  clearContinue,
}: Pick<MagnetResolverState, "continueWatching" | "startTorrent" | "clearContinue">) {
  if (!continueWatching) return null;

  return (
    <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-cool)]">
          Continue Watching
        </p>
        <button
          type="button"
          onClick={clearContinue}
          className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-[10px] font-medium text-[var(--text-secondary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
        >
          Clear
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-[var(--text-primary)]">{continueWatching.title}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => startTorrent(continueWatching.magnetURI, continueWatching.title)}
            className="rounded-full bg-[var(--accent-primary)] px-4 py-1.5 text-xs font-semibold text-white"
          >
            Resume
          </button>
          <button
            type="button"
            onClick={clearContinue}
            className="rounded-full border border-[var(--border-strong)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:border-red-400 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MagnetResolver({
  streamingMagnet,
  streamingTitle,
  streamReady,
  isStopping,
  streamStats,
  subtitleTracks,
  actionMessage,
  torrentNotice,
  showMagnetHelp,
  setShowMagnetHelp,
  downloadState,
  isPlaying,
  playbackTime,
  duration,
  volume,
  playbackRate,
  videoRef,
  stopStreaming,
  stopBrowserDownload,
  startTorrent,
  handleTogglePlay,
  handleSeek,
  handleVolume,
  handleSpeed,
  handlePictureInPicture,
  handleFullscreen,
  dismissTorrentNotice,
}: MagnetResolverProps) {
  return (
    <>
      {actionMessage && (
        <div className="pointer-events-none fixed right-5 top-24 z-[140] max-w-md">
          <div
            className={`rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-sm ${
              actionMessage.type === "success"
                ? "border-[var(--accent-primary)]/40 bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]"
                : actionMessage.type === "warning"
                  ? "border-[var(--accent-cool)]/45 bg-[var(--accent-cool)]/14 text-[var(--accent-cool)]"
                  : "border-[var(--border)] bg-[var(--bg-card)]/95 text-[var(--text-secondary)]"
            }`}
          >
            {actionMessage.text}
          </div>
        </div>
      )}

      {torrentNotice && (
        <div className="fixed inset-0 z-[155] flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-primary)]">
                  Torrent Notice
                </p>
                <h3 className="mt-1 font-[var(--font-playfair)] text-2xl text-[var(--text-primary)]">
                  {torrentNotice.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={dismissTorrentNotice}
                className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]"
              >
                Close
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{torrentNotice.message}</p>
            {torrentNotice.tips.length > 0 && (
              <ul className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
                {torrentNotice.tips.map((tip) => (
                  <li key={tip} className="rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-3 py-2">
                    {tip}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowMagnetHelp(true);
                  dismissTorrentNotice();
                }}
                className="rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text-primary)]"
              >
                Open Help
              </button>
              <button
                type="button"
                onClick={dismissTorrentNotice}
                className="rounded-full bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-white"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {showMagnetHelp && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-[var(--font-playfair)] text-2xl font-bold text-[var(--text-primary)]">
                  Magnet Setup Help
                </h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  If download does not open, set a default app for magnet links.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMagnetHelp(false)}
                className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
              <p className="font-semibold text-[var(--text-primary)]">Windows (recommended)</p>
              <p>
                1) Install qBittorrent or Free Download Manager.
                <br />
                2) Open Windows Settings &gt; Apps &gt; Default apps &gt; Choose defaults by link type.
                <br />
                3) Find <code>MAGNET</code> and set it to qBittorrent/FDM.
              </p>
              <p className="font-semibold text-[var(--text-primary)]">Chrome/Edge</p>
              <p>
                1) Click a magnet link once.
                <br />
                2) Allow external app prompt when browser asks.
                <br />
                3) In browser site settings, allow protocol handlers if blocked.
              </p>
              <p className="font-semibold text-[var(--text-primary)]">Quick test</p>
              <p>
                Click <strong>Copy Magnet</strong>, paste into qBittorrent/FDM manually.
                If it starts there, your downloader is working and only protocol association needed.
              </p>
            </div>
          </div>
        </div>
      )}

      {downloadState.status !== "idle" && (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-sm)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Download Status</p>
              {downloadState.title && (
                <p className="mt-0.5 max-w-xl truncate text-xs text-[var(--text-secondary)]">{downloadState.title}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  downloadState.status === "done"
                    ? "bg-emerald-500/15 text-emerald-700"
                    : downloadState.status === "failed" || downloadState.status === "cancelled"
                      ? "bg-red-500/15 text-red-600"
                      : "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]"
                } ${downloadState.status === "connecting" ? "animate-pulse" : ""}`}
              >
                {downloadState.status.toUpperCase()}
              </span>
              {(downloadState.status === "connecting" ||
                downloadState.status === "downloading" ||
                downloadState.status === "finalizing") && (
                <button
                  type="button"
                  onClick={() => stopBrowserDownload()}
                  className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs font-medium text-[var(--text-primary)] transition hover:border-red-400 hover:text-red-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{downloadState.message}</p>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--bg-main)]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                downloadState.status === "failed" || downloadState.status === "cancelled"
                  ? "bg-red-400"
                  : downloadState.status === "done"
                    ? "bg-emerald-500"
                    : "bg-[var(--accent-primary)]"
              } ${downloadState.status === "connecting" ? "animate-pulse" : ""}`}
              style={{
                width: `${Math.max(downloadState.status === "connecting" ? 8 : 2, Math.min(100, downloadState.progress))}%`,
              }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--text-secondary)]">
            Progress: {downloadState.progress.toFixed(1)}% | Peers: {downloadState.peers} | Speed:{" "}
            {downloadState.speedMbps.toFixed(2)} MB/s
          </p>
        </section>
      )}

      <section
        className={`rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-sm)] ${
          streamingMagnet ? "" : "hidden"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-cool)]">Now Streaming</p>
            <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{streamingTitle}</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {streamReady ? "Playback ready." : "Preparing stream, connecting peers..."}
            </p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Peers: {streamStats.peers} | Buffer: {streamStats.progress.toFixed(0)}% | Speed:{" "}
              {streamStats.speedMbps.toFixed(2)} MB/s
            </p>
          </div>
          <button
            type="button"
            onClick={stopStreaming}
            disabled={isStopping}
            className="inline-flex rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isStopping ? "Stopping..." : "Stop"}
          </button>
        </div>
        <video ref={videoRef} className="mt-4 w-full rounded-xl border border-[var(--border)] bg-black" />
        <StreamingStats
          peers={streamStats.peers}
          progress={streamStats.progress}
          downloadSpeedMbps={streamStats.speedMbps}
        />
        <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>{formatTime(playbackTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={Math.min(playbackTime, duration || 0)}
            onChange={(event) => handleSeek(Number(event.target.value))}
            className="w-full accent-[var(--accent-primary)]"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleTogglePlay}
              className="inline-flex rounded-full bg-[var(--accent-primary)] px-4 py-2 text-xs font-semibold text-white transition hover:brightness-95"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={() => handleSeek(Math.max(0, playbackTime - 10))}
              className="inline-flex rounded-full border border-[var(--border-strong)] px-3 py-2 text-xs font-medium text-[var(--text-primary)]"
            >
              -10s
            </button>
            <button
              type="button"
              onClick={() => handleSeek(Math.min(duration || playbackTime + 10, playbackTime + 10))}
              className="inline-flex rounded-full border border-[var(--border-strong)] px-3 py-2 text-xs font-medium text-[var(--text-primary)]"
            >
              +10s
            </button>
            <button
              type="button"
              onClick={handlePictureInPicture}
              className="inline-flex rounded-full border border-[var(--border-strong)] px-3 py-2 text-xs font-medium text-[var(--text-primary)]"
            >
              PiP
            </button>
            <button
              type="button"
              onClick={handleFullscreen}
              className="inline-flex rounded-full border border-[var(--border-strong)] px-3 py-2 text-xs font-medium text-[var(--text-primary)]"
            >
              Fullscreen
            </button>
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-3 py-2 text-xs text-[var(--text-primary)]">
              Volume
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(event) => handleVolume(Number(event.target.value))}
                className="w-20 accent-[var(--accent-primary)]"
              />
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-3 py-2 text-xs text-[var(--text-primary)]">
              Speed
              <select
                value={playbackRate}
                onChange={(event) => handleSpeed(Number(event.target.value))}
                className="bg-transparent text-[var(--text-primary)]"
              >
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </label>
          </div>
        </div>
        {subtitleTracks.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {subtitleTracks.map((track) => (
              <button
                key={track.src}
                type="button"
                onClick={() => {
                  if (!videoRef.current) return;
                  const element = document.createElement("track");
                  element.kind = "subtitles";
                  element.label = track.label;
                  element.src = track.src;
                  element.default = true;
                  videoRef.current.appendChild(element);
                }}
                className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs text-[var(--text-secondary)]"
              >
                Load subtitle: {track.label}
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
