import Link from "next/link";
import FooterDivider from "@/components/FooterDivider";

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
      <footer className="surface-texture relative mt-auto overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 45% at 20% 0%, rgba(212,168,67,0.06), transparent 60%), linear-gradient(to bottom, var(--bg-base), var(--bg-footer))",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 border-l-[3px] border-l-[rgba(212,168,67,0.34)] bg-[rgba(32,38,54,0.36)] p-6">
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

            <div className="rounded-2xl border border-white/10 bg-[rgba(32,38,54,0.24)] p-6">
              <p
                className="font-cinzel text-[0.65rem] uppercase tracking-[0.25em]"
                style={{ color: "rgba(212, 168, 67, 0.7)" }}
              >
                Explore
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
                {[
                  { href: "/", label: "Home" },
                  { href: "/browse", label: "Browse Library" },
                  { href: "/search", label: "Search Movies" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} data-cursor="link" className="footer-link transition duration-200 hover:text-[var(--gold-primary)]">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[rgba(32,38,54,0.24)] p-6">
              <p
                className="font-cinzel text-[0.65rem] uppercase tracking-[0.25em]"
                style={{ color: "rgba(212, 168, 67, 0.7)" }}
              >
                Genres
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {["Sci-Fi", "Drama", "Action", "Horror", "Comedy"].map((genre) => (
                  <li key={genre}>
                    <Link
                      href={`/browse?genre=${encodeURIComponent(genre)}`}
                      data-cursor="link"
                      className="footer-link inline-block border-l-2 border-[var(--gold-primary)] pl-2 pr-3 py-1 text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)] transition duration-200 hover:bg-[rgba(212,168,67,0.08)] hover:text-[var(--gold-primary)]"
                    >
                      {genre}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[var(--divider)] pt-8 sm:flex-row">
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
