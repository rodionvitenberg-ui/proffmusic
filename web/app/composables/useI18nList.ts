import journal from '~/data/journal.json'
import { asList } from './readLocalePath'

/**
 * Object lists cannot go through vue-i18n — the locale plugin compiles JSON
 * in i18n/locales/ into AST/functions. Structured copy lives in app/data/.
 */
export function useI18nList<T>(key: string): ComputedRef<T[]> {
  const { locale } = useI18n()
  return computed(() => {
    if (key === 'journal.articles') {
      const pack = journal as Record<string, T[]>
      return asList<T>(pack[String(locale.value)] ?? pack.ru)
    }
    return []
  })
}
