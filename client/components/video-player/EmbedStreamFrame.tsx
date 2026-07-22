"use client";

import { useEffect, useRef, useLayoutEffect, type RefObject } from "react";
import { getEmbedIframeSandbox } from "@/lib/block-ad-nav";

interface EmbedStreamFrameProps {
  src: string;
  title: string;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  onLoad?: () => void;
  onError?: () => void;
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

export default function EmbedStreamFrame({ src, title, iframeRef, onLoad, onError }: EmbedStreamFrameProps) {
  const sandboxAttr = getEmbedIframeSandbox(src);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onErrorRef = useRef(onError);

  useLayoutEffect(() => {
    const el = iframeRef.current;
    if (el) applyFullscreenPermissions(el);
  }, [iframeRef, src]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!src) return;

    timeoutRef.current = setTimeout(() => {
      onErrorRef.current?.();
    }, 4000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [src]);

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
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        onLoad?.();
      }}
      className="player-embed-iframe absolute inset-0 z-[10] h-full w-full border-0"
    />
  );
}
