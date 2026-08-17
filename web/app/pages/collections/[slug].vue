<script setup lang="ts">
import type { Collection } from '~/types/catalog'

const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const { get, coverSrc } = useApi()
const cart = useCartStore()
const player = usePlayerStore()

const slug = computed(() => String(route.params.slug || ''))
const { data: collection } = await useAsyncData(
  () => `collection-${slug.value}`,
  async () => {
    try {
      return await get<Collection>(`/api/collections/${slug.value}/`)
    } catch (err) {
      console.error(`Failed to fetch collection ${slug.value}:`, err)
      return null
    }
  },
)

const inCart = computed(() => collection.value && cart.isInCart(collection.value.id, 'collection'))

function playAll() {
  const tracks = collection.value?.tracks || []
  if (tracks[0]) player.setTrack(tracks[0], tracks)
}
</script>

<template>
  <div v-if="collection" class="track-page">
    <div class="track-hero">
      <div class="track-hero__cover">
        <img v-if="coverSrc(collection.cover_image)" :src="coverSrc(collection.cover_image)" :alt="collection.title" />
      </div>
      <div>
        <h1 class="track-hero__title">{{ collection.title }}</h1>
        <p class="track-hero__lead">{{ collection.description }}</p>
        <p class="cat-card__price">{{ formatPrice(collection.price) }}</p>
        <div class="track-hero__actions">
          <button type="button" class="button button--solid" @click="playAll">{{ t('player.play') }}</button>
          <button
            type="button"
            class="button button--solid"
            @click="inCart ? cart.remove(collection.id, 'collection') : cart.add(collection, 'collection')"
          >
            {{ inCart ? t('cart.inCart') : t('cart.add') }}
          </button>
        </div>
      </div>
    </div>
    <div v-if="collection.tracks?.length" class="cat-grid">
      <CatalogTrackCard
        v-for="track in collection.tracks"
        :key="track.id"
        :track="track"
        :playlist="collection.tracks"
      />
    </div>
  </div>
  <div v-else class="pm-page">
    <h1 class="pm-page__title">{{ t('collections.missing') }}</h1>
    <p class="the-music__more">
      <NuxtLink :to="localePath('/collections')" class="button button--solid">{{ t('nav.collections') }}</NuxtLink>
    </p>
  </div>
</template>
