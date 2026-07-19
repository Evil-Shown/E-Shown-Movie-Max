/** Block ad popups from embed players — never blocks in-iframe stream/CDN traffic. */

const BLOCKED_HOST_PATTERNS = [
  /(^|\.)1xbet\./i,
  /(^|\.)xbet\./i,
  /(^|\.)melbet\./i,
  /(^|\.)betway\./i,
  /(^|\.)stake\.com$/i,
  /(^|\.)parimatch\./i,
  /(^|\.)bet365\./i,
  /(^|\.)pin-up\./i,
  /(^|\.)mostbet\./i,
  /(^|\.)linebet\./i,
  /(^|\.)22bet\./i,
  /(^|\.)betwinner\./i,
  /(^|\.)1win\./i,
  /(^|\.)clickunder/i,
  /(^|\.)popads\./i,
  /(^|\.)propellerads\./i,
  /(^|\.)exoclick\./i,
  /(^|\.)adsterra\./i,
  /(^|\.)popcash\./i,
  /(^|\.)juicyads\./i,
  /(^|\.)trafficjunky\./i,
  /(^|\.)doubleclick\./i,
  /(^|\.)googlesyndication\./i,
];

const BLOCKED_PATH_PATTERNS = [/clickunder/i, /popunder/i, /[?&]tag=d_/i, /\/ads?\//i];

/** Known stream / trailer hosts — allowed even in strict player mode. */
const ALLOWED_POPUP_HOST_PATTERNS = [
  /(^|\.)vidfast\./i,
  /(^|\.)vidlink\.pro$/i,
  /(^|\.)multiembed\.mov$/i,
  /(^|\.)autoembed\.co$/i,
  /(^|\.)vidsrc\.(pm|cc|to|me|xyz|net)$/i,
  /(^|\.)youtube\.com$/i,
  /(^|\.)youtube-nocookie\.com$/i,
  /(^|\.)youtu\.be$/i,
  /(^|\.)googlevideo\.com$/i,
  /(^|\.)www\.youtube\.com$/i,
];

export function isBlockedAdUrl(raw: string): boolean {
  if (!raw || typeof raw !== "string") return false;

  try {
    const url = new URL(raw, typeof window !== "undefined" ? window.location.origin : "https://localhost");
    const host = url.hostname.toLowerCase();
    const href = url.href.toLowerCase();

    if (BLOCKED_HOST_PATTERNS.some((pattern) => pattern.test(host))) return true;
    if (BLOCKED_PATH_PATTERNS.some((pattern) => pattern.test(href))) return true;
    return false;
  } catch {
    const lower = raw.toLowerCase();
    return lower.includes("1xbet") || lower.includes("clickunder") || lower.includes("xbet.lk");
  }
}

export function isAllowedStreamPopupUrl(raw: string): boolean {
  if (!raw || typeof raw !== "string") return false;

  try {
    const url = new URL(raw, typeof window !== "undefined" ? window.location.origin : "https://localhost");
    const host = url.hostname.toLowerCase();

    if (typeof window !== "undefined" && host === window.location.hostname) return true;
    return ALLOWED_POPUP_HOST_PATTERNS.some((pattern) => pattern.test(host));
  } catch {
    return false;
  }
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
 * opens that bubble to the top window). Does not touch iframe network requests.
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

  return () => {
    window.open = originalOpen;
  };
}
