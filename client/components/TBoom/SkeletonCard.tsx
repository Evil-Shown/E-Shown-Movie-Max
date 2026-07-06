export default function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
      <div className="flex gap-4">
        <div className="h-[110px] w-[80px] shrink-0 rounded-lg bg-[var(--bg-main)]" />
        <div className="flex-1">
          <div className="h-5 w-3/4 rounded bg-[var(--bg-main)]" />
          <div className="mt-3 h-4 w-1/2 rounded bg-[var(--bg-main)]" />
          <div className="mt-4 h-3 w-full rounded bg-[var(--bg-main)]" />
          <div className="mt-3 h-8 w-48 rounded-full bg-[var(--bg-main)]" />
        </div>
      </div>
    </div>
  );
}
