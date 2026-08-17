import { asList, readLocalePath } from './readLocalePath'

export function useI18nList<T>(key: string): ComputedRef<T[]> {
  const { locale, getLocaleMessage } = useI18n()
  return computed(() => asList<T>(readLocalePath(getLocaleMessage(locale.value), key)))
}
