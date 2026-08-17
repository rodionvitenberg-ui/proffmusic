<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useMusicStore } from '../../stores/music'
import { albumCover, albumCoverFallback, onImgError } from '../../data/media'
import { prefersReducedMotion } from '../../motion/reducedMotion'

const music = useMusicStore()
const fan = ref<HTMLElement | null>(null)
const albums = computed(() => music.catalog.slice(1, 6).length ? music.catalog.slice(1, 6) : music.catalog.slice(0, 5))

function spread(event: PointerEvent) {
  if (!fan.value || prefersReducedMotion()) return
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  const cards = Array.from(fan.value.querySelectorAll<HTMLElement>('.the-music__card'))
  const rect = fan.value.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width - 0.5
  const mid = (cards.length - 1) / 2
  cards.forEach((card, i) => {
    const fromMid = i - mid
    const rot = fromMid * 8 + x * 10
    const tx = fromMid * 42 + x * 28
    card.style.transform = `translateX(calc(-50% + ${tx}px)) rotate(${rot}deg)`
  })
}

function reset() {
  if (!fan.value) return
  fan.value.querySelectorAll<HTMLElement>('.the-music__card').forEach((card) => {
    card.style.transform = ''
  })
}

onMounted(async () => {
  await music.load()
})
onUnmounted(reset)
</script>

<template>
  <section class="the-music">
    <div class="the-music__inner">
      <h2 class="the-music__title">The Music</h2>
      <div
        ref="fan"
        class="the-music__fan the-music__fan--count-5"
        @pointermove="spread"
        @pointerleave="reset"
      >
        <RouterLink
          v-for="album in albums"
          :key="album.id"
          :to="`/music/${album.slug}`"
          class="the-music__card"
          :aria-label="album.title"
          :title="album.title"
        >
          <img
            :src="albumCover(album)"
            :alt="`${album.title} – Van Morrison album cover`"
            class="the-music__card-img"
            width="522"
            height="522"
            loading="lazy"
            @error="onImgError($event, albumCoverFallback(album))"
          />
          <span class="the-music__card-label">{{ album.title }}</span>
        </RouterLink>
      </div>
      <p class="the-music__more">
        <RouterLink to="/music" class="button button--solid">Explore the Music</RouterLink>
      </p>
    </div>
  </section>
</template>
