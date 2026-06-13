"use client";

import { backdropUrl, movies } from "@/lib/movies";
import Link from "next/link";

export default function CtaBanner() {
  const interstellar = movies.find((m) => m.id === "interstellar") ?? movies[0];
  const avgRating = (movies.reduce((s, m) => s + m.rating, 0) / movies.length).toFixed(1);

  return (
    <section className="relative border-y border-[rgba(201,168,76,0.1)] py-[100px]">
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm"
        style={{ backgroundImage: `url(${backdropUrl(interstellar.backdropPath)})` }}
      />
      <div className="absolute inset-0 bg-[rgba(2,2,10,0.88)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(201,168,76,0.06)_0%,transparent_400px),radial-gradient(circle_at_80%_50%,rgba(26,143,255,0.04)_0%,transparent_300px)]" />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <span className="absolute left-8 top-1/2 hidden h-20 w-px -translate-y-1/2 bg-[var(--border-mid)] lg:block" />
        <span className="absolute right-8 top-1/2 hidden h-20 w-px -translate-y-1/2 bg-[var(--border-mid)] lg:block" />

        <p className="font-cinzel text-[10px] uppercase tracking-[0.5em] text-[var(--gold-primary)]">
          Unlimited Cinema
        </p>
        <h2 className="font-cinzel mt-6 text-4xl text-[var(--text-primary)] sm:text-5xl">
          Every Story.
          <span className="mt-2 block indent-8">Every World.</span>
        </h2>
        <p className="font-cormorant mt-6 text-[1.2rem] italic text-[var(--text-secondary)]">
          From blockbusters to hidden gems — curated for the discerning viewer.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-0">
          {[
            { num: `${movies.length}+`, label: "Curated Films" },
            { num: "12", label: "Genres" },
            { num: avgRating, label: "Avg Rating" },
          ].map((stat, i) => (
            <div key={stat.label} className="flex items-center">
              {i > 0 && <span className="mx-6 hidden h-8 w-px bg-[var(--border-mid)] sm:block" />}
              <div className="px-4 text-center sm:px-6">
                <p className="font-cinzel text-2xl text-[var(--gold-primary)]">{stat.num}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[var(--text-dim)]">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/browse"
          className="font-cinzel mt-10 bg-[var(--gold-primary)] px-12 py-4 text-sm font-bold uppercase tracking-[0.2em] text-black transition hover:bg-[var(--gold-bright)]"
        >
          Explore the Library
        </Link>
      </div>
    </section>
  );
}
