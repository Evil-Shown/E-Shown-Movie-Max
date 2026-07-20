/**
 * Web fallback ad popup guard.
 * Cross-origin iframe popups need hybrid sandbox (EmbedStreamFrame) or
 * native shells (Electron / RN WebView) — this only covers parent window.open.
 */

import {
  isAllowedStreamPopupUrl as sharedIsAllowedStreamPopupUrl,
  isBlockedAdUrl as sharedIsBlockedAdUrl,
} from "@chithra/core/ad-block";

export {
  getEmbedIframeSandbox,
  shouldBypassEmbedSandbox,
  EMBED_IFRAME_SANDBOX,
} from "@chithra/core/ad-block";

export function isBlockedAdUrl(raw: string): boolean {
  return sharedIsBlockedAdUrl(raw);
}

export function isAllowedStreamPopupUrl(raw: string): boolean {
  const sameOrigin =
    typeof window !== "undefined" ? window.location.hostname : undefined;
  return sharedIsAllowedStreamPopupUrl(raw, sameOrigin);
}

function isBlankPopupUrl(url: unknown): boolean {
  if (url == null) return true;
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  return trimmed === "" || trimmed === "about:blank" || trimmed === "about:blank#blocked";
}

type OpenGuardOptions = {
  /** While the player is open: only allow stream/trailer/same-origin popups. */
  strict?: boolean;
};

/**
 * Only intercepts window.open from the parent page (and some embed-initiated
 * opens that bubble to the top window). Cross-origin iframe popups cannot be
 * fully blocked without sandbox (non-VidFast) or a native shell.
 */
export function installAdPopupBlocker(options: OpenGuardOptions = {}): () => void {
  if (typeof window === "undefined") return () => undefined;

  const { strict = true } = options;
  const originalOpen = window.open.bind(window);

  window.open = function openGuard(url, target, features) {
    if (isBlankPopupUrl(url)) {
      console.warn("[CHITHRA] Blocked blank/ad popup");
      return null;
    }

    if (typeof url === "string") {
      if (isBlockedAdUrl(url)) {
        console.warn("[CHITHRA] Blocked ad popup:", url);
        return null;
      }
      if (strict && !isAllowedStreamPopupUrl(url)) {
        console.warn("[CHITHRA] Blocked non-stream popup:", url);
        return null;
      }
    }

    return originalOpen(url, target, features);
  };

  const onBlur = () => {
    window.setTimeout(() => {
      try {
        if (document.hidden) return;
        window.focus();
      } catch {
        // ignore
      }
    }, 0);
  };
  window.addEventListener("blur", onBlur);

  return () => {
    window.open = originalOpen;
    window.removeEventListener("blur", onBlur);
  };
};
