const fs = require('fs');
const https = require('https');
const path = require('path');

const channels = {
  "shakthi-tv": "Shakthi TV logo",
  "vasantham-tv": "Vasantham TV logo",
  "charana-tv": "Charana TV logo",
  "art-tv": "ART Television Sri Lanka logo",
  "rangiri-tv": "Rangiri Sri Lanka logo",
  "haritha-tv": "Haritha TV logo",
  "tv-didula": "TV Didula logo",
  "damsathara-tv": "Damsathara TV logo",
  "verbum-tv": "Verbum TV logo",
  "star-tamil-tv": "Star Tamil TV logo",
  "baby-tv": "BabyTV logo png"
};

function fetchVQD(query) {
  return new Promise((resolve) => {
    https.get(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, {
      headers: { "User-Agent": "Mozilla/5.0" }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        // vqd regex for duckduckgo 2024
        const match = data.match(/vqd=["']([^"']+)["']/);
        resolve(match ? match[1] : null);
      });
    }).on("error", () => resolve(null));
  });
}

function fetchImages(query, vqd) {
  return new Promise((resolve) => {
    https.get(`https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&o=json&vqd=${vqd}`, {
      headers: { "User-Agent": "Mozilla/5.0" }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json.results && json.results.length > 0 ? json.results[0].image : null);
        } catch(e) { resolve(null); }
      });
    }).on("error", () => resolve(null));
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on("finish", () => { file.close(); resolve(true); });
      } else if ([301, 302, 307, 308].includes(res.statusCode)) {
        downloadImage(res.headers.location, dest).then(resolve);
      } else {
        resolve(false);
      }
    }).on("error", () => resolve(false));
  });
}

async function main() {
  const outDir = path.join(__dirname, "public", "channels", "logos");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const [id, query] of Object.entries(channels)) {
    console.log(`Searching ${id}...`);
    const vqd = await fetchVQD(query);
    if (!vqd) { console.log(`  Failed to get VQD for ${id}`); continue; }
    
    const imgUrl = await fetchImages(query, vqd);
    if (!imgUrl) { console.log(`  No images found for ${id}`); continue; }
    
    console.log(`  Found: ${imgUrl}`);
    const success = await downloadImage(imgUrl, path.join(outDir, `${id}.png`));
    console.log(success ? `  Saved ${id}.png` : `  Failed to download ${id}.png`);
  }
}

main();
