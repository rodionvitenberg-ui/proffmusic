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

export function nodeToString(node: unknown): string {
  if (typeof node === 'string') return node
  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>
    if (typeof obj.static === 'string') return obj.static
    const items = (obj.body as Record<string, unknown> | undefined)?.items ?? obj.items
    if (Array.isArray(items)) return items.map(nodeToString).join('')
    for (const field of ['value', 'text']) {
      const v = obj[field]
      if (typeof v === 'string') return v
    }
  }
  return ''
}

export function unwrapLocale(value: unknown): unknown {
  if (value == null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }
  if (Array.isArray(value)) return value.map(unwrapLocale)
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if (typeof obj.type === 'number' && ('static' in obj || 'body' in obj || 'loc' in obj)) {
      return nodeToString(obj)
    }
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj)) out[k] = unwrapLocale(v)
    return out
  }
  return value
}
