import HomeHero from "@/app/HomeHero";
import HomeMoreRows from "@/app/HomeMoreRows";
import HomePageSkeleton from "@/components/HomePageSkeleton";
import { Suspense } from "react";

export const revalidate = 3600;

function HomeRowsSkeleton() {
  return (
    <div className="animate-pulse space-y-12 px-4 py-12">
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
  return (
    <>
      <Suspense fallback={<HomePageSkeleton />}>
        <HomeHero />
      </Suspense>
      <Suspense fallback={<HomeRowsSkeleton />}>
        <HomeMoreRows />
      </Suspense>
    </>
  );
}
