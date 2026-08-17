<script setup lang="ts">
import type { Collection, Track } from '~/types/catalog'

const { t } = useI18n()
const localePath = useLocalePath()
const { list, coverSrc } = useApi()

const collections = ref<Collection[]>([])
const tracks = ref<Track[]>([])
const newTracks = ref<Track[]>([])
const popularTracks = ref<Track[]>([])

onMounted(async () => {
  const [cols, all, fresh, popular] = await Promise.all([
    list<Collection>('/api/collections/?ordering=-created_at'),
    list<Track>('/api/tracks/?ordering=-created_at'),
    list<Track>('/api/tracks/?is_new=true&ordering=-created_at'),
    list<Track>('/api/tracks/?is_popular=true&ordering=-created_at'),
  ])
  collections.value = cols
  tracks.value = all
  newTracks.value = fresh.slice(0, 8)
  popularTracks.value = popular.slice(0, 8)
})

const lead = computed(() => collections.value[0] || tracks.value[0] || null)
const splashTitle = computed(() => lead.value?.title || t('home.splashSub'))
const splashCover = computed(() => coverSrc(lead.value?.cover_image))
const promo = computed(() => {
  const item = lead.value
  if (!item) return null
  const isCol = collections.value[0]?.slug === item.slug
  return {
    title: item.title,
    eyebrow: isCol ? t('nav.collections') : t('nav.music'),
    href: localePath(isCol ? `/collections/${item.slug}` : `/tracks/${item.slug}`),
    image: coverSrc(item.cover_image),
  }
})
</script>

<template>
  <div class="home-page">
    <HomeSiteHero :promo="promo" />
    <HomeTheMusicFan />
    <HomeTrackRail
      :title="t('home.newTitle')"
      :tracks="newTracks"
      :more-href="localePath('/music?is_new=true')"
      :more-label="t('home.seeAll')"
    />
    <HomeTrackRail
      :title="t('home.popularTitle')"
      :tracks="popularTracks"
      :more-href="localePath('/music?is_popular=true')"
      :more-label="t('home.seeAll')"
    />
  </div>
</template>