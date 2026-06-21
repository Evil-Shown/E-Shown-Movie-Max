async function fetchM3u(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(25000) });
  return r.text();
}

function parseM3u(text, filterFn = () => true) {
  const lines = text.split("\n");
  const items = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {
      const nameMatch = lines[i].match(/,(.+)$/);
      const tvgId = lines[i].match(/tvg-id="([^"]+)"/);
      const logo = lines[i].match(/tvg-logo="([^"]+)"/);
      const url = lines[i + 1]?.trim();
      if (url && url.startsWith("http")) {
        const item = {
          name: nameMatch?.[1]?.trim(),
          tvgId: tvgId?.[1],
          logo: logo?.[1],
          url,
        };
        if (filterFn(item)) items.push(item);
      }
    }
  }
  return items;
}

const skipHosts = ["allinonereborn", "149.71.34.166", "free.fullspeed.tv"];
const isDirect = (item) => !skipHosts.some((h) => item.url.includes(h));

const [lk, news, sports, kids, doc, ent] = await Promise.all([
  fetchM3u("https://iptv-org.github.io/iptv/countries/lk.m3u"),
  fetchM3u("https://iptv-org.github.io/iptv/categories/news.m3u"),
  fetchM3u("https://iptv-org.github.io/iptv/categories/sports.m3u"),
  fetchM3u("https://iptv-org.github.io/iptv/categories/kids.m3u"),
  fetchM3u("https://iptv-org.github.io/iptv/categories/documentary.m3u"),
  fetchM3u("https://iptv-org.github.io/iptv/categories/entertainment.m3u"),
]);

console.log("=== LK direct ===");
console.log(JSON.stringify(parseM3u(lk, isDirect), null, 2));

console.log("\n=== NEWS sample (direct) ===");
const newsDirect = parseM3u(news, isDirect);
console.log(newsDirect.slice(0, 20).map((x) => `${x.name} => ${x.url.slice(0, 100)}`));
console.log("news count", newsDirect.length);

console.log("\n=== SPORTS sample ===");
const sportsDirect = parseM3u(sports, isDirect);
console.log(sportsDirect.slice(0, 15).map((x) => x.name));
console.log("sports count", sportsDirect.length);

console.log("\n=== KIDS sample ===");
console.log(parseM3u(kids, isDirect).slice(0, 10).map((x) => x.name));

console.log("\n=== DOC sample ===");
console.log(parseM3u(doc, isDirect).slice(0, 10).map((x) => x.name));
