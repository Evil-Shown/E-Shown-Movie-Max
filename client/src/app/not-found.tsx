import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-display text-8xl font-bold text-amber-500/20">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold text-white">Page not found</h1>
      <p className="mt-2 max-w-md text-zinc-500">
        This scene got cut from the final edit. The page you&apos;re looking for doesn&apos;t
        exist.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-amber-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-amber-400"
      >
        Back to Home
      </Link>
    </div>
  );
}
