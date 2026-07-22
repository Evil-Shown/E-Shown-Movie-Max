import Link from "next/link";

interface CatalogPaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string | undefined>;
}

function buildHref(
  basePath: string,
  page: number,
  query?: Record<string, string | undefined>
) {
  const params = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value) params.set(key, value);
    }
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export default function CatalogPagination({
  page,
  totalPages,
  basePath,
  query,
}: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 shadow-sm"
    >
      <p className="text-sm text-[var(--text-secondary)]">
        Page {page} of {totalPages.toLocaleString()}
      </p>
      <div className="flex gap-2">
        {prevPage ? (
          <Link
            href={buildHref(basePath, prevPage, query)}
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:text-[var(--accent-primary)]"
          >
            Previous
          </Link>
        ) : (
          <span className="rounded-lg border border-transparent px-4 py-2 text-sm text-[var(--text-dim)]">
            Previous
          </span>
        )}
        {nextPage ? (
          <Link
            href={buildHref(basePath, nextPage, query)}
            className="rounded-md bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--on-accent)] hover:brightness-110"
          >
            Next
          </Link>
        ) : (
          <span className="rounded-lg px-4 py-2 text-sm text-[var(--text-dim)]">Next</span>
        )}
      </div>
    </nav>
  );
}
