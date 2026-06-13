import type { Movie } from "@/lib/types";
import { posterUrl } from "@/lib/movies";
import Image from "next/image";
import Link from "next/link";

interface MovieCardProps {
  movie: Movie;
  priority?: boolean;
}

export default function MovieCard({ movie, priority = false }: MovieCardProps) {
  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group movie-card relative block shrink-0 snap-start"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/10 transition duration-300 group-hover:ring-amber-500/50 group-hover:shadow-2xl group-hover:shadow-amber-500/10">
        <Image
          src={posterUrl(movie.posterPath, "w342")}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 200px"
          priority={priority}
          className="object-cover transition duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="line-clamp-2 font-medium leading-snug text-white">{movie.title}</p>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-zinc-300">
            <span className="flex items-center gap-1 text-amber-400">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {movie.rating.toFixed(1)}
            </span>
            <span className="text-zinc-500">·</span>
            <span>{movie.year}</span>
          </div>
        </div>
        <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-amber-400">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
