/** Block gambling popups from embed players — do NOT block in-iframe network requests. */

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
];

const BLOCKED_PATH_PATTERNS = [
  /clickunder/i,
  /popunder/i,
  /[?&]tag=d_/i,
];

export function isBlockedAdUrl(raw: string): boolean {
  if (!raw || typeof raw !== "string") return false;

  try {
    const url = new URL(raw, typeof window !== "undefined" ? window.location.origin : "https://localhost");
    const host = url.hostname.toLowerCase();
    const href = url.href.toLowerCase();

    if (BLOCKED_HOST_PATTERNS.some((pattern) => pattern.test(host))) {
      return true;
    }

    if (BLOCKED_PATH_PATTERNS.some((pattern) => pattern.test(href))) {
      return true;
    }

    return false;
  } catch {
    const lower = raw.toLowerCase();
    return lower.includes("1xbet") || lower.includes("clickunder") || lower.includes("xbet.lk");
  }
}

/** Only intercepts window.open popups — never blocks iframe scripts or video CDNs. */
export function installAdPopupBlocker(): () => void {
  if (typeof window === "undefined") return () => undefined;

  const originalOpen = window.open.bind(window);

  window.open = function openGuard(url, target, features) {
    if (typeof url === "string" && isBlockedAdUrl(url)) {
      console.warn("[CHITHRA] Blocked ad popup:", url);
      return null;
    }
    return originalOpen(url, target, features);
  };

  return () => {
    window.open = originalOpen;
  };
}
