const https = require("https");

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

function fetchDDGToken(query) {
  return new Promise((resolve) => {
    https.get(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&t=h_&iar=images&iax=images&ia=images`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        const match = data.match(/vqd=([^&'"]+)/);
        resolve(match ? match[1] : null);
      });
    }).on("error", () => resolve(null));
  });
}

function fetchDDGImages(query, vqd) {
  return new Promise((resolve) => {
    https.get(`https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&vqd=${vqd}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.results && json.results.length > 0) {
            resolve(json.results[0].image);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on("error", () => resolve(null));
  });
}

async function main() {
  const results = {};
  for (const [id, query] of Object.entries(channels)) {
    const vqd = await fetchDDGToken(query);
    if (vqd) {
      const imgUrl = await fetchDDGImages(query, vqd);
      if (imgUrl) {
        // Use the duckduckgo proxy
        results[id] = `https://external-content.duckduckgo.com/iu/?u=${encodeURIComponent(imgUrl)}`;
      }
    }
  }
  console.log("FINAL_URLS_JSON=");
  console.log(JSON.stringify(results, null, 2));
}

main();
