<script setup lang="ts">
import { computed, onMounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useNewsStore } from '../../stores/news'
import { newsCover, newsCoverFallback, onImgError } from '../../data/media'
import { prefersReducedMotion } from '../../motion/reducedMotion'

gsap.registerPlugin(ScrollTrigger)
const news = useNewsStore()
const items = computed(() => news.items.slice(0, 2))

onMounted(async () => {
  await news.load()
  if (prefersReducedMotion()) return
  const cards = document.querySelectorAll('body.is-homepage .latest-news__item')
  gsap.from(cards, {
    y: 24,
    duration: 0.7,
    stagger: 0.12,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.latest-news', start: 'top 85%' },
  })
})
</script>

<template>
  <section class="latest-news">
    <div class="latest-news__inner">
      <header class="latest-news__header">
        <h2 class="latest-news__title">Latest News</h2>
      </header>
      <div class="latest-news__grid">
        <article
          v-for="item in items"
          :key="item.id"
          class="latest-news__item"
          :class="{ 'latest-news__item--album': item.newsType === 'albumNews' }"
        >
          <a :href="item.url" class="latest-news__link">
            <div class="latest-news__image-wrap" :style="item.backgroundColour ? { backgroundColor: item.backgroundColour } : undefined">
              <img
                :src="newsCover(item)"
                :alt="item.title"
                class="latest-news__image"
                loading="lazy"
                @error="onImgError($event, newsCoverFallback(item))"
              />
            </div>
            <div class="latest-news__body">
              <h3 class="latest-news__headline">{{ item.title }}</h3>
            </div>
          </a>
        </article>
      </div>
    </div>
  </section>
</template>
