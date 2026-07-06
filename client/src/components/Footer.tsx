import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-[#030305]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-display text-xl font-semibold text-white">E-Shown Movie Max</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-500">
              Your premium destination for discovering cinematic masterpieces. Stream stories
              that move, thrill, and inspire.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">
              Explore
            </p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/" className="transition hover:text-amber-400">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/browse" className="transition hover:text-amber-400">
                  Browse Library
                </Link>
              </li>
              <li>
                <Link href="/search" className="transition hover:text-amber-400">
                  Search Movies
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">
              Genres
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {["Sci-Fi", "Drama", "Action", "Horror", "Comedy"].map((genre) => (
                <li key={genre}>
                  <Link
                    href={`/browse?genre=${encodeURIComponent(genre)}`}
                    className="inline-block rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400 transition hover:border-amber-500/40 hover:text-amber-400"
                  >
                    {genre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} E-Shown Movie Max. Built for cinema lovers.
          </p>
          <p className="text-xs text-zinc-700">Poster images courtesy of TMDB</p>
        </div>
      </div>
    </footer>
  );
}
