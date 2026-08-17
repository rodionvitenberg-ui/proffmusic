import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { NewsItem } from '../types'

const PAGE_SIZE = 8

export const useNewsStore = defineStore('news', () => {
  const items = ref<NewsItem[]>([])
  const loading = ref(false)
  const page = ref(1)
  const loaded = ref(false)

  const featured = computed(
    () => items.value.find((n) => n.isFeaturedNewsArticle) ?? items.value[0] ?? null,
  )

  const rest = computed(() => {
    const id = featured.value?.id
    return items.value.filter((n) => n.id !== id)
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(rest.value.length / PAGE_SIZE)))

  const pageItems = computed(() => {
    const start = (page.value - 1) * PAGE_SIZE
    return rest.value.slice(start, start + PAGE_SIZE)
  })

  async function load() {
    if (loaded.value) return
    loading.value = true
    try {
      const res = await fetch('/news.json')
      const json = await res.json()
      items.value = json.data ?? []
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  function setPage(next: number) {
    page.value = Math.min(totalPages.value, Math.max(1, next))
  }

  return { items, loading, page, featured, rest, totalPages, pageItems, load, setPage }
})
