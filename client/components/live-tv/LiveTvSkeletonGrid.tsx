export function LiveTvSkeletonPlayer() {
  return (
    <div className="overflow-hidden rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.08]">
      <div className="skeleton aspect-video w-full bg-[#111]" />
      <div className="space-y-3 bg-gradient-to-r from-[#111] to-[#0d0d0d] p-5">
        <div className="skeleton h-5 w-40 rounded bg-white/10" />
        <div className="skeleton h-3 w-24 rounded bg-white/5" />
      </div>
    </div>
  );
}

export default function LiveTvSkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)]"
        >
          <div className="skeleton aspect-[16/9] w-full" />
          <div className="space-y-2 p-3">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
