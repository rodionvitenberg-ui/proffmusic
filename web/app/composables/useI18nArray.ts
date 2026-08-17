import { readLocalePath } from './readLocalePath'

/**
 * Возвращает перевод-массив строк по ключу (например, "home.fanParas") как
 * обычный string[].
 *
 * В vue-i18n v10 функции t()/tm() возвращают скомпилированные AST-сообщения
 * (объекты вида { type, static, body: { items } }), которые нельзя рендерить
 * напрямую — интерполяция {{ item }} превращает их в JSON-строку.
 * getLocaleMessage() отдаёт сырые сообщения, но они тоже могут быть узлами,
 * поэтому нормализуем рекурсивно: строки оставляем, из узлов достаём текст.
 */

export function useI18nArray(key: string): ComputedRef<string[]> {
  const { locale, getLocaleMessage } = useI18n()

  return computed(() => {
    const value = readLocalePath(getLocaleMessage(locale.value), key)
    const list = Array.isArray(value) ? value : [value]
    return list.map(nodeToString)
  })
}

function nodeToString(node: unknown): string {
  if (typeof node === 'string') return node
  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>
    if (typeof obj.static === 'string') return obj.static
    const items = (obj.body as Record<string, unknown> | undefined)?.items ?? obj.items
    if (Array.isArray(items)) return items.map(nodeToString).join('')
    for (const field of ['value', 'text', 'toString']) {
      const v = obj[field]
      if (typeof v === 'string') return v
    }
  }
  return ''
}