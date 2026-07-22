import type { CatalogStats } from "@/lib/movie-service";

function formatFilmCount(count: number): string {
  if (count >= 1_000_000) {
    const millions = count / 1_000_000;
    return `${millions >= 10 ? Math.round(millions) : millions.toFixed(1).replace(/\.0$/, "")}M+`;
  }
  if (count >= 10_000) return `${Math.round(count / 1000)}K+`;
  if (count >= 100) return `${Math.floor(count / 100) * 100}+`;
  return `${count}+`;
}

interface CtaBannerProps {
  stats: CatalogStats;
}

export default function CtaBanner({ stats }: CtaBannerProps) {
  const items = [
    { value: formatFilmCount(stats.filmCount), label: "Films" },
    { value: String(stats.genreCount), label: "Genres" },
    { value: stats.avgRating.toFixed(1), label: "Avg Rating" },
  ];

  return (
    <section className="relative overflow-hidden bg-[var(--bg-dark)] py-9 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 sm:opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 20% 0%, rgba(230,81,0,0.22), transparent 55%), radial-gradient(ellipse 50% 60% at 90% 100%, rgba(255,184,122,0.12), transparent 50%)",
        }}
      />
      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6">
        <p className="mb-5 text-center text-[9px] font-semibold uppercase tracking-[0.22em] text-[rgba(247,244,239,0.45)] sm:mb-8 sm:text-[10px]">
          The Catalog
        </p>
        <div className="grid grid-cols-3 gap-2 text-center sm:gap-0">
          {items.map((stat, index) => (
            <div
              key={stat.label}
              className={`px-2 sm:px-6 ${index > 0 ? "border-l border-[rgba(247,244,239,0.14)]" : ""}`}
            >
              <p className="font-[var(--font-playfair)] text-[1.75rem] font-bold leading-none text-[var(--accent-warm)] sm:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[rgba(247,244,239,0.55)] sm:mt-3 sm:text-[11px] sm:tracking-[0.12em]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
