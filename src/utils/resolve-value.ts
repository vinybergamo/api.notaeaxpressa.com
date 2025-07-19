export function resolveValue<T>(
  a: T | null | undefined,
  b: T | null | undefined,
  c: T,
): T {
  if (a != null) return a;
  if (b != null) return b;
  return c;
}
