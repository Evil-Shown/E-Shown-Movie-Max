/**
 * Injected into proxied embed HTML (Express + Cloudflare Worker).
 * No sandbox on the app iframe — popup kill happens inside the proxied document.
 */

const KNOWN_AD_SCRIPT_RE =
  /<script[^>]*src=["'][^"']*(popads|propellerads|adsterra|adskeeper|exoclick|onclickads|popcash|juicyads|clickunder|trafficjunky|doubleclick|googlesyndication|adnxs|pubmatic|openx|rubiconproject|moatads|outbrain|taboola)[^"']*["'][^>]*>\s*<\/script>/gi;

/** Strip known ad-network scripts only (keep provider/CDN player JS). */
export function stripAdScripts(html: string): string {
  return String(html || "").replace(KNOWN_AD_SCRIPT_RE, "");
}

/**
 * Nuclear anti-popup: window.open + fake <a>.click() + target=_blank + capture-phase link kills.
 * Does not touch <video> / button clicks.
 */
export function buildAntiAdGuardScript(): string {
  return `
<script data-chithra-guard="1">
(function () {
  try {
    var noop = function () { return null; };

    function lockOpen(win) {
      if (!win) return;
      try { win.open = noop; } catch (_) {}
      try {
        Object.defineProperty(win, "open", {
          configurable: false,
          writable: false,
          value: noop
        });
      } catch (_) {
        try { win.open = noop; } catch (e2) {}
      }
    }

    lockOpen(window);
    try { lockOpen(window.top); } catch (_) {}
    try { lockOpen(window.parent); } catch (_) {}

    // B. Fake anchor .click() clickunders
    try {
      var nativeClick = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () {
        var target = String(this.getAttribute("target") || this.target || "").toLowerCase();
        var href = String(this.getAttribute("href") || this.href || "");
        if (target === "_blank" || target === "_parent" || target === "_top") return;
        if (/^https?:/i.test(href)) return;
        return nativeClick.apply(this, arguments);
      };
    } catch (_) {}

    try {
      var nativeDispatch = HTMLAnchorElement.prototype.dispatchEvent;
      HTMLAnchorElement.prototype.dispatchEvent = function (evt) {
        if (evt && String(evt.type).toLowerCase() === "click") {
          var target = String(this.getAttribute("target") || "").toLowerCase();
          if (target === "_blank" || target === "_parent" || target === "_top") return false;
          var href = String(this.getAttribute("href") || "");
          if (/^https?:/i.test(href)) return false;
        }
        return nativeDispatch.call(this, evt);
      };
    } catch (_) {}

    // C. Force links to stay inside the iframe
    try {
      Object.defineProperty(HTMLAnchorElement.prototype, "target", {
        configurable: true,
        enumerable: true,
        get: function () { return "_self"; },
        set: function () {
          try { this.setAttribute("target", "_self"); } catch (_) {}
        }
      });
    } catch (_) {}

    // D. Capture-phase: kill real clicks on <a> (ads). Video/button controls unaffected.
    document.addEventListener("click", function (e) {
      var node = e.target;
      while (node && node.tagName !== "A") {
        node = node.parentElement;
      }
      if (!node) return;
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
      return false;
    }, true);

    // Nested player iframes → fullscreen permission
    function patchFrame(el) {
      if (!el || !el.tagName || el.tagName.toUpperCase() !== "IFRAME") return;
      el.setAttribute("allowfullscreen", "");
      el.setAttribute("webkitallowfullscreen", "true");
      el.setAttribute("mozallowfullscreen", "true");
      var allow = el.getAttribute("allow") || "";
      if (!/fullscreen/i.test(allow)) {
        el.setAttribute("allow", allow ? allow + "; fullscreen" : "fullscreen");
      }
    }
    function scan(root) {
      if (!root || !root.querySelectorAll) return;
      root.querySelectorAll("iframe").forEach(patchFrame);
    }
    function boot() {
      scan(document);
      if (!window.MutationObserver) return;
      new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
          m.addedNodes.forEach(function (node) {
            if (!node || node.nodeType !== 1) return;
            if (node.tagName && node.tagName.toUpperCase() === "IFRAME") patchFrame(node);
            scan(node);
          });
        });
      }).observe(document.documentElement, { childList: true, subtree: true });
    }
    if (document.body) boot();
    else document.addEventListener("DOMContentLoaded", boot);

    // Fullscreen bridge → parent stage (header FS path) if native fails
    if (window.parent && window.parent !== window) {
      function postFs(eventName) {
        try {
          window.parent.postMessage({ source: "chithra-embed", event: eventName }, "*");
        } catch (_) {}
        return Promise.resolve();
      }
      function wrapEnter(orig) {
        return function () {
          var ctx = this, args = arguments;
          if (typeof orig !== "function") return postFs("fullscreen");
          try {
            var result = orig.apply(ctx, args);
            if (result && typeof result.then === "function") {
              return result.catch(function () { return postFs("fullscreen"); });
            }
            return result;
          } catch (_) {
            return postFs("fullscreen");
          }
        };
      }
      try {
        Element.prototype.requestFullscreen = wrapEnter(Element.prototype.requestFullscreen);
        Element.prototype.webkitRequestFullscreen = wrapEnter(Element.prototype.webkitRequestFullscreen);
        Element.prototype.webkitRequestFullScreen = wrapEnter(Element.prototype.webkitRequestFullScreen);
        Element.prototype.mozRequestFullScreen = wrapEnter(Element.prototype.mozRequestFullScreen);
        Element.prototype.msRequestFullscreen = wrapEnter(Element.prototype.msRequestFullscreen);
      } catch (_) {}
    }
  } catch (_) {}
})();
</script>`.trim();
}
