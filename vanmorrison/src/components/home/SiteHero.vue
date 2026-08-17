<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import gsap from 'gsap'
import { prefersReducedMotion } from '../../motion/reducedMotion'

const props = defineProps<{ playIntro: boolean }>()
const heading = ref<HTMLElement | null>(null)
const promo = ref<HTMLElement | null>(null)
let played = false

function play() {
  if (played || !props.playIntro || !heading.value) return
  played = true
  const left = document.querySelector('.site-hero__curtain--left')
  const right = document.querySelector('.site-hero__curtain--right')
  if (prefersReducedMotion()) {
    gsap.set([left, right], { scaleX: 0 })
    return
  }
  gsap.set(heading.value, { y: 80, autoAlpha: 1 })
  gsap.set(promo.value, { y: 24, autoAlpha: 1 })
  gsap.set([left, right], { scaleX: 1 })
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' }, delay: 0.1 })
  tl.to(left, { scaleX: 0, transformOrigin: 'left center', duration: 0.9 }, 0)
  tl.to(right, { scaleX: 0, transformOrigin: 'right center', duration: 0.9 }, 0)
  tl.to(heading.value, { y: 0, duration: 0.8 }, 0.25)
  tl.to(promo.value, { y: 0, duration: 0.6 }, 0.55)
}

onMounted(() => play())
watch(() => props.playIntro, () => play())
</script>

<template>
  <div class="site-hero-wrap">
    <section class="site-hero" id="site-hero" aria-label="Homepage hero">
      <video class="site-hero__video" autoplay muted loop playsinline preload="metadata">
        <source src="/media/video/vm-homepage-hero.mp4" type="video/mp4" />
      </video>
      <div class="site-hero__curtain site-hero__curtain--left" aria-hidden="true"></div>
      <div class="site-hero__curtain site-hero__curtain--right" aria-hidden="true"></div>
      <div class="site-hero__text-wrap" id="hero-text" ref="heading">
        <h1 class="site-hero__heading">
          <span class="site-hero__heading-fill">VAN MORRISON</span>
          <span class="site-hero__heading-outline" aria-hidden="true">VAN MORRISON</span>
        </h1>
      </div>
    </section>

    <div
      class="site-hero__promo site-hero__promo--custom"
      id="hero-promo"
      ref="promo"
      aria-label="Somebody Tried To Sell Me A Bridge"
      style="--promo-bg: #f79e4c; --promo-text: var(--black)"
    >
      <img
        src="/media/promo-vinyl.webp"
        alt="Somebody Tried To Sell Me A Bridge"
        class="site-hero__promo-img"
        width="140"
        height="140"
      />
      <div class="site-hero__promo-text">
        <p class="site-hero__promo-eyebrow">Exclusive Vinyl &amp; CD Out Now</p>
        <h2 class="site-hero__promo-title">Somebody Tried To Sell Me A Bridge</h2>
        <div class="site-hero__promo-actions">
          <a href="https://store.orangefieldrecords.com" class="site-hero__promo-cta">Order Vinyl &amp; CD</a>
          <a
            href="https://vanmorrison.com/news/van-morrisons-acclaimed-album-somebody-tried-to-sell-me-a-bridge-arrives-on-vinyl-for-the-first-time"
            class="site-hero__promo-cta"
          >Learn More</a>
        </div>
      </div>
    </div>
  </div>
</template>
