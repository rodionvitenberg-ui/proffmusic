<script setup lang="ts">
import { onMounted, ref } from 'vue'
import gsap from 'gsap'
import StreamIcons from '../icons/StreamIcons.vue'
import { hasSplashCookie, prefersReducedMotion, setSplashCookie } from '../../motion/reducedMotion'

const emit = defineEmits<{ enter: [] }>()
const root = ref<HTMLElement | null>(null)
const visible = ref(!hasSplashCookie() && !location.search.includes('nosplash'))

onMounted(async () => {
  if (!visible.value) {
    document.documentElement.classList.add('site-splash-seen')
    document.documentElement.classList.remove('site-splash-locked')
    emit('enter')
    return
  }
  document.documentElement.classList.add('site-splash-locked')
  const imgs = [
    '/media/albums/somebody-tried-to-sell-me-a-bridge.webp',
    '/images/new-album-shadow-left.png',
    '/images/new-album-shadow-right.png',
  ]
  await Promise.all(
    imgs.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image()
          img.onload = () => resolve()
          img.onerror = () => resolve()
          img.src = src
        }),
    ),
  )
  requestAnimationFrame(() => root.value?.classList.add('site-splash--ready'))
})

async function enter() {
  setSplashCookie()
  const el = root.value
  if (!el || prefersReducedMotion()) {
    finish()
    return
  }
  const parts = ['#splash-album', '#splash-meta', '#splash-stream', '#splash-actions']
    .map((s) => el.querySelector(s))
    .filter(Boolean)
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' }, onComplete: finish })
  tl.to(parts, { autoAlpha: 0, y: -16, duration: 0.4, stagger: 0.06, ease: 'power2.in' })
  tl.to(el, { backgroundColor: '#0f0f0f', duration: 0.45 }, '-=0.15')
}

function finish() {
  document.documentElement.classList.add('site-splash-seen')
  document.documentElement.classList.remove('site-splash-locked')
  visible.value = false
  emit('enter')
}
</script>

<template>
  <div v-if="visible" id="site-splash" ref="root" class="site-splash site-splash--custom">
    <div class="site-splash__inner">
      <div id="splash-album" class="site-splash__album site-splash__custom-media">
        <img
          class="site-splash__album-img"
          src="/media/albums/somebody-tried-to-sell-me-a-bridge.webp"
          alt="Somebody Tried To Sell Me A Bridge"
        />
      </div>
      <div id="splash-meta" class="site-splash__meta site-splash__custom-content">
        <p class="site-splash__custom-title">Somebody Tried To Sell Me A Bridge</p>
        <p class="site-splash__custom-subheading">Exclusive Vinyl &amp; CD Out Now</p>
      </div>
      <div id="splash-stream" class="site-splash__stream">
        <p class="site-splash__stream-label">Stream on</p>
        <ul class="site-splash__stream-icons">
          <li>
            <a class="site-splash__stream-icon" href="https://open.spotify.com/album/3oKljjJDJyZl4trREah2pp" target="_blank" rel="noopener noreferrer" aria-label="Spotify"><StreamIcons name="spotify" /></a>
          </li>
          <li>
            <a class="site-splash__stream-icon" href="https://music.apple.com/gb/album/somebody-tried-to-sell-me-a-bridge/1860998242" target="_blank" rel="noopener noreferrer" aria-label="Apple Music"><StreamIcons name="apple" /></a>
          </li>
          <li>
            <a class="site-splash__stream-icon" href="https://music.amazon.com/albums/B0G6QC7WQK" target="_blank" rel="noopener noreferrer" aria-label="Amazon Music"><StreamIcons name="amazon" /></a>
          </li>
          <li>
            <a class="site-splash__stream-icon" href="https://music.youtube.com/browse/MPREb_pwLbKwlYnKt" target="_blank" rel="noopener noreferrer" aria-label="YouTube Music"><StreamIcons name="youtube" /></a>
          </li>
        </ul>
      </div>
      <div id="splash-actions" class="site-splash__actions">
        <button id="splash-enter" type="button" class="button button--solid" @click="enter">Enter Site</button>
      </div>
    </div>
  </div>
</template>
