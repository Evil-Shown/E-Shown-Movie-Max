"use client";

import { useEffect } from "react";
import { useVideoPlayer } from "@/components/VideoPlayerProvider";

function pauseAllVideos() {
  document.querySelectorAll("video").forEach((video) => {
    if (!video.paused) {
      video.pause();
    }
  });
}

export default function DesktopMediaPauseHandler() {
  const { closePlayer } = useVideoPlayer();

  useEffect(() => {
    const desktop = window.chithraDesktop;
    if (!desktop?.onAppWindowEvent) return;

    const unsubscribe = desktop.onAppWindowEvent((type) => {
      if (type === "minimize" || type === "hide" || type === "quit") {
        closePlayer();
        pauseAllVideos();
      }
    });

    return unsubscribe;
  }, [closePlayer]);

  return null;
}
