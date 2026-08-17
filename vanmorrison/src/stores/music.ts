import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Album, ViewMode } from '../types'

export const useMusicStore = defineStore('music', () => {
  const catalog = ref<Album[]>([])
  const archiveViewMode = ref<ViewMode>('timeline')
  const lastScrollPos = ref(0)
  const loaded = ref(false)

  async function load() {
    if (loaded.value) return
    const res = await fetch('/catalog.json')
    catalog.value = await res.json()
    loaded.value = true
  }

  function getBySlug(slug: string) {
    return catalog.value.find((a) => a.slug === slug) ?? null
  }

  function getNavigation(slug: string) {
    const i = catalog.value.findIndex((a) => a.slug === slug)
    const n = catalog.value.length
    if (i === -1 || n === 0) return { prev: null, next: null }
    return {
      prev: catalog.value[(i - 1 + n) % n],
      next: catalog.value[(i + 1) % n],
    }
  }

  return { catalog, archiveViewMode, lastScrollPos, loaded, load, getBySlug, getNavigation }
})
