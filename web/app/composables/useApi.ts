import { apiBase } from '~/utils/apiBase'

export function useApi() {
  const config = useRuntimeConfig()
  const base = apiBase(String(config.public.apiUrl || ''), import.meta.dev)

  function coverSrc(url?: string | null) {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return `${base}${url.startsWith('/') ? url : `/${url}`}`
  }

  async function list<T>(path: string, opts: { throwOnError?: boolean } = {}): Promise<T[]> {
    try {
      const data = await $fetch<T[] | { results: T[] }>(`${base}${path}`)
      if (Array.isArray(data)) return data
      return data.results || []
    } catch (err) {
      if (opts.throwOnError) throw err
      return []
    }
  }

  async function getPage<T>(path: string): Promise<{ results: T[]; next: string | null }> {
    return await $fetch<{ results: T[]; next: string | null }>(`${base}${path}`)
  }

  async function get<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return await $fetch<T>(`${base}${path}`, { headers })
  }

  async function post<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return await $fetch<T>(`${base}${path}`, { method: 'POST', body, headers })
  }

  return { base, coverSrc, list, getPage, get, post }
}
