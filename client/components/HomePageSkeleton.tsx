export default function HomePageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[min(72vh,640px)] bg-[var(--bg-secondary)]" />
      <div className="section-base space-y-4 px-4 py-12 sm:px-6">
        <div className="skeleton h-6 w-40 rounded" />
        <div className="skeleton h-10 w-72 max-w-full rounded" />
        <div className="mt-6 flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-56 w-36 shrink-0 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
