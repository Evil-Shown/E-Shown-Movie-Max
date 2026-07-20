import HomeHero from "@/app/HomeHero";
import HomeMoreRows from "@/app/HomeMoreRows";
import HomePageSkeleton from "@/components/HomePageSkeleton";
import { getHomeCatalogEssential, getHomeCatalogExtended } from "@/lib/movie-service";
import { Suspense } from "react";

export const revalidate = 3600;

function HomeRowsSkeleton() {
  return (
    <div className="animate-pulse space-y-12 px-4 py-12" aria-hidden>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="skeleton h-8 w-48 rounded" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((__, j) => (
              <div key={j} className="skeleton h-52 w-36 shrink-0 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  // Kick off both fetches immediately so extended rows stream in without waiting for hero.
  const essentialPromise = getHomeCatalogEssential();
  const extendedPromise = getHomeCatalogExtended();

  return (
    <>
      <Suspense fallback={<HomePageSkeleton />}>
        <HomeHero dataPromise={essentialPromise} />
      </Suspense>
      <Suspense fallback={<HomeRowsSkeleton />}>
        <HomeMoreRows dataPromise={extendedPromise} />
      </Suspense>
    </>
  );
}
