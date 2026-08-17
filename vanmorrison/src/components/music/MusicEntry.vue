<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useMusicStore } from '../../stores/music'
import { albumCover, albumCoverFallback, onImgError } from '../../data/media'
import StreamIcons from '../icons/StreamIcons.vue'
import type { Track } from '../../types'

const props = defineProps<{ slug: string }>()
const music = useMusicStore()
const route = useRoute()
const slug = computed(() => props.slug || String(route.params.slug || ''))
const album = computed(() => music.getBySlug(slug.value))
const nav = computed(() => music.getNavigation(slug.value))

const vars = computed(() => {
  const a = album.value
  if (!a) return {}
  const invert = a.invertHeader
  return {
    backgroundColor: a.backgroundColour || '#e5c8ff',
    '--album-text': invert ? 'var(--black)' : 'var(--white)',
    '--album-arrow-ring': invert ? 'var(--black)' : 'var(--white)',
    '--album-arrow-hover-text': invert ? 'var(--white)' : 'var(--black)',
  } as Record<string, string>
})

function pad(track: Track, i: number) {
  const n = String(track.number || i + 1)
  return n.padStart(2, '0')
}

function discLabel(value: string | null) {
  if (!value) return ''
  const n = Number.parseInt(value, 10)
  if (Number.isNaN(n)) return value.toLowerCase().startsWith('disc') ? value : `Disc ${value}`
  return `Disc ${['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'][n] || n}`
}

const groups = computed(() => {
  const list = album.value?.tracklist ?? []
  const map = new Map<string, Track[]>()
  list.forEach((t) => {
    const key = t.disc || '1'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(t)
  })
  return Array.from(map.entries())
})

onMounted(async () => {
  await music.load()
  document.body.classList.add('music-entry-active')
})

onUnmounted(() => {
  document.body.classList.remove('music-entry-active')
})
</script>

<template>
  <article v-if="album" class="music-entry" :style="vars">
    <div class="music-entry__bg"></div>
    <nav class="music-entry__nav">
      <RouterLink to="/music" class="music-entry__all-link music-entry__all-link--top">
        <span class="music-entry__all-link-text">All albums</span>
      </RouterLink>
    </nav>

    <div class="music-entry__hero">
      <div class="music-entry__arrow-wrap music-entry__arrow-wrap--prev">
        <RouterLink
          v-if="nav.prev"
          :to="`/music/${nav.prev.slug}`"
          class="music-entry__arrow"
          :aria-label="`Previous: ${nav.prev.title}`"
        >
          <span class="music-entry__arrow-ring"></span>
        </RouterLink>
        <span v-if="nav.prev" class="music-entry__arrow-label">{{ nav.prev.title }}</span>
      </div>

      <div class="music-entry__img-container">
        <img
          class="music-entry__img"
          :src="albumCover(album)"
          :alt="album.title"
          :sizes="album.image?.heroSizes"
          @error="onImgError($event, albumCoverFallback(album))"
        />
      </div>

      <div class="music-entry__arrow-wrap music-entry__arrow-wrap--next">
        <RouterLink
          v-if="nav.next"
          :to="`/music/${nav.next.slug}`"
          class="music-entry__arrow"
          :aria-label="`Next: ${nav.next.title}`"
        >
          <span class="music-entry__arrow-ring"></span>
        </RouterLink>
        <span v-if="nav.next" class="music-entry__arrow-label">{{ nav.next.title }}</span>
      </div>
    </div>

    <div class="music-entry__content">
      <div class="music-entry__details">
        <p class="music-entry__release-date js-entry-reveal">{{ album.released }}</p>
        <h1 class="music-entry__title">{{ album.title }}</h1>
        <p v-if="album.albumIntro" class="music-entry__album-intro js-entry-reveal">{{ album.albumIntro }}</p>
        <a
          v-if="album.showBuyOnline && album.officialStore"
          class="music-entry__buy-btn"
          :href="album.officialStore"
          target="_blank"
          rel="noopener noreferrer"
        >{{ album.buyButtonText || 'Buy Now' }}</a>
        <div class="music-entry__stream-on js-entry-reveal">
          <p class="music-entry__stream-label">Stream on</p>
          <ul class="music-entry__icons" aria-label="Streaming platforms">
            <li v-if="album.listenSpotify">
              <a :href="album.listenSpotify" target="_blank" rel="noopener noreferrer" aria-label="Spotify"><StreamIcons name="spotify" /></a>
            </li>
            <li v-if="album.listenAppleMusic">
              <a :href="album.listenAppleMusic" target="_blank" rel="noopener noreferrer" aria-label="Apple Music"><StreamIcons name="apple" /></a>
            </li>
            <li v-if="album.listenAmazonMusic">
              <a :href="album.listenAmazonMusic" target="_blank" rel="noopener noreferrer" aria-label="Amazon Music"><StreamIcons name="amazon" /></a>
            </li>
            <li v-if="album.listenYoutubeMusic">
              <a :href="album.listenYoutubeMusic" target="_blank" rel="noopener noreferrer" aria-label="YouTube Music"><StreamIcons name="youtube" /></a>
            </li>
          </ul>
        </div>
      </div>

      <div class="music-entry__tracklists">
        <section v-for="[disc, tracks] in groups" :key="disc" class="music-entry__tracklist-section">
          <h2 v-if="groups.length > 1" class="music-entry__tracklist-heading">{{ discLabel(disc) }}</h2>
          <ol class="music-entry__tracklist">
            <li v-for="(track, i) in tracks" :key="track.number + track.title" class="music-entry__track">
              <span class="music-entry__track-number" aria-hidden="true">{{ pad(track, i) }}</span>
              <span class="music-entry__track-name">{{ track.title }}</span>
            </li>
          </ol>
        </section>
      </div>
    </div>
  </article>
</template>
