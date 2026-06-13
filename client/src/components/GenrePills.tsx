import Link from "next/link";
import type { Genre } from "@/lib/types";

interface GenrePillsProps {
  genres: Genre[];
  activeGenre?: string | null;
  basePath?: string;
}

export default function GenrePills({
  genres,
  activeGenre,
  basePath = "/browse",
}: GenrePillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={basePath}
        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
          !activeGenre
            ? "bg-amber-500 text-black"
            : "border border-white/10 text-zinc-400 hover:border-amber-500/40 hover:text-white"
        }`}
      >
        All
      </Link>
      {genres.map((genre) => {
        const isActive = activeGenre === genre;
        return (
          <Link
            key={genre}
            href={`${basePath}?genre=${encodeURIComponent(genre)}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-amber-500 text-black"
                : "border border-white/10 text-zinc-400 hover:border-amber-500/40 hover:text-white"
            }`}
          >
            {genre}
          </Link>
        );
      })}
    </div>
  );
}
