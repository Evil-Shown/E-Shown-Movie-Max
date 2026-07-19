/**
 * Cloudflare Worker — embed HTML proxy + media passthrough.
 *
 * IMPORTANT: VidFast (Next.js SPA) often still fails through any HTML proxy
 * because the document origin becomes *.workers.dev. Prefer
 * NEXT_PUBLIC_USE_EMBED_PROXY=false for that provider.
 *
 * This Worker:
 * - Allowlists only initial HTML embed hosts
 * - Lets stream/API/CDN requests through (any host)
 * - Spoofs Referer via ?ref= (provider origin) for CDNs
 * - Injects fetch/XHR bridge + popup blockers into HTML
 */

const EMBED_SUFFIXES = [
  "vidsrc.to",
  "vidsrc.xyz",
  "vidsrc.me",
  "vidsrc.cc",
  "vidsrc.pm",
  "vidsrc.in",
  "2embed.cc",
  "2embed.to",
  "2embed.skin",
  "embedsu.net",
  "multiembed.mov",
  "superembed.stream",
  "oviesphere.xyz",
  "vidfast.pro",
  "vidfast.vc",
  "vidfast.cc",
  "vidfast.co",
  "vidlink.pro",
  "autoembed.co",
];

function hostAllowed(hostname) {
  const host = String(hostname || "").toLowerCase();
  return EMBED_SUFFIXES.some((d) => host === d || host.endsWith("." + d));
}

function cors(extra = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Expose-Headers": "*",
    ...extra,
  };
}

function isHtmlNavigation(request) {
  const accept = (request.headers.get("accept") || "").toLowerCase();
  if (!accept || accept === "*/*") return false;
  return accept.includes("text/html");
}

function injectScript(workerOrigin, providerOrigin) {
  return `<script data-chithra-guard="1">
(function(){
  try {
    var WORKER_URL = ${JSON.stringify(workerOrigin)};
    var PROXY_ORIGIN = ${JSON.stringify(providerOrigin)};
    function abs(u){ try { return new URL(String(u), PROXY_ORIGIN).href; } catch(e){ return u; } }
    function toProxy(u){
      try {
        var a = abs(u);
        if (!a || a.indexOf(WORKER_URL)===0) return a;
        if (!/^https?:/i.test(a)) return a;
        return WORKER_URL + "/?url=" + encodeURIComponent(a) + "&ref=" + encodeURIComponent(PROXY_ORIGIN);
      } catch(e){ return u; }
    }
    var ofetch = window.fetch;
    window.fetch = function(input, init){
      try {
        if (typeof input === "string") return ofetch.call(this, toProxy(input), init);
        if (input && typeof Request !== "undefined" && input instanceof Request) {
          var p = toProxy(input.url);
          if (p !== input.url) input = new Request(p, input);
        }
      } catch(e){}
      return ofetch.call(this, input, init);
    };
    var oopen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(){
      var args = Array.prototype.slice.call(arguments);
      if (typeof args[1]==="string") args[1]=toProxy(args[1]);
      return oopen.apply(this, args);
    };
    var noop = function(){ return null; };
    try { window.open = noop; } catch(e){}
    try { if (window.top) window.top.open = noop; } catch(e){}
    try {
      var nc = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function(){
        var t = String(this.getAttribute("target")||"").toLowerCase();
        var h = String(this.getAttribute("href")||this.href||"");
        if (t==="_blank"||t==="_parent"||t==="_top") return;
        if (/^https?:/i.test(h)) return;
        return nc.apply(this, arguments);
      };
    } catch(e){}
    try {
      Object.defineProperty(HTMLAnchorElement.prototype,"target",{
        configurable:true, enumerable:true,
        get:function(){ return "_self"; },
        set:function(){ try{ this.setAttribute("target","_self"); }catch(e){} }
      });
    } catch(e){}
    document.addEventListener("click", function(e){
      var t=e.target;
      while(t && t.tagName!=="A") t=t.parentElement;
      if(!t) return;
      e.preventDefault(); e.stopPropagation();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();
      return false;
    }, true);
  } catch(e){}
})();
</script>`;
}

function rewriteM3u8(text, workerOrigin, playlistUrl, ref) {
  const base = new URL(playlistUrl);
  const dir = base.href.slice(0, base.href.lastIndexOf("/") + 1);
  const refQ = ref ? `&ref=${encodeURIComponent(ref)}` : "";
  const prox = (raw) => {
    let s = String(raw || "").trim();
    if (!s) return s;
    try {
      if (s.startsWith("/")) s = base.origin + s;
      else if (!/^https?:\/\//i.test(s)) s = dir + s;
      return `${workerOrigin}/?url=${encodeURIComponent(new URL(s).href)}${refQ}`;
    } catch {
      return raw;
    }
  };
  return String(text || "")
    .split("\n")
    .map((line) => {
      const t = line.trim();
      if (!t) return line;
      if (t.startsWith("#") && /URI="/i.test(t)) {
        return t.replace(/URI="([^"]+)"/i, (_m, uri) => `URI="${prox(uri)}"`);
      }
      if (t.startsWith("#")) return line;
      return prox(t);
    })
    .join("\n");
}

