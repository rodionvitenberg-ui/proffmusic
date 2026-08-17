export function readLocalePath(root: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[part]
    return undefined
  }, root)
}

export function asList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  return []
}
