import Link from "next/link";
import GlowOrb from "@/components/3d/GlowOrb";

function HexLogoSmall() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8">
      <polygon
        points="24,2 43,12 43,36 24,46 5,36 5,12"
        fill="none"
        stroke="var(--gold-primary)"
        strokeWidth="1.2"
      />
      <circle cx="24" cy="24" r="2.5" fill="var(--gold-primary)" />
    </svg>
  );
}

const socialIcons = [
  { label: "Twitter", path: "M22 4s-.7 2.1-2 3.4c1.6 1.4 3.3 4.5 3.3 4.5s-1.4 1.4-2.5 2.1c-1.1.7-2.5 1.4-2.5 1.4s1.4 2.8 2.8 4.2c1.4 1.4 3.5 2.1 3.5 2.1s-2.1 2.8-5.6 4.2c-3.5 1.4-7 1.4-7 1.4" },
  { label: "Instagram", path: "M12 2h8a10 10 0 0110 10v8a10 10 0 01-10 10h-8a10 10 0 01-10-10v-8A10 10 0 0112 2z" },
  { label: "YouTube", path: "M10 8l12 6-12 6V8z" },
];

export default function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-[var(--bg-void)]">
      <div className="animate-shimmer h-px w-full" />
      <GlowOrb color="rgba(201,168,76,0.12)" size={400} x="10%" y="30%" blur={100} opacity={0.4} />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <HexLogoSmall />
              <p className="font-cinzel text-lg tracking-[0.15em] text-[var(--gold-primary)]">
                E·SHOWN
              </p>
            </div>
            <p className="font-cormorant mt-4 max-w-sm text-base italic leading-relaxed text-[var(--text-secondary)]">
              Your premium destination for discovering cinematic masterpieces. Stream stories
              that move, thrill, and inspire.
            </p>
            <div className="mt-6 flex gap-3">
              {socialIcons.map((icon) => (
                <button
                  key={icon.label}
                  type="button"
                  aria-label={icon.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-mid)] text-[var(--text-secondary)] transition duration-200 hover:border-[var(--gold-primary)] hover:bg-[var(--gold-primary)] hover:text-black"
                >
                  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-4 w-4">
                    <path d={icon.path} />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-cinzel text-xs uppercase tracking-[0.2em] text-[var(--gold-primary)]">
              Explore
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
              {[
                { href: "/", label: "Home" },
                { href: "/browse", label: "Browse Library" },
                { href: "/search", label: "Search Movies" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition duration-200 hover:text-[var(--gold-primary)]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-cinzel text-xs uppercase tracking-[0.2em] text-[var(--gold-primary)]">
              Genres
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {["Sci-Fi", "Drama", "Action", "Horror", "Comedy"].map((genre) => (
                <li key={genre}>
                  <Link
                    href={`/browse?genre=${encodeURIComponent(genre)}`}
                    className="inline-block border border-[var(--border-mid)] px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)] transition duration-200 hover:border-[var(--border-hot)] hover:text-[var(--gold-primary)]"
                  >
                    {genre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[var(--border-subtle)] pt-8 sm:flex-row">
          <p className="text-xs text-[var(--text-dim)]">
            © {new Date().getFullYear()} E-Shown Movie Max. Built for cinema lovers.
          </p>
          <p className="text-xs text-[var(--text-dim)]">Poster images courtesy of TMDB</p>
        </div>
      </div>
    </footer>
  );
}
