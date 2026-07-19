/**
 * Mobile WebView ad navigation gate — shared rules from @chithra/core.
 */
export {
  isBlockedAdUrl,
  isEmbedProviderUrl,
  shouldAllowEmbedNavigation,
  shouldBypassEmbedSandbox,
} from "@chithra/core/ad-block";

import { shouldAllowEmbedNavigation } from "@chithra/core/ad-block";

type EmbedLoadRequest = {
  url: string;
  isTopFrame?: boolean;
};

/** RN WebView onShouldStartLoadWithRequest handler factory. */
export function createEmbedShouldStartLoad(embedUrl: string | null | undefined) {
  return (request: EmbedLoadRequest): boolean => {
    const allowed = shouldAllowEmbedNavigation(request.url, {
      embedUrl,
      isTopFrame: request.isTopFrame !== false,
    });
    if (!allowed) {
      console.warn("[CHITHRA] Blocked WebView navigation:", request.url);
    }
    return allowed;
  };
}
