export default function TmdbSetupBanner() {
  return (
    <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
      <p className="font-semibold">Add a TMDB API key to unlock the full movie library</p>
      <p className="mt-1 text-amber-900/90">
        Right now you only see a small curated list. Get a free key at{" "}
        <a
          href="https://www.themoviedb.org/settings/api"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline"
        >
          themoviedb.org
        </a>
        , add <code className="rounded bg-amber-100 px-1">TMDB_API_KEY</code> to{" "}
        <code className="rounded bg-amber-100 px-1">.env.local</code>, then restart{" "}
        <code className="rounded bg-amber-100 px-1">npm run dev</code>.
      </p>
    </div>
  );
}
