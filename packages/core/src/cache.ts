export type CacheJsonFn = <T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>
) => Promise<T>;

export function buildCacheKey(
  namespace: string,
  path: string,
  params: Record<string, string>
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params).sort(([a], [b]) => a.localeCompare(b))) {
    search.set(key, value);
  }
  return `${namespace}::${path}?${search.toString()}`;
}