function hardenHtml(html, workerOrigin, providerOrigin) {
  let out = String(html || "");
  out = out.replace(/<meta[^>]+http-equiv=["']content-security-policy["'][^>]*>/gi, "");
  out = out.replace(/<base\s[^>]*>/gi, "");
  const inject = `<base href="${providerOrigin}/">${injectScript(workerOrigin, providerOrigin)}`;
  if (/<head([^>]*)>/i.test(out)) out = out.replace(/<head([^>]*)>/i, `<head$1>${inject}`);
  else out = inject + out;
  return out;
}

function upstreamHeaders(request, spoofOrigin) {
  const out = new Headers();
  const drop = new Set([
    "host",
    "connection",
    "content-length",
    "cookie",
    "cf-connecting-ip",
    "cf-ray",
    "x-forwarded-for",
    "x-forwarded-proto",
    "x-real-ip",
    "forwarded",
    "origin",
    "referer",
  ]);
  for (const [k, v] of request.headers.entries()) {
    if (drop.has(k.toLowerCase())) continue;
    try {
      out.set(k, v);
    } catch {
      /* ignore */
    }
  }
  out.set(
    "User-Agent",
    request.headers.get("user-agent") ||
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
  );
  const ref = spoofOrigin.endsWith("/") ? spoofOrigin : spoofOrigin + "/";
  out.set("Referer", ref);
  try {
    out.set("Origin", new URL(spoofOrigin).origin);
  } catch {
    out.set("Origin", spoofOrigin);
  }
  return out;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors() });
    }

    const targetUrl = url.searchParams.get("url");
    if (!targetUrl) return new Response("Missing url", { status: 400, headers: cors() });

    let target;
    try {
      target = new URL(targetUrl);
    } catch {
      return new Response("Invalid url", { status: 400, headers: cors() });
    }
    if (target.protocol !== "http:" && target.protocol !== "https:") {
      return new Response("Invalid protocol", { status: 400, headers: cors() });
    }

    // Only gate the initial HTML iframe navigation — not streams/APIs/CDNs.
    if (isHtmlNavigation(request) && !hostAllowed(target.hostname)) {
      return new Response("Domain not allowed for initial embed", { status: 403, headers: cors() });
    }

    const refParam = (url.searchParams.get("ref") || "").trim();
    let spoof = target.origin;
    if (refParam) {
      try {
        spoof = new URL(refParam).origin;
      } catch {
        spoof = refParam;
      }
    }

    const init = {
      method: request.method,
      headers: upstreamHeaders(request, spoof),
      redirect: "follow",
    };
    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
      init.duplex = "half";
    }

    let response;
    try {
      response = await fetch(target.href, init);
    } catch {
      return new Response("Upstream fetch failed", { status: 502, headers: cors() });
    }

    const ct = response.headers.get("content-type") || "";
    const workerOrigin = url.origin;

    if (ct.includes("text/html")) {
      if (!hostAllowed(target.hostname)) {
        return new Response("HTML host not allowed", { status: 403, headers: cors() });
      }
      const html = hardenHtml(await response.text(), workerOrigin, target.origin);
      return new Response(html, {
        status: response.status,
        headers: cors({
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=60",
          "X-Embed-Proxy": "cloudflare-worker",
        }),
      });
    }

    const path = target.href.toLowerCase();
    if (
      (ct.includes("mpegurl") || path.includes(".m3u8")) &&
      request.method === "GET"
    ) {
      const rewritten = rewriteM3u8(await response.text(), workerOrigin, target.href, spoof);
      return new Response(rewritten, {
        status: response.status,
        headers: cors({
          "Content-Type": "application/vnd.apple.mpegurl",
          "Cache-Control": "no-cache",
          "X-Embed-Proxy": "cloudflare-worker-m3u8",
        }),
      });
    }

    const headers = new Headers(cors());
    for (const key of [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
      "cache-control",
      "etag",
      "last-modified",
    ]) {
      const v = response.headers.get(key);
      if (v) headers.set(key, v);
    }
    headers.set("X-Embed-Proxy", "cloudflare-worker-passthrough");
    return new Response(response.body, { status: response.status, headers });
  },
};
