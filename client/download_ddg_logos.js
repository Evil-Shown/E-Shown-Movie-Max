const fs = require("fs");
const https = require("https");
const path = require("path");

const channels = {
  "shakthi-tv": "Shakthi TV logo",
  "vasantham-tv": "Vasantham TV logo",
  "charana-tv": "Charana TV logo",
  "art-tv": "ART Television Sri Lanka logo",
  "rangiri-tv": "Rangiri TV Sri Lanka logo",
  "haritha-tv": "Haritha TV logo",
  "tv-didula": "TV Didula logo",
  "damsathara-tv": "Damsathara TV logo",
  "verbum-tv": "Verbum TV logo",
  "star-tamil-tv": "Star Tamil TV logo",
  "baby-tv": "BabyTV logo"
};

function searchDDG(query) {
  return new Promise((resolve) => {
    // We use DuckDuckGo Lite to get images easily without JS
    const url = `https://lite.duckduckgo.com/lite/`;
    const postData = `q=${encodeURIComponent(query + " filetype:png")}`;
    
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length,
        'User-Agent': 'Mozilla/5.0'
      }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        // Find URLs ending in .png
        const match = data.match(/href="([^"]+\.png)"/i);
        if (match) {
           return resolve(match[1]);
        }
        
        // Alternatively, look for image tags
        const imgMatch = data.match(/src="([^"]+\.png)"/i);
        if (imgMatch) {
            return resolve(imgMatch[1].startsWith("//") ? "https:" + imgMatch[1] : imgMatch[1]);
        }
        
        resolve(null);
      });
    });
    
    req.on('error', () => resolve(null));
    req.write(postData);
    req.end();
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve) => {
    if (url.startsWith("//")) url = "https:" + url;
    
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve(true);
        });
      } else if (res.statusCode === 301 || res.statusCode === 302) {
        downloadImage(res.headers.location, dest).then(resolve);
      } else {
        resolve(false);
      }
    }).on("error", () => resolve(false));
  });
}

async function main() {
  const outDir = path.join(__dirname, "public", "channels", "logos");
  
  for (const [id, query] of Object.entries(channels)) {
    console.log(`\nSearching for ${id} ("${query}")...`);
    let imgUrl = await searchDDG(query);
    if (!imgUrl) {
      imgUrl = await searchDDG(query.replace(" logo", " tv logo png"));
    }
    
    if (imgUrl) {
      console.log(`Found image URL: ${imgUrl}`);
      const success = await downloadImage(imgUrl, path.join(outDir, `${id}.png`));
      if (success) {
        console.log(`Successfully downloaded ${id}.png`);
      } else {
        console.log(`Failed to download ${id}.png`);
      }
    } else {
      console.log(`No image found for ${id}`);
    }
  }
}

main();
