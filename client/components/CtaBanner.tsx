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
    <section className="bg-[var(--bg-dark)] py-16">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid gap-8 text-center sm:grid-cols-3 sm:gap-0">
          {items.map((stat, index) => (
            <div
              key={stat.label}
              className={`px-6 ${index > 0 ? "sm:border-l sm:border-[rgba(247,244,239,0.16)]" : ""}`}
            >
              <p className="font-[var(--font-playfair)] text-5xl font-bold text-[var(--accent-warm)]">
                {stat.value}
              </p>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(247,244,239,0.6)]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
