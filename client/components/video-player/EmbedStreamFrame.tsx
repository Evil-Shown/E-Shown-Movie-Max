"use client";

import { useLayoutEffect, type RefObject } from "react";
import { getEmbedIframeSandbox } from "@/lib/block-ad-nav";

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
 * Hybrid sandbox embed:
 * - VidFast: no sandbox (detects it and hangs)
 * - Other providers: sandbox without allow-popups (kills iframe popups in browsers)
 * Desktop/mobile add native request blocking on top of this shared iframe.
 */
export default function EmbedStreamFrame({ src, title, iframeRef, onLoad }: EmbedStreamFrameProps) {
  const sandboxAttr = getEmbedIframeSandbox(src);

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
      {...(sandboxAttr ? { sandbox: sandboxAttr } : {})}
      onLoad={(e) => {
        applyFullscreenPermissions(e.currentTarget);
        onLoad?.();
      }}
      className="player-embed-iframe absolute inset-0 z-[10] h-full w-full border-0"
    />
  );
}
