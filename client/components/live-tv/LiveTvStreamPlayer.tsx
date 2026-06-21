"use client";

import { useEffect, useState } from "react";
import HlsVideoPlayer from "@/components/live-tv/HlsVideoPlayer";
import LiveTvPlayerLoading from "@/components/live-tv/LiveTvPlayerLoading";
import YouTubeLivePlayer from "@/components/live-tv/YouTubeLivePlayer";
import ChannelLogo from "@/components/live-tv/ChannelLogo";
import {
  clearChannelStreamCache,
  getCachedChannelStream,
  prefetchChannelStream,
  resolveChannelStreamClient,
} from "@/lib/live-tv/stream-cache";
import { getStreamForChannel } from "@/lib/live-tv/streams";
import type { LiveTvChannel, LiveTvStream } from "@/lib/live-tv/types";

interface LiveTvStreamPlayerProps {
  channel: LiveTvChannel;
  className?: string;
}

type PlayerStatus = "loading" | "playing" | "error";

function resolveStream(channel: LiveTvChannel): LiveTvStream | null {
  // Registry always wins over cached API results (prevents stale/bad cache)
  return (
    channel.stream ??
    getStreamForChannel(channel.id) ??
    getCachedChannelStream(channel.id) ??
    null
  );
}

export default function LiveTvStreamPlayer({ channel, className = "" }: LiveTvStreamPlayerProps) {
  const [stream, setStream] = useState<LiveTvStream | null>(() => resolveStream(channel));
  const [status, setStatus] = useState<PlayerStatus>("loading");
  const [needsResolve, setNeedsResolve] = useState(() => !resolveStream(channel));
  const [retryKey, setRetryKey] = useState(0);
  const [useEmbedFallback, setUseEmbedFallback] = useState(false);
  const [embedLoading, setEmbedLoading] = useState(true);

  useEffect(() => {
    setUseEmbedFallback(false);
    setEmbedLoading(true);
    const immediate = resolveStream(channel);
    if (immediate) {
      setStream(immediate);
      setNeedsResolve(false);
      setStatus("loading");
      return;
    }

    let cancelled = false;
    setNeedsResolve(true);
    setStatus("loading");

    resolveChannelStreamClient(channel.id).then((resolved) => {
      if (cancelled) return;
      if (resolved) {
        setStream(resolved);
        setNeedsResolve(false);
      } else {
        setStream(null);
        setStatus("error");
        setNeedsResolve(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [channel.id, channel.stream, retryKey]);

  const embedUrl =
    stream?.embedFallback ??
    (stream?.type === "iframe" ? stream.url : undefined);

  if (needsResolve) {
    return (
      <LiveTvPlayerLoading channel={channel} phase="resolve" className={className} />
    );
  }

  if (!stream || (status === "error" && !embedUrl)) {
    return (
      <div className={`flex h-full w-full flex-col items-center justify-center gap-4 bg-[#050505] px-6 text-center ${className}`}>
        <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white shadow-md">
          <ChannelLogo channel={channel} variant="tile" priority className="size-11" />
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/90 text-[10px] font-bold text-white">
            !
          </span>
        </div>
        <div>
          <p className="font-medium text-white/80">Couldn&apos;t connect to {channel.name}</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/45">
            The stream may be offline, geo-blocked, or only available on the broadcaster&apos;s website.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {embedUrl && !useEmbedFallback && (
            <button
              type="button"
              onClick={() => {
                setUseEmbedFallback(true);
                setStatus("loading");
              }}
              className="rounded-full bg-[var(--accent-primary)] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#b85f26]"
            >
              Open Broadcaster Page
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              clearChannelStreamCache(channel.id);
              prefetchChannelStream(channel.id);
              setUseEmbedFallback(false);
              setRetryKey((k) => k + 1);
            }}
            className="rounded-full bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white/80 transition hover:bg-white/20 hover:text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (useEmbedFallback && embedUrl) {
    return (
      <div className={`relative h-full w-full ${className}`}>
        {embedLoading && (
          <LiveTvPlayerLoading
            channel={channel}
            phase="embed"
            overlay
            className="absolute inset-0 z-10"
          />
        )}
        <iframe
          src={embedUrl}
          className="absolute inset-0 h-full w-full border-0 bg-black"
          allowFullScreen
          title={`${channel.name} Live Stream`}
          onLoad={() => {
            setEmbedLoading(false);
            setStatus("playing");
          }}
        />
      </div>
    );
  }

  if (stream.type === "youtube") {
    return <YouTubeLivePlayer channelId={stream.url} title={channel.name} className={className} />;
  }

  if (stream.type === "iframe") {
    return (
      <div className={`relative h-full w-full ${className}`}>
        {embedLoading && (
          <LiveTvPlayerLoading
            channel={channel}
            phase="embed"
            overlay
            className="absolute inset-0 z-10"
          />
        )}
        <iframe
          src={stream.url}
          className="absolute inset-0 h-full w-full border-0 bg-black"
          allowFullScreen
          title={`${channel.name} Live Stream`}
          onLoad={() => {
            setEmbedLoading(false);
            setStatus("playing");
          }}
        />
      </div>
    );
  }

  return (
    <HlsVideoPlayer
      key={`${channel.id}-${retryKey}`}
      stream={stream}
      channel={channel}
      poster={stream.poster}
      className={className}
      onStatusChange={(next) => {
        setStatus(next);
        if (next === "error" && embedUrl) {
          setUseEmbedFallback(true);
        }
      }}
    />
  );
}
