<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { useMusicStore } from '../../stores/music'
import { albumCover, albumCoverFallback, onImgError } from '../../data/media'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import type { Album, ViewMode } from '../../types'

gsap.registerPlugin(Flip)

const music = useMusicStore()
const router = useRouter()
const main = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
const viewport = ref<HTMLElement | null>(null)
const yearEl = ref<HTMLElement | null>(null)
const fillEl = ref<HTMLElement | null>(null)
const cards = ref<(HTMLElement | null)[]>([])
const yearLabel = ref('')
const switching = ref(false)

let maxScroll = 0
let currentX = 0
let targetX = 0
let raf = 0

function mode(): ViewMode {
  return music.archiveViewMode
}

function measure() {
  if (!track.value) return
  maxScroll = Math.max(0, track.value.scrollWidth - window.innerWidth)
}

function applyX(x: number) {
  if (!track.value) return
  gsap.set(track.value, { x: -x })
}

function tick() {
  if (mode() === 'timeline' && maxScroll > 0) {
    currentX += (targetX - currentX) * 0.07
    applyX(currentX)
    const p = maxScroll ? currentX / maxScroll : 0
    if (fillEl.value) fillEl.value.style.width = `${Math.round(p * 1000) / 10}%`
    const i = Math.round(p * (music.catalog.length - 1))
    const y = music.catalog[i]?.year || ''
    if (y !== yearLabel.value) {
      yearLabel.value = y
      if (yearEl.value) yearEl.value.textContent = y
    }
  }
  raf = requestAnimationFrame(tick)
}

function onWheel(event: WheelEvent) {
  if (mode() !== 'timeline') return
  event.preventDefault()
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
  targetX = Math.max(0, Math.min(maxScroll, targetX + delta))
}

async function setMode(next: ViewMode) {
  if (next === mode() || switching.value) return
  if (next === 'timeline' && prefersReducedMotion()) {
    music.archiveViewMode = 'grid'
    return
  }
  switching.value = true
  main.value?.classList.add('archive--switching')
  const state = prefersReducedMotion() ? null : Flip.getState('.album-card__image-wrap')
  music.archiveViewMode = next
  await nextTick()
  measure()
  if (next === 'grid') {
    currentX = targetX = 0
    applyX(0)
  }
  if (state) {
    Flip.from(state, {
      duration: 0.65,
      ease: 'expo.inOut',
      scale: true,
      onComplete: () => {
        switching.value = false
        main.value?.classList.remove('archive--switching')
      },
    })
  } else {
    switching.value = false
    main.value?.classList.remove('archive--switching')
  }
}

function openAlbum(album: Album) {
  router.push(`/music/${album.slug}`)
}

onMounted(async () => {
  await music.load()
  document.body.classList.add('music-archive-active')
  await nextTick()
  cards.value = cards.value.slice(0, music.catalog.length)
  if (prefersReducedMotion() && music.archiveViewMode === 'timeline') {
    music.archiveViewMode = 'grid'
  }
  measure()
  window.addEventListener('resize', measure)
  viewport.value?.addEventListener('wheel', onWheel, { passive: false })
  raf = requestAnimationFrame(tick)
  gsap.set('.album-card, .mode-toggle, .timeline-ui', { clearProps: 'opacity,visibility,transform' })
})

onUnmounted(() => {
  document.body.classList.remove('music-archive-active')
  window.removeEventListener('resize', measure)
  viewport.value?.removeEventListener('wheel', onWheel)
  cancelAnimationFrame(raf)
})

watch(
  () => music.catalog.length,
  async () => {
    await nextTick()
    measure()
  },
)
</script>

<template>
  <div class="archive-pin-wrapper">
    <div ref="main" class="archive" :class="`archive--${music.archiveViewMode}`">
      <div class="archive__bg"></div>
      <div ref="viewport" class="archive__viewport">
        <div ref="track" class="archive__track">
          <div
            v-for="(album, i) in music.catalog"
            :key="album.id"
            class="album-card"
            role="button"
            tabindex="0"
            :aria-label="`View ${album.title}`"
            :ref="(el) => (cards[i] = el as HTMLElement)"
            @click="openAlbum(album)"
            @keydown.enter="openAlbum(album)"
          >
            <div class="album-card__image-wrap">
              <img
                class="album-card__img"
                :src="albumCover(album)"
                :alt="album.title"
                draggable="false"
                loading="lazy"
                @error="onImgError($event, albumCoverFallback(album))"
              />
            </div>
            <div class="album-card__meta">
              <h3 class="album-card__title">{{ album.title }}</h3>
              <span class="album-card__year">{{ album.year }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="music.archiveViewMode === 'timeline'" class="timeline-ui">
        <div ref="yearEl" class="timeline-ui__year" aria-live="polite">{{ yearLabel }}</div>
        <div class="timeline-ui__progress-bar">
          <div ref="fillEl" class="timeline-ui__fill"></div>
        </div>
      </div>
      <nav class="mode-toggle" aria-label="Archive view mode">
        <button
          type="button"
          class="mode-toggle__btn"
          :class="{ 'mode-toggle__btn--active': music.archiveViewMode === 'timeline' }"
          :disabled="prefersReducedMotion()"
          @click="setMode('timeline')"
        >
          Timeline
        </button>
        <button
          type="button"
          class="mode-toggle__btn"
          :class="{ 'mode-toggle__btn--active': music.archiveViewMode === 'grid' }"
          @click="setMode('grid')"
        >
          Grid
        </button>
      </nav>
    </div>
  </div>
</template>
