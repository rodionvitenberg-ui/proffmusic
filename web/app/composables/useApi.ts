import { apiBase } from '~/utils/apiBase'

export function useApi() {
  const config = useRuntimeConfig()
  const i18n = useI18n()
  const base = apiBase(String(config.public.apiUrl || ''), import.meta.dev)

  function langHeaders(extra?: Record<string, string>): Record<string, string> {
    return {
      'Accept-Language': String(i18n.locale.value),
      ...extra,
    }
  }

  function coverSrc(url?: string | null) {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return `${base}${url.startsWith('/') ? url : `/${url}`}`
  }

  async function list<T>(path: string, opts: { throwOnError?: boolean } = {}): Promise<T[]> {
    try {
      const data = await $fetch<T[] | { results: T[] }>(`${base}${path}`, { headers: langHeaders() })
      if (Array.isArray(data)) return data
      return data.results || []
    } catch (err) {
      if (opts.throwOnError) throw err
      return []
    }
  }

  async function getPage<T>(path: string): Promise<{ results: T[]; next: string | null }> {
    return await $fetch<{ results: T[]; next: string | null }>(`${base}${path}`, { headers: langHeaders() })
  }

  async function get<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return await $fetch<T>(`${base}${path}`, { headers: langHeaders(headers) })
  }

  async function post<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return await $fetch<T>(`${base}${path}`, { method: 'POST', body, headers: langHeaders(headers) })
  }

  return { base, coverSrc, list, getPage, get, post }
}
