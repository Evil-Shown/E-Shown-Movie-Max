const https = require('https');

async function searchWikiTitles(query) {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json`;
    https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.query.search.length > 0) {
            resolve(json.query.search[0].title);
          } else {
            resolve(null);
          }
        } catch (e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

async function fetchWikiImage(title) {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(title)}`;
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
        } catch (e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

const channels = [
  "Shakthi TV",
  "Vasantham TV",
  "Charana TV",
  "ART Television Sri Lanka",
  "Rangiri Sri Lanka",
  "Haritha TV",
  "TV Didula",
  "Verbum TV",
  "Star Tamil TV",
  "BabyTV"
];

async function main() {
  const urls = {};
  for (const q of channels) {
    const title = await searchWikiTitles(q);
    if (title) {
      const img = await fetchWikiImage(title);
      if (img) {
        urls[q] = img;
      }
    }
  }
  console.log(JSON.stringify(urls, null, 2));
}

main();
