type Props = {
  error: string;
  retryable?: boolean;
  onRetry: () => void;
};

export default function ErrorState({ error, retryable = true, onRetry }: Props) {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
      <h3 className="font-semibold text-red-600">Something went wrong</h3>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{error}</p>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">
        Check your internet connection and try again.
      </p>
      {retryable && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
        >
          Retry search
        </button>
      )}
    </div>
  );
}
