async function fetchM3u(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(25000) });
  return r.text();
}

function parseM3u(text) {
  const lines = text.split("\n");
  const items = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {
      const nameMatch = lines[i].match(/,(.+)$/);
      const tvgId = lines[i].match(/tvg-id="([^"]+)"/);
      const logo = lines[i].match(/tvg-logo="([^"]+)"/);
      const url = lines[i + 1]?.trim();
      if (url && url.startsWith("http")) {
        items.push({
          name: nameMatch?.[1]?.replace(/\s*\[[^\]]+\]\s*$/g, "").trim(),
          tvgId: tvgId?.[1],
          logo: logo?.[1],
          url,
        });
      }
    }
  }
  return items;
}

const skipHosts = ["allinonereborn", "149.71.34.166", "free.fullspeed.tv"];
const isDirect = (item) => !skipHosts.some((h) => item.url.includes(h));

const searchTerms = [
  "CNN",
  "BBC",
  "Al Jazeera",
  "France 24",
  "DW",
  "Sky News",
  "Fox News",
  "ESPN",
  "Eurosport",
  "beIN",
  "Discovery",
  "National Geographic",
  "Cartoon Network",
  "Nickelodeon",
  "Disney",
  "MTV",
  "HBO",
  "Hiru",
  "Derana",
  "Sirasa",
  "ITN",
  "Swarnavahini",
  "Rupavahini",
];

const [news, sports, kids, doc, lk] = await Promise.all([
  fetchM3u("https://iptv-org.github.io/iptv/categories/news.m3u"),
  fetchM3u("https://iptv-org.github.io/iptv/categories/sports.m3u"),
  fetchM3u("https://iptv-org.github.io/iptv/categories/kids.m3u"),
  fetchM3u("https://iptv-org.github.io/iptv/categories/documentary.m3u"),
  fetchM3u("https://iptv-org.github.io/iptv/countries/lk.m3u"),
]);

const all = [
  ...parseM3u(news),
  ...parseM3u(sports),
  ...parseM3u(kids),
  ...parseM3u(doc),
  ...parseM3u(lk),
].filter(isDirect);

for (const term of searchTerms) {
  const matches = all.filter((x) => x.name?.toLowerCase().includes(term.toLowerCase()));
  if (matches.length) {
    console.log(`\n=== ${term} (${matches.length}) ===`);
    for (const m of matches.slice(0, 5)) {
      console.log(`  ${m.name}`);
      console.log(`    ${m.url}`);
      if (m.logo) console.log(`    logo: ${m.logo}`);
    }
  }
}
