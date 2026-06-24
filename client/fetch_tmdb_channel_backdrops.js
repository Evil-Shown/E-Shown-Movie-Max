/**
 * fetch_tmdb_channel_backdrops.js  (v2 — fixed auth + error reporting)
 *
 * Supports BOTH TMDb API key types:
 *   • v3 key  (32-char hex)  → sent as ?api_key=KEY
 *   • v4 token (long JWT)    → sent as Authorization: Bearer TOKEN
 *
 * Usage:
 *   node fetch_tmdb_channel_backdrops.js YOUR_TMDB_API_KEY
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

// ── CONFIG ────────────────────────────────────────────────────────────────────
const RAW_KEY = process.argv[2];
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w780";
const OUT_FILE = path.join(__dirname, "public", "channels", "tmdb-backdrops.json");

if (!RAW_KEY) {
  console.error("❌  Pass your TMDb API key as first argument:");
  console.error("    node fetch_tmdb_channel_backdrops.js <API_KEY>");
  process.exit(1);
}

// Auto-detect key type: v3 keys are 32-char hex; v4 tokens are long JWTs
const IS_V4 = RAW_KEY.length > 50;
console.log(`🔑  Detected key type: ${IS_V4 ? "v4 Bearer token" : "v3 api_key"}\n`);

// ── CHANNEL → TMDB SEARCH QUERY MAP ──────────────────────────────────────────
// IMPORTANT: TMDb is a title database — only real movie/show names work.
// Descriptive phrases return nothing. Each entry maps to a thematically
// relevant title that is guaranteed to be indexed on TMDb.
const CHANNEL_QUERIES = {
  // Local (Sri Lanka) — not on TMDb; use popular South Asian films with great backdrops
  "hiru-tv":           "Sacred Games",           // Netflix India thriller
  "tv-derana":         "Delhi Crime",            // Indian crime drama
  "sirasa-tv":         "Mirzapur",               // Indian action drama
  "swarnavahini":      "Baahubali The Beginning",// South Indian epic
  "itn":               "Dangal",                 // Indian sports drama
  "rupavahini":        "Lagaan",                 // Indian period cricket drama
  "channel-eye":       "The Lunchbox",           // Indian drama
  "shakthi-tv":        "Kabali",                 // Tamil action film
  "vasantham-tv":      "2.0",                    // Tamil sci-fi film
  "supreme-tv":        "Enthiran",               // Tamil robot film
  "ada-derana-24":     "The Newsroom",           // Aaron Sorkin news drama

  // Sports — sports movies/docs indexed on TMDb
  "espn":              "SportsCenter",
  "espn2":             "Monday Night Football",
  "espnu":             "College GameDay",
  "sky-sports":        "The Damned United",      // Football film
  "star-sports":       "Lagaan",                 // Cricket epic
  "sony-sports":       "M.S. Dhoni The Untold Story", // Cricket biopic
  "eurosport":         "Rush",                   // F1 racing film
  "bein-sports":       "Champions League football",
  "fox-sports":        "Any Given Sunday",       // American football film
  "red-bull-tv":       "Rush",                   // F1 racing film
  "motogp":            "Faster",                 // MotoGP documentary film
  "wwe":               "Fighting with My Family", // WWE biopic
  "espn-deportes":     "FIFA World Cup football",

  // Entertainment
  "hbo":               "Game of Thrones",
  "axn":               "Breaking Bad",
  "warner-tv":         "The Dark Knight",
  "mtv":               "Bohemian Rhapsody",      // Music biopic
  "comedy-central":    "South Park",
  "pluto-tv-comedy":   "The Office",             // Classic sitcom
  "pluto-tv-movies":   "Casablanca",             // Classic Hollywood
  "filmrise":          "Sunset Boulevard",       // Classic film noir
  "stingray-classica": "Whiplash",               // Music drama

  // News — journalism films & shows with great backdrops
  "cnn":               "The Newsroom",
  "cnn-international": "The Interpreter",        // UN thriller
  "bbc-world-news":    "Sherlock",               // BBC drama
  "al-jazeera":        "Zero Dark Thirty",       // Journalism thriller
  "france-24":         "Amelie",                 // French cinema
  "france-24-arabic":  "Cairo Station",          // Arabic classic cinema
  "dw":                "Das Boot",               // German film
  "dw-deutsch":        "Run Lola Run",           // German film
  "euronews":          "The Crown",              // European political drama
  "sky-news":          "The Crown",              // British series
  "fox-news":          "Bombshell",              // Fox News film
  "bloomberg":         "The Big Short",          // Wall Street finance film
  "cgtn":              "The Great Wall",         // China blockbuster
  "cgtn-documentary":  "Crouching Tiger Hidden Dragon", // Chinese epic
  "nhk-world":         "Lost in Translation",   // Tokyo film
  "rt-news":           "The Americans",          // Cold War Russia drama
  "wion":              "Delhi Crime",
  "abc-news":          "ABC World News Tonight",
  "cbs-news":          "The Good Wife",          // CBS flagship drama
  "nbc-news":          "NBC Nightly News",

  // Documentary — real documentary titles on TMDb
  "discovery-channel": "Planet Earth",           // BBC/Discovery nature doc
  "national-geographic":"Free Solo",             // NatGeo Oscar documentary
  "animal-planet":     "Blackfish",              // Animal welfare documentary
  "history-channel":   "Gladiator",             // Roman historical epic
  "nasa-tv":           "The Martian",            // NASA space film
  "nasa-tv-media":     "Interstellar",           // Space epic
  "smithsonian":       "Top Gun",               // Aviation action
  "love-nature":       "Blue Planet II",         // Ocean documentary
  "outdoor-channel":   "Into the Wild",          // Wilderness adventure

  // Kids — animated shows/films on TMDb
  "cartoon-network":   "Teen Titans Go",         // Cartoon Network show
  "nickelodeon":       "SpongeBob SquarePants",
  "disney-channel":    "The Lion King",
  "boomerang":         "Tom and Jerry",
  "pbs-kids":          "Sesame Street",
  "duck-tv":           "DuckTales",              // Animated Disney series
  "baby-tv":           "Peppa Pig",              // Toddler animated show
};


// ── HTTP HELPER ───────────────────────────────────────────────────────────────
function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      // Handle redirects
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        return httpsGet(res.headers.location, headers).then(resolve).catch(reject);
      }
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: null });
        }
      });
    }).on("error", reject);
  });
}

// ── TMDB REQUEST ──────────────────────────────────────────────────────────────
function buildUrl(endpoint, extraParams = "") {
  if (IS_V4) {
    return `https://api.themoviedb.org/3${endpoint}${extraParams}`;
  }
  // v3: append api_key
  const sep = endpoint.includes("?") ? "&" : "?";
  return `https://api.themoviedb.org/3${endpoint}${sep}api_key=${RAW_KEY}${extraParams}`;
}

function buildHeaders() {
  if (IS_V4) {
    return {
      Authorization: `Bearer ${RAW_KEY}`,
      Accept: "application/json",
    };
  }
  return { Accept: "application/json" };
}

async function tmdbGet(endpoint, extraParams = "") {
  const url = buildUrl(endpoint, extraParams);
  const { status, body } = await httpsGet(url, buildHeaders());

  if (status !== 200 || !body) {
    throw new Error(`TMDb HTTP ${status}: ${JSON.stringify(body)}`);
  }
  // TMDb sometimes returns 200 with success:false
  if (body.success === false) {
    throw new Error(`TMDb error ${body.status_code}: ${body.status_message}`);
  }
  return body;
}

// ── AUTH TEST ─────────────────────────────────────────────────────────────────
async function testAuth() {
  try {
    const res = await tmdbGet("/configuration");
    console.log("✅  TMDb auth OK — image base URL:", res.images?.secure_base_url);
    return true;
  } catch (err) {
    console.error("❌  TMDb auth FAILED:", err.message);
    console.error("    Check your API key at https://www.themoviedb.org/settings/api");
    return false;
  }
}

// ── FIND BACKDROP ─────────────────────────────────────────────────────────────
async function findBackdrop(channelId, query) {
  // Strategy 1: search TV shows
  try {
    const tvRes = await tmdbGet(
      `/search/tv`,
      `&query=${encodeURIComponent(query)}&page=1&include_adult=false`
    );
    const tvHits = (tvRes.results || []).filter(
      (r) => r.backdrop_path || r.poster_path
    );
    if (tvHits.length > 0) {
      return `${TMDB_IMAGE_BASE}${tvHits[0].backdrop_path || tvHits[0].poster_path}`;
    }
  } catch (e) {
    // fall through
  }

  // Strategy 2: search movies
  try {
    const movieRes = await tmdbGet(
      `/search/movie`,
      `&query=${encodeURIComponent(query)}&page=1&include_adult=false`
    );
    const movieHits = (movieRes.results || []).filter(
      (r) => r.backdrop_path || r.poster_path
    );
    if (movieHits.length > 0) {
      return `${TMDB_IMAGE_BASE}${movieHits[0].backdrop_path || movieHits[0].poster_path}`;
    }
  } catch (e) {
    // fall through
  }

  // Strategy 3: multi search
  try {
    const multi = await tmdbGet(
      `/search/multi`,
      `&query=${encodeURIComponent(query)}&page=1&include_adult=false`
    );
    const hits = (multi.results || []).filter(
      (r) =>
        (r.media_type === "tv" || r.media_type === "movie") &&
        (r.backdrop_path || r.poster_path)
    );
    if (hits.length > 0) {
      return `${TMDB_IMAGE_BASE}${hits[0].backdrop_path || hits[0].poster_path}`;
    }
  } catch (e) {
    // fall through
  }

  return null;
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🎬  TMDb Channel Backdrop Fetcher v2");
  console.log("======================================\n");

  // Test auth first
  const authOk = await testAuth();
  if (!authOk) {
    process.exit(1);
  }
  console.log();

  // Ensure output dir
  const outDir = path.dirname(OUT_FILE);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Load existing (incremental)
  let results = {};
  if (fs.existsSync(OUT_FILE)) {
    try {
      results = JSON.parse(fs.readFileSync(OUT_FILE, "utf-8"));
      console.log(`📂  Loaded ${Object.keys(results).length} existing entries.\n`);
    } catch {
      results = {};
    }
  }

  const entries = Object.entries(CHANNEL_QUERIES);
  let found = 0, skipped = 0, failed = 0;

  for (const [channelId, query] of entries) {
    if (results[channelId]) {
      console.log(`⏭  ${channelId} — cached`);
      skipped++;
      continue;
    }

    process.stdout.write(`🔍  ${channelId} → "${query}" … `);

    try {
      const url = await findBackdrop(channelId, query);
      if (url) {
        results[channelId] = url;
        const shortUrl = url.replace(TMDB_IMAGE_BASE, "[tmdb]");
        console.log(`✅  ${shortUrl}`);
        found++;
      } else {
        console.log("❌  no results");
        failed++;
      }
    } catch (err) {
      console.log(`💥  ${err.message}`);
      failed++;
    }

    // Save after every channel so partial results are preserved
    fs.writeFileSync(OUT_FILE, JSON.stringify(results, null, 2));

    // Rate limit: TMDb free tier = 40 req / 10 sec, we do 3 req per channel
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log("\n========================================");
  console.log(`✅  Found:   ${found}`);
  console.log(`⏭  Skipped: ${skipped}`);
  console.log(`❌  Failed:  ${failed}`);
  console.log(`\n📄  Saved → ${OUT_FILE}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
