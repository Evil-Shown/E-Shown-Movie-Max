const url = process.argv[2] ?? "https://jmp2.uk/plu-5d767ae7b456c8cf265ce922.m3u8";
const t = await (await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })).text();
console.log("URL:", url);
console.log("lines:", t.split("\n").length);
for (const line of t.split("\n").slice(0, 30)) {
  console.log(line.slice(0, 140));
}
const uris = [...t.matchAll(/URI="([^"]+)"/gi)].map((m) => m[1]);
console.log("\nURIs in tags:", uris.length);
uris.slice(0, 6).forEach((u) => console.log(" ", u.slice(0, 100)));
