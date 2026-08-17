<script setup lang="ts">
import gsap from 'gsap'

const props = defineProps<{
  promo: { title: string; eyebrow: string; href: string; image: string } | null
}>()

const heading = ref<HTMLElement | null>(null)
const promoEl = ref<HTMLElement | null>(null)
const leftCurtain = ref<HTMLElement | null>(null)
const rightCurtain = ref<HTMLElement | null>(null)
const glLayer = ref<HTMLElement | null>(null)
const { t } = useI18n()

let played = false
let introTimer: ReturnType<typeof setTimeout> | null = null
let tl: gsap.core.Timeline | null = null

function openCurtains() {
  if (played || !heading.value || !leftCurtain.value || !rightCurtain.value) return
  played = true
  if (introTimer) {
    clearTimeout(introTimer)
    introTimer = null
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.set(leftCurtain.value, { scaleX: 0 })
    gsap.set(rightCurtain.value, { scaleX: 0 })
    gsap.set(heading.value, { y: 0, opacity: 1 })
    if (promoEl.value) gsap.set(promoEl.value, { y: 0, opacity: 1 })
    return
  }

  gsap.ticker.lagSmoothing(0)
  tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: () => gsap.ticker.lagSmoothing(500),
  })
  tl.to(leftCurtain.value, { scaleX: 0, transformOrigin: 'left center', duration: 0.9 }, 0)
  tl.to(rightCurtain.value, { scaleX: 0, transformOrigin: 'right center', duration: 0.9 }, 0)
  tl.to(heading.value, { y: 0, opacity: 1, duration: 0.8 }, 0.25)
  if (promoEl.value) tl.to(promoEl.value, { y: 0, opacity: 1, duration: 0.6 }, 0.55)
}

function onVeilReady() {
  // WebGL-канвас — прогрессивное улучшение: как только первый кадр реально
  // отрисован, мягко проявляем его поверх CSS-вейла. Если WebGL сломан —
  // остаёмся на живом CSS-вейле, интро всё равно играет.
  // Когда канвас активен, CSS-вейл под ним больше не нужен — останавливаем
  // его бесконечную анимацию, чтобы не расходовать GPU впустую.
  if (glLayer.value) {
    glLayer.value.classList.add('is-active')
    const wrap = glLayer.value.closest('.site-hero-wrap')
    wrap?.classList.add('is-webgl-active')
  }
}

onMounted(() => {
  // Интро запускается по таймеру, а не по готовности WebGL: шторки и заголовок
  // обязаны разъехаться всегда, даже если WebGL недоступен/сломан.
  introTimer = setTimeout(openCurtains, 450)
})

onUnmounted(() => {
  if (introTimer) clearTimeout(introTimer)
  tl?.kill()
  gsap.ticker.lagSmoothing(500)
})
</script>

<template>
  <div class="site-hero-wrap">
    <section class="site-hero" id="site-hero" aria-label="Homepage hero">
      <div class="site-hero__veil" aria-hidden />
      <div class="site-hero__veil site-hero__veil--mid" aria-hidden />
      <div ref="glLayer" class="site-hero__gl">
        <HomeDarkVeil :hue-shift="0" :speed="0.45" :warp-amount="0.45" @ready="onVeilReady" />
      </div>
      <div ref="leftCurtain" class="site-hero__curtain site-hero__curtain--left" aria-hidden />
      <div ref="rightCurtain" class="site-hero__curtain site-hero__curtain--right" aria-hidden />
      <div class="site-hero__text-wrap" ref="heading">
        <h1 class="site-hero__heading">
          <span class="site-hero__heading-fill">{{ t('home.wordmark') }}</span>
          <span class="site-hero__heading-outline" aria-hidden>{{ t('home.wordmark') }}</span>
        </h1>
      </div>
    </section>
    <div
      v-if="promo"
      ref="promoEl"
      class="site-hero__promo site-hero__promo--custom"
      :style="{ '--promo-bg': 'var(--brand-primary)', '--promo-text': '#fff' }"
    >
      <img :src="promo.image" :alt="promo.title" class="site-hero__promo-img" width="140" height="140" />
      <div class="site-hero__promo-text">
        <p class="site-hero__promo-eyebrow">{{ promo.eyebrow }}</p>
        <h2 class="site-hero__promo-title">{{ promo.title }}</h2>
        <div class="site-hero__promo-actions">
          <NuxtLink :to="promo.href" class="site-hero__promo-cta">{{ t('nav.exploreMusic') }}</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
