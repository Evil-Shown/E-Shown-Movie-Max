type Props = {
  onTrendingClick: () => void;
};

export default function EmptyState({ onTrendingClick }: Props) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center">
      <p className="text-3xl">🔍</p>
      <h3 className="mt-3 font-[var(--font-playfair)] text-xl font-semibold text-[var(--text-primary)]">
        No uploads found
      </h3>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Try different keywords, adjust quality, or search for a different format
      </p>
      <button
        type="button"
        onClick={onTrendingClick}
        className="mt-4 text-sm font-medium text-[var(--accent-primary)] transition hover:underline"
      >
        Search trending instead →
      </button>
    </div>
  );
}
