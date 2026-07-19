/**
 * Injected into proxied embed HTML (Express + mirrored in workers/embed-proxy).
 * Blocks popups / clickunders without sandboxing the player iframe.
 */

const SAFE_SCRIPT_HOST_RE =
  /(^|\.)(vidsrc|vidfast|vidlink|2embed|multiembed|autoembed|embedsu|superembed|oviesphere|googlevideo|youtube|ytimg|jwplatform|jwpcdn|cloudflare|cloudfront|fastly|akamai|bunnycdn|jsdelivr|unpkg|jquery|googleapis|gstatic|bootstrapcdn|fontawesome|plyr|hls\.js|cdnjs)(\.|$)/i;

const KNOWN_AD_SCRIPT_RE =
  /<script[^>]*src=["'][^"']*(popads|propellerads|adsterra|adskeeper|exoclick|onclickads|popcash|juicyads|clickunder|trafficjunky|doubleclick|googlesyndication|adnxs|pubmatic|openx|rubiconproject|moatads|outbrain|taboola)[^"']*["'][^>]*>\s*<\/script>/gi;

/** Strip known ad networks + third-party scripts not on the stream allowlist. */
export function stripAdScripts(html: string): string {
  let out = String(html || "");
  out = out.replace(KNOWN_AD_SCRIPT_RE, "");
  out = out.replace(/<script[^>]*\bsrc=["']([^"']+)["'][^>]*>\s*<\/script>/gi, (match, src: string) => {
    try {
      const host = new URL(src, "https://example.invalid").hostname.toLowerCase();
      if (!host || host === "example.invalid") return match; // relative → keep (provider)
      if (SAFE_SCRIPT_HOST_RE.test(host)) return match;
      return "";
    } catch {
      return match;
    }
  });
  return out;
}

/** Early <head> guard: popup blockers, overlay hide, nested iframe FS perms. */
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
      } catch (_) {}
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
        var href = String(this.getAttribute("href") || "");
        if (/^https?:/i.test(href) && target === "_blank") return;
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
      var href = String(a.getAttribute("href") || "").toLowerCase();
      if (target === "_blank" || target === "_parent" || target === "_top") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (!href || href.charAt(0) === "#" || href.indexOf("javascript:") === 0) return;
      if (/^https?:/i.test(href) && target === "_blank") {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    function isPlayerSurface(el) {
      if (!el || !el.closest) return false;
      if (el.tagName === "VIDEO" || el.tagName === "IFRAME") return true;
      return Boolean(
        el.closest("video, iframe, .jwplayer, .plyr, [class*='player'], [id*='player'], [class*='video']")
      );
    }

    function hideAdOverlay(el) {
      if (!el || el.nodeType !== 1 || isPlayerSurface(el)) return;
      var style;
      try { style = window.getComputedStyle(el); } catch (_) { return; }
      var z = parseInt(style.zIndex, 10) || 0;
      if (z < 9999) return;
      var pos = style.position;
      if (pos !== "fixed" && pos !== "absolute") return;
      var r = el.getBoundingClientRect();
      if (r.width < window.innerWidth * 0.7 || r.height < window.innerHeight * 0.7) return;
      if (el.querySelector && el.querySelector("video, iframe")) return;
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("pointer-events", "none", "important");
      el.setAttribute("data-chithra-ad-hidden", "1");
    }

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
      root.querySelectorAll("div, a, iframe").forEach(hideAdOverlay);
    }

    function boot() {
      scan(document);
      if (!window.MutationObserver) return;
      new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
          m.addedNodes.forEach(function (node) {
            if (!node || node.nodeType !== 1) return;
            if (node.tagName && node.tagName.toUpperCase() === "IFRAME") patchFrame(node);
            hideAdOverlay(node);
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
      try {
        if (window.HTMLVideoElement && HTMLVideoElement.prototype) {
          HTMLVideoElement.prototype.webkitEnterFullscreen = wrapEnter(
            HTMLVideoElement.prototype.webkitEnterFullscreen
          );
          HTMLVideoElement.prototype.webkitExitFullscreen = wrapExit(
            HTMLVideoElement.prototype.webkitExitFullscreen
          );
        }
      } catch (_) {}
    }
  } catch (_) {}
})();
</script>`.trim();
}
