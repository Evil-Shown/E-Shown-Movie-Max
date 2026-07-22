interface LiveTvEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function LiveTvEmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: LiveTvEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-card)] py-16 text-center">
      <svg viewBox="0 0 80 80" fill="none" className="h-14 w-14 text-[var(--text-muted)]" aria-hidden>
        <rect x="10" y="18" width="60" height="36" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 58h64" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="40" cy="36" r="8" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <h3 className="mt-4 font-[var(--font-playfair)] text-xl font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-[1.7] text-[var(--text-secondary)]">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 rounded-full bg-[var(--accent-primary)] px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--on-accent)] hover:bg-[#b85f26]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
