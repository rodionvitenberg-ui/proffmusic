import { nodeToString, readLocalePath } from './readLocalePath'

/**
 * String arrays from locale JSON. t() returns compiled AST on vue-i18n v10;
 * getLocaleMessage + nodeToString is enough for flat strings.
 */
export function useI18nArray(key: string): ComputedRef<string[]> {
  const { locale, getLocaleMessage } = useI18n()

  return computed(() => {
    const value = readLocalePath(getLocaleMessage(locale.value), key)
    const list = Array.isArray(value) ? value : [value]
    return list.map(nodeToString)
  })
}
