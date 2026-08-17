<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import gsap from 'gsap'
import { useMusicStore } from '../../stores/music'
import { albumCover, albumCoverFallback, onImgError } from '../../data/media'
import { prefersReducedMotion } from '../../motion/reducedMotion'

const music = useMusicStore()
const vinyl = ref<HTMLElement | null>(null)
let spin: gsap.core.Tween | null = null
const loop = computed(() => {
  const picks = music.catalog.slice(0, 3)
  return [...picks, ...picks, ...picks, ...picks]
})

onMounted(async () => {
  await music.load()
  if (prefersReducedMotion() || !vinyl.value) return
  spin = gsap.to(vinyl.value, { rotation: '+=360', duration: 18, ease: 'none', repeat: -1 })
})

onUnmounted(() => spin?.kill())
</script>

<template>
  <section class="orangefield-records">
    <div class="orangefield-records__inner">
      <div class="orangefield-records__record-wrap">
        <div class="orangefield-records__record">
          <img
            ref="vinyl"
            class="orangefield-records__record-img"
            src="/images/van-morrison-live-at-orangefield.webp"
            alt=""
          />
        </div>
      </div>
      <div class="orangefield-records__intro">
        <img class="orangefield-records__logo" src="/images/orangefield-records-logo.svg" alt="Orangefield Records" />
        <h2 class="orangefield-records__title">Orangefield Records</h2>
        <p>A label driven by independence, integrity and creative control.</p>
        <div class="orangefield-records__actions">
          <a href="https://vanmorrison.com/orangefield-records" class="orangefield-records__cta">About Label</a>
          <a href="https://vanmorrison.com/store" class="orangefield-records__cta">Store</a>
        </div>
      </div>
    </div>
    <div class="orangefield-records__rail">
      <div class="orangefield-records__marquee">
        <div class="orangefield-records__marquee-track">
          <RouterLink
            v-for="(album, i) in loop"
            :key="album.slug + i"
            :to="`/music/${album.slug}`"
            class="orangefield-records__album"
            :aria-label="album.title"
          >
            <img
              :src="albumCover(album)"
              :alt="album.title"
              class="orangefield-records__album-img"
              width="240"
              height="240"
              loading="lazy"
              @error="onImgError($event, albumCoverFallback(album))"
            />
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
