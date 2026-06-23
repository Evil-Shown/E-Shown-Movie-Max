const fs = require("fs");
const https = require("https");
const path = require("path");

const channels = {
  "shakthi-tv": "Shakthi TV",
  "vasantham-tv": "Vasantham TV",
  "charana-tv": "Charana TV",
  "art-tv": "ART Television (Sri Lanka)",
  "rangiri-tv": "Rangiri Sri Lanka",
  "haritha-tv": "Haritha TV",
  "tv-didula": "TV Didula",
  "damsathara-tv": "Damsathara",
  "verbum-tv": "Verbum TV",
  "star-tamil-tv": "Star Tamil TV",
  "baby-tv": "BabyTV"
};

async function fetchWikiImage(query) {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(query)}`;
    https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pageId !== "-1" && pages[pageId].original) {
            resolve(pages[pageId].original.source);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function downloadImage(url, dest) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else if (res.statusCode === 301 || res.statusCode === 302) {
        downloadImage(res.headers.location, dest).then(resolve);
      } else {
        resolve(false);
      }
    }).on('error', () => resolve(false));
  });
}

async function main() {
  const outDir = path.join(__dirname, "public", "channels", "logos");
  
  for (const [id, query] of Object.entries(channels)) {
    console.log(`Fetching ${id}...`);
    const imgUrl = await fetchWikiImage(query);
    if (imgUrl) {
      console.log(`Found: ${imgUrl}`);
      await downloadImage(imgUrl, path.join(outDir, `${id}.png`));
    } else {
      console.log(`Not found on Wiki for ${id}`);
    }
  }
}

main();
