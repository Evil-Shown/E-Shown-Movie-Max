/**
 * Cache Pre-Warming Script
 *
 * Hits the BFF endpoints for popular content to keep the Redis cache warm.
 * Run this every 2 hours via cron or Vercel Cron.
 *
 * Usage:
 *   node scripts/warm-cache.mjs
 *   or set up Vercel Cron: GET /api/cron/warm-cache
 *
 * The script is idempotent — running it multiple times is safe.
 */

const API_BASE = process.env.API_BASE_URL || "http://localhost:5000";

// Top 20 most popular TMDB movie IDs (Inception, Interstellar, The Dark Knight, etc.)
const POPULAR_MOVIE_IDS = [
  "27205",  // Inception
  "157336", // Interstellar
  "155",    // The Dark Knight
  "693134", // Dune: Part Two
  "872585", // Oppenheimer
  "496243", // Parasite
  "569094", // Spider-Man: Across the Spider-Verse
  "603",    // The Matrix
  "313369", // La La Land
  "419430", // Get Out
  "76341",  // Mad Max: Fury Road
  "545611", // Everything Everywhere All at Once
  "278",    // The Shawshank Redemption
  "335984", // Blade Runner 2049
  "244786", // Whiplash
  "120467", // The Grand Budapest Hotel
  "493922", // Hereditary
  "329865", // Arrival
  "475557", // Joker
  "76600",  // Avatar: The Way of Water
];

// Browse pages to pre-warm
const BROWSE_PAGES = [
  { genre: "", sort: "popular", page: "1" },
  { genre: "", sort: "top_rated", page: "1" },
  { genre: "Action", sort: "popular", page: "1" },
  { genre: "Drama", sort: "popular", page: "1" },
  { genre: "Sci-Fi", sort: "popular", page: "1" },
  { genre: "Horror", sort: "popular", page: "1" },
];

async function warmUrl(path, label) {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    const status = res.status;
    const cache = res.headers.get("x-cache") ?? "unknown";
    console.log(`  [${status}] [${cache}] ${label}`);
    return status === 200;
  } catch (err) {
    console.error(`  [ERR] ${label}: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log(`\n🔥 Cache Pre-Warming — ${new Date().toISOString()}`);
  console.log(`   API Base: ${API_BASE}\n`);

  let success = 0;
  let failed = 0;

  // 1. Warm home page
  console.log("📄 Home Page:");
  (await warmUrl("/api/v1/home-page", "home-page")) ? success++ : failed++;

  // 2. Warm popular movie pages (sequential to avoid overwhelming the server)
  console.log("\n🎬 Popular Movie Pages:");
  for (const id of POPULAR_MOVIE_IDS) {
    (await warmUrl(`/api/v1/movie-page/${id}`, `movie-page/${id}`)) ? success++ : failed++;
    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 200));
  }

  // 3. Warm browse pages
  console.log("\n📚 Browse Pages:");
  for (const { genre, sort, page } of BROWSE_PAGES) {
    const params = new URLSearchParams();
    if (genre) params.set("genre", genre);
    params.set("sort", sort);
    params.set("page", page);
    (await warmUrl(`/api/v1/browse-page?${params.toString()}`, `browse-page ${genre || "all"}/${sort}`)) ? success++ : failed++;
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\n✅ Done: ${success} warmed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
