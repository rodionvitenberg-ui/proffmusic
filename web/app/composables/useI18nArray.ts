import copy from '~/data/copy.json'
import { nodeToString, readLocalePath } from './readLocalePath'

/**
 * Long-form paragraph arrays live in app/data/copy.json.
 * vue-i18n compiles locale JSON; getLocaleMessage() hydrates to AST/functions.
 */
export function useI18nArray(key: string): ComputedRef<string[]> {
  const { locale } = useI18n()

  return computed(() => {
    const pack = (copy as Record<string, unknown>)[String(locale.value)] ?? copy.ru
    const value = readLocalePath(pack, key)
    const list = Array.isArray(value) ? value : []
    return list.map(nodeToString)
  })
}
