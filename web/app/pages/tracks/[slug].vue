<script setup lang="ts">
import type { Track } from '~/types/catalog'

const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const { get, coverSrc } = useApi()
const cart = useCartStore()
const player = usePlayerStore()

const slug = computed(() => String(route.params.slug || ''))
const { data: track } = await useAsyncData(
  () => `track-${slug.value}`,
  async () => {
    try {
      return await get<Track>(`/api/tracks/${slug.value}/`)
    } catch (err) {
      console.error(`Failed to fetch track ${slug.value}:`, err)
      return null
    }
  },
)

const inCart = computed(() => track.value && cart.isInCart(track.value.id, 'track'))
const active = computed(() => track.value && player.current?.id === track.value.id && player.playing)

function play() {
  if (track.value) player.setTrack(track.value, [track.value])
}
</script>

<template>
  <div v-if="track" class="track-hero">
    <div class="track-hero__cover">
      <img v-if="coverSrc(track.cover_image)" :src="coverSrc(track.cover_image)" :alt="track.title" />
    </div>
    <div>
      <h1 class="track-hero__title">{{ track.title }}</h1>
      <p class="track-hero__lead">{{ track.description_full || track.description_short }}</p>
      <p class="cat-card__price">{{ formatPrice(track.price) }} <span class="cat-card__purchases">{{ track.purchases_count ?? 0 }} {{ t('track.purchases') }}</span></p>
      <div class="track-hero__actions">
        <button type="button" class="button button--solid" @click="play">{{ active ? t('player.pause') : t('player.play') }}</button>
        <button
          type="button"
          class="button button--solid track-hero__buy"
          @click="inCart ? cart.remove(track.id, 'track') : cart.add(track, 'track')"
        >
          {{ inCart ? t('cart.inCart') : t('cart.add') }}
        </button>
        <NuxtLink :to="localePath('/music')" class="button track-hero__music">{{ t('nav.music') }}</NuxtLink>
      </div>
    </div>
  </div>
  <div v-else class="pm-page">
    <h1 class="pm-page__title">{{ t('track.missing') }}</h1>
  </div>
</template>
