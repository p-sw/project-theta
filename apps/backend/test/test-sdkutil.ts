type HTTPMethods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';

export function metadata<T extends (...args: unknown[]) => unknown>(
  sdkFn: T,
  params?: Record<string, string> | null,
  query?: Record<string, string> | null,
) {
  const fn = sdkFn as unknown as {
    metadata: { path: string; method: HTTPMethods };
  };
  const url = new URL(fn.metadata.path, 'http://localhost:3000');
  if (params)
    Object.entries(params).forEach(([key, value]) => {
      url.pathname = url.pathname.replace(`:${key}`, value);
    });
  if (query)
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  return { path: url.toString(), method: fn.metadata.method };
}
