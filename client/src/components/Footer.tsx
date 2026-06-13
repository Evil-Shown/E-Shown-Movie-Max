import Link from "next/link";
import FooterDivider from "@/components/FooterDivider";
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

export default function Footer() {
  return (
    <>
      <FooterDivider />
      <footer className="relative mt-auto overflow-hidden bg-[var(--bg-void)]">
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
                Your premium destination for discovering cinematic masterpieces.
              </p>
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
                      className="inline-block border-l-2 border-[var(--gold-primary)] pl-2 pr-3 py-1 text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)] transition duration-200 hover:bg-[rgba(201,168,76,0.08)] hover:text-[var(--gold-primary)]"
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
    </>
  );
}
