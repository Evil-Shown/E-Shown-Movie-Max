/**
 * Injected into proxied embed HTML (Express + mirrored in workers/embed-proxy).
 * Blocks popups / clickunders without sandboxing the player iframe.
 *
 * Keep this conservative: aggressive DOM hiding / script stripping breaks
 * SPA embeds (VidFast etc.) and leaves them stuck on "Fetching…".
 */

const KNOWN_AD_SCRIPT_RE =
  /<script[^>]*src=["'][^"']*(popads|propellerads|adsterra|adskeeper|exoclick|onclickads|popcash|juicyads|clickunder|trafficjunky|doubleclick|googlesyndication|adnxs|pubmatic|openx|rubiconproject|moatads|outbrain|taboola)[^"']*["'][^>]*>\s*<\/script>/gi;

/** Strip known ad-network scripts only (do not remove provider/CDN player JS). */
export function stripAdScripts(html: string): string {
  return String(html || "").replace(KNOWN_AD_SCRIPT_RE, "");
}

/** Early <head> guard: popup blockers + nested iframe FS perms. */
export function buildAntiAdGuardScript(): string {
  return `
<script data-chithra-guard="1">
(function () {
  try {
    var noop = function () { return null; };

    function lockOpen(win) {
      if (!win) return;
      try { win.open = noop; } catch (_) {}
    }

    lockOpen(window);
    try { lockOpen(window.top); } catch (_) {}
    try { lockOpen(window.parent); } catch (_) {}

    // Fake <a target=_blank>.click() / dispatchEvent clickunders
    try {
      var origClick = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () {
        var target = String(this.getAttribute("target") || "").toLowerCase();
        if (target === "_blank" || target === "_parent" || target === "_top") return;
        return origClick.apply(this, arguments);
      };
    } catch (_) {}

    try {
      var origDispatch = HTMLAnchorElement.prototype.dispatchEvent;
      HTMLAnchorElement.prototype.dispatchEvent = function (evt) {
        if (evt && String(evt.type).toLowerCase() === "click") {
          var target = String(this.getAttribute("target") || "").toLowerCase();
          if (target === "_blank" || target === "_parent" || target === "_top") return false;
        }
        return origDispatch.call(this, evt);
      };
    } catch (_) {}

    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a") : null;
      if (!a) return;
      var target = String(a.getAttribute("target") || "").toLowerCase();
      if (target === "_blank" || target === "_parent" || target === "_top") {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

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

    // Fullscreen: try native, else ask parent stage (header FS path).
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
      function wrapExit(orig) {
        return function () {
          var ctx = this, args = arguments;
          if (typeof orig !== "function") return postFs("exit-fullscreen");
          try {
            var result = orig.apply(ctx, args);
            if (result && typeof result.then === "function") {
              return result.catch(function () { return postFs("exit-fullscreen"); });
            }
            return result;
          } catch (_) {
            return postFs("exit-fullscreen");
          }
        };
      }
      try {
        Element.prototype.requestFullscreen = wrapEnter(Element.prototype.requestFullscreen);
        Element.prototype.webkitRequestFullscreen = wrapEnter(Element.prototype.webkitRequestFullscreen);
        Element.prototype.webkitRequestFullScreen = wrapEnter(Element.prototype.webkitRequestFullScreen);
        Element.prototype.mozRequestFullScreen = wrapEnter(Element.prototype.mozRequestFullScreen);
        Element.prototype.msRequestFullscreen = wrapEnter(Element.prototype.msRequestFullscreen);
        Document.prototype.exitFullscreen = wrapExit(Document.prototype.exitFullscreen);
        Document.prototype.webkitExitFullscreen = wrapExit(Document.prototype.webkitExitFullscreen);
        Document.prototype.mozCancelFullScreen = wrapExit(Document.prototype.mozCancelFullScreen);
        Document.prototype.msExitFullscreen = wrapExit(Document.prototype.msExitFullscreen);
      } catch (_) {}
    }
  } catch (_) {}
})();
</script>`.trim();
}
