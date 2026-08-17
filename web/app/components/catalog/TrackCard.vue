<script setup lang="ts">
import type { Track } from '~/types/catalog'

const props = defineProps<{ track: Track; playlist?: Track[] }>()
const { t } = useI18n()
const { coverSrc } = useApi()
const localePath = useLocalePath()
const player = usePlayerStore()
const cart = useCartStore()

const active = computed(() => player.current?.id === props.track.id && player.playing)
const inCart = computed(() => cart.isInCart(props.track.id, 'track'))
const trackUrl = computed(() => localePath(`/tracks/${props.track.slug}`))

function play() {
  player.setTrack(props.track, props.playlist || [props.track])
}

function toggleCart() {
  if (inCart.value) cart.remove(props.track.id, 'track')
  else cart.add(props.track, 'track')
}
</script>

<template>
  <article class="cat-card" :class="{ 'cat-card--in-cart': inCart }">
    <div class="cat-card__cover">
      <NuxtLink :to="trackUrl" class="cat-card__link" :aria-label="track.title">
        <img
          v-if="coverSrc(track.cover_image)"
          :src="coverSrc(track.cover_image)"
          :alt="track.title"
          width="600"
          height="600"
          loading="lazy"
          decoding="async"
        />
      </NuxtLink>
      <button
        type="button"
        class="cat-card__play"
        :class="{ 'is-on': active }"
        :aria-label="active ? t('player.pause') : t('player.play')"
        @click="play"
      >
        {{ active ? t('player.pause') : t('player.play') }}
      </button>
    </div>
    <div class="cat-card__meta">
      <NuxtLink :to="trackUrl" class="cat-card__link">
        <h3 class="cat-card__name">{{ track.title }}</h3>
      </NuxtLink>
      <div class="cat-card__row">
        <div class="cat-card__price-group">
          <span class="cat-card__price">{{ formatPrice(track.price) }}</span>
          <span class="cat-card__purchases">{{ track.purchases_count ?? 0 }} {{ t('track.purchases') }}</span>
        </div>
        <button
          type="button"
          class="cat-card__cart"
          :aria-label="inCart ? t('cart.inCart') : t('cart.add')"
          @click="toggleCart"
        >
          {{ inCart ? t('cart.inCart') : t('cart.add') }}
        </button>
      </div>
    </div>
  </article>
</template>