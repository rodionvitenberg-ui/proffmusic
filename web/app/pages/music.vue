<script setup lang="ts">
import type { Track } from '~/types/catalog'

const { t, locale } = useI18n()
const { getPage } = useApi()
const route = useRoute()

const tracks = ref<Track[]>([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)

async function load(reset = false) {
  if (loading.value) return
  loading.value = true
  const next = reset ? 1 : page.value
  const params = new URLSearchParams()
  const q = route.query
  if (q.category__slug) params.set('category__slug', String(q.category__slug))
  if (q.tags__slug) params.set('tags__slug', String(q.tags__slug))
  if (q.is_new) params.set('is_new', String(q.is_new))
  if (q.is_popular) params.set('is_popular', String(q.is_popular))
  params.set('ordering', '-created_at')
  params.set('page', String(next))
  try {
    const data = await getPage<Track>(`/api/tracks/?${params}`)
    if (reset) tracks.value = data.results
    else {
      const seen = new Set(tracks.value.map((x) => x.id))
      tracks.value.push(...data.results.filter((x) => !seen.has(x.id)))
    }
    hasMore.value = Boolean(data.next)
    page.value = next
  } catch {
    hasMore.value = false
  }
  loading.value = false
}

watch(
  () => [route.query, locale.value] as const,
  () => {
    page.value = 1
    hasMore.value = true
    load(true)
  },
  { immediate: true },
)

function more() {
  if (!hasMore.value || loading.value) return
  page.value += 1
  load(false)
}
</script>

<template>
  <div class="cat">
    <div class="cat__head">
      <h1 class="cat__title">{{ t('music.title') }}</h1>
    </div>
    <div class="cat__layout">
      <CatalogFilterSidebar />
      <div>
        <div v-if="tracks.length" class="cat-grid">
          <CatalogTrackCard v-for="track in tracks" :key="track.id" :track="track" :playlist="tracks" />
        </div>
        <p v-else-if="!loading" class="cat-empty">{{ t('music.empty') }}</p>
        <p v-if="loading" class="cat-empty">{{ t('music.loading') }}</p>
        <p v-if="hasMore && tracks.length && !loading" class="the-music__more">
          <button type="button" class="button button--solid" @click="more">{{ t('music.more') }}</button>
        </p>
      </div>
    </div>
  </div>
</template>
