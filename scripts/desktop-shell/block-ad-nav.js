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
  /(^|\.)adsterra\./i
];

const BLOCKED_PATH_PATTERNS = [/clickunder/i, /popunder/i, /[?&]tag=d_/i];

function isBlockedAdUrl(raw) {
  if (!raw || typeof raw !== "string") return false;

  try {
    const url = new URL(raw);
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

module.exports = { isBlockedAdUrl };
