export default function LiveTvSkeletonGrid({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
        >
          <div className="mb-3 flex items-start justify-between">
            <div className="skeleton h-14 w-14 rounded-xl" />
            <div className="skeleton h-5 w-12 rounded-full" />
          </div>
          <div className="skeleton h-5 w-3/4 rounded" />
          <div className="skeleton mt-2 h-3 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}

export function LiveTvSkeletonPlayer() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
      <div className="skeleton aspect-video w-full" />
      <div className="space-y-3 p-6">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-8 w-2/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
      </div>
    </div>
  );
}
