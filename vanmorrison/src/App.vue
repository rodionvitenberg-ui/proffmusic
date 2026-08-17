<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import SiteHeader from './components/chrome/SiteHeader.vue'
import SiteFooter from './components/chrome/SiteFooter.vue'

const route = useRoute()
const isMusic = computed(() => route.name === 'archive' || route.name === 'entry')
const hideFooter = computed(() => isMusic.value)

watch(
  () => route.name,
  (name) => {
    const body = document.body
    body.classList.toggle('theme-dark', name === 'home' || name === 'archive' || name === 'entry')
    body.classList.toggle('is-homepage', name === 'home')
    body.classList.toggle('theme-light', name === 'news')
    document.title =
      name === 'news'
        ? 'News | Van Morrison | Official Website'
        : name === 'archive' || name === 'entry'
          ? 'Music | Van Morrison'
          : 'Van Morrison Official Website | Tours, Music, Songs'
  },
  { immediate: true },
)
</script>

<template>
  <SiteHeader />
  <main id="main-content">
    <RouterView />
  </main>
  <SiteFooter v-if="!hideFooter" />
</template>
