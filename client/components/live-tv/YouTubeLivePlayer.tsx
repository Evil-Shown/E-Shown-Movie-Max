"use client";

interface YouTubeLivePlayerProps {
  channelId: string;
  title: string;
  className?: string;
}

export default function YouTubeLivePlayer({
  channelId,
  title,
  className = "",
}: YouTubeLivePlayerProps) {
  const src = `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=1&rel=0&modestbranding=1`;

  return (
    <iframe
      src={src}
      className={`absolute inset-0 h-full w-full border-0 bg-black ${className}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      title={`${title} Live Stream`}
    />
  );
}
