import type { WebTorrentLikeCtor } from "./types";

const WEBTORRENT_FALLBACK_SCRIPT_ID = "webtorrent-browser-fallback";
const WEBTORRENT_FALLBACK_SCRIPT_SRC = "https://cdn.jsdelivr.net/npm/webtorrent@latest/dist/webtorrent.min.js";

export function hasBrowserTorrentPrerequisites() {
  return typeof window !== "undefined" && typeof window.RTCPeerConnection !== "undefined";
}

function loadWebTorrentFromCdn(): Promise<WebTorrentLikeCtor> {
  return new Promise((resolve, reject) => {
    if (window.WebTorrent) {
      resolve(window.WebTorrent);
      return;
    }

    const existing = document.getElementById(WEBTORRENT_FALLBACK_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.WebTorrent) resolve(window.WebTorrent);
        else reject(new Error("WebTorrent fallback did not expose constructor."));
      });
      existing.addEventListener("error", () => reject(new Error("WebTorrent fallback script failed to load.")));
      return;
    }

    const script = document.createElement("script");
    script.id = WEBTORRENT_FALLBACK_SCRIPT_ID;
    script.src = WEBTORRENT_FALLBACK_SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      if (window.WebTorrent) resolve(window.WebTorrent);
      else reject(new Error("WebTorrent fallback did not expose constructor."));
    };
    script.onerror = () => reject(new Error("WebTorrent fallback script failed to load."));
    document.head.appendChild(script);
  });
}

export async function loadWebTorrentCtor(): Promise<WebTorrentLikeCtor> {
  if (!hasBrowserTorrentPrerequisites()) {
    throw new Error("WebTorrent requires a browser with WebRTC support.");
  }
  return loadWebTorrentFromCdn();
}
