"use client";

import { useLayoutEffect, type RefObject } from "react";

interface EmbedStreamFrameProps {
  src: string;
  title: string;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  onLoad?: () => void;
}

function applyFullscreenPermissions(el: HTMLIFrameElement) {
  el.setAttribute("allowfullscreen", "");
  el.setAttribute("webkitallowfullscreen", "true");
  el.setAttribute("mozallowfullscreen", "true");
  el.setAttribute("allowtransparency", "true");
  const allow = el.getAttribute("allow") || "";
  if (!/fullscreen/i.test(allow)) {
    el.setAttribute(
      "allow",
      allow
        ? `${allow}; fullscreen *`
        : "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen *"
    );
  }
}

/**
 * Direct provider iframe — no sandbox, no shell.
 * Providers detect ancestor sandbox and show "please disable sandbox";
 * popup ads can only be reduced via parent window.open guard (see block-ad-nav).
 */
export default function EmbedStreamFrame({ src, title, iframeRef, onLoad }: EmbedStreamFrameProps) {
  useLayoutEffect(() => {
    const el = iframeRef.current;
    if (el) applyFullscreenPermissions(el);
  }, [iframeRef, src]);

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title={title}
      tabIndex={0}
      referrerPolicy="origin"
      loading="eager"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen *"
      allowFullScreen
      onLoad={(e) => {
        applyFullscreenPermissions(e.currentTarget);
        onLoad?.();
      }}
      className="player-embed-iframe absolute inset-0 z-[10] h-full w-full border-0"
    />
  );
}
