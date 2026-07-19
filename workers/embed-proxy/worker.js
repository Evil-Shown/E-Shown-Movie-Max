/**
 * Cloudflare Worker: embed HTML proxy (conservative).
 *
 * NOTE: Proxying SPA embeds (VidFast etc.) changes the document origin and can
 * leave players stuck on "Fetching…". Prefer NEXT_PUBLIC_USE_EMBED_PROXY=false
 * unless you've verified the provider works through this Worker.
 *
 * Deploy + set:
 *   NEXT_PUBLIC_EMBED_PROXY_WORKER_URL=https://embed-proxy.<you>.workers.dev
 *   NEXT_PUBLIC_USE_EMBED_PROXY=true
 */

const ALLOWED_SUFFIXES = [
  "vidfast.pro",
  "vidlink.pro",
  "multiembed.mov",
  "autoembed.co",
  "vidsrc.cc",
  "vidsrc.pm",
  "vidsrc.in",
  "vidsrc.to",
  "vidsrc.xyz",
  "vidsrc.me",
  "2embed.cc",
  "2embed.to",
  "2embed.skin",
  "embedsu.net",
  "superembed.stream",
  "oviesphere.xyz",
];

const KNOWN_AD_SCRIPT_RE =
  /<script[^>]*src=["'][^"']*(popads|propellerads|adsterra|adskeeper|exoclick|onclickads|popcash|juicyads|clickunder|trafficjunky|doubleclick|googlesyndication|adnxs|pubmatic|openx|rubiconproject|moatads|outbrain|taboola)[^"']*["'][^>]*>\s*<\/script>/gi;

const ANTI_AD_GUARD = `<script data-chithra-guard="1">
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

    try {
      var origClick = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () {
        var target = String(this.getAttribute("target") || "").toLowerCase();
        if (target === "_blank" || target === "_parent" || target === "_top") return;
        return origClick.apply(this, arguments);
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

    if (window.parent && window.parent !== window) {
      function postFs(eventName) {
        try { window.parent.postMessage({ source: "chithra-embed", event: eventName }, "*"); } catch (_) {}
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
          } catch (_) { return postFs("fullscreen"); }
        };
      }
      try {
        Element.prototype.requestFullscreen = wrapEnter(Element.prototype.requestFullscreen);
        Element.prototype.webkitRequestFullscreen = wrapEnter(Element.prototype.webkitRequestFullscreen);
      } catch (_) {}
    }
  } catch (_) {}
})();
</script>`;

function isAllowedHost(hostname) {
  const host = String(hostname || "").toLowerCase();
  return ALLOWED_SUFFIXES.some((suffix) => host === suffix || host.endsWith("." + suffix));
}

function ensureIframeFullscreen(html) {
  return String(html || "").replace(/<iframe\b([^>]*)>/gi, (_match, attrs) => {
    let next = attrs;
    if (!/\ballowfullscreen\b/i.test(next)) next += " allowfullscreen";
    if (!/\bwebkitallowfullscreen\b/i.test(next)) next += ' webkitallowfullscreen="true"';
    if (!/\bmozallowfullscreen\b/i.test(next)) next += ' mozallowfullscreen="true"';
    if (/\ballow\s*=\s*["'][^"']*["']/i.test(next)) {
      next = next.replace(/\ballow\s*=\s*(["'])([^"']*)\1/i, (_m, q, value) => {
        if (/fullscreen/i.test(value)) return `allow=${q}${value}${q}`;
        return `allow=${q}${value}; fullscreen${q}`;
      });
    } else {
      next += ' allow="fullscreen; autoplay; encrypted-media; picture-in-picture"';
    }
    return `<iframe${next}>`;
  });
}

function hardenHtml(html, origin) {
  let out = String(html || "");
  out = out.replace(/<meta[^>]+http-equiv=["']content-security-policy["'][^>]*>/gi, "");
  out = out.replace(KNOWN_AD_SCRIPT_RE, "");
  out = ensureIframeFullscreen(out);
  if (!/<base\s/i.test(out)) {
    out = out.replace(/<head([^>]*)>/i, `<head$1><base href="${origin}/">`);
  }
  if (/<head([^>]*)>/i.test(out)) {
    out = out.replace(/<head([^>]*)>/i, `<head$1>${ANTI_AD_GUARD}`);
  } else {
    out = `${ANTI_AD_GUARD}${out}`;
  }
  return out;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");

    if (!targetUrl) {
      return new Response("Missing url parameter", { status: 400 });
    }

    let target;
    try {
      target = new URL(targetUrl);
    } catch {
      return new Response("Invalid url parameter", { status: 400 });
    }

    if (target.protocol !== "http:" && target.protocol !== "https:") {
      return new Response("Invalid protocol", { status: 400 });
    }

    if (!isAllowedHost(target.hostname)) {
      return new Response("Domain not allowed", { status: 403 });
    }

    const upstream = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Referer: target.origin + "/",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    const contentType = upstream.headers.get("content-type") || "text/html; charset=utf-8";
    if (!contentType.includes("text/html")) {
      return new Response(upstream.body, {
        status: upstream.status,
        headers: {
          "Content-Type": contentType,
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=120",
        },
      });
    }

    const html = hardenHtml(await upstream.text(), target.origin);
    return new Response(html, {
      status: upstream.status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=120",
        "X-Embed-Proxy": "cloudflare-worker",
      },
    });
  },
};
