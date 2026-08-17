<script setup lang="ts">
import { onMounted, ref } from 'vue'
import SiteSplash from '../components/home/SiteSplash.vue'
import SiteHero from '../components/home/SiteHero.vue'
import UpcomingShows from '../components/home/UpcomingShows.vue'
import TheMusicFan from '../components/home/TheMusicFan.vue'
import ConcertVaultFeatured from '../components/home/ConcertVaultFeatured.vue'
import LatestNews from '../components/home/LatestNews.vue'
import OrangefieldRecords from '../components/home/OrangefieldRecords.vue'
import { hasSplashCookie } from '../motion/reducedMotion'

const entered = ref(hasSplashCookie() || location.search.includes('nosplash'))

onMounted(() => {
  const y = Number(new URLSearchParams(location.search).get('y') || 0)
  if (y) requestAnimationFrame(() => window.scrollTo(0, y))
})
</script>

<template>
  <SiteSplash @enter="entered = true" />
  <SiteHero :play-intro="entered" />
  <UpcomingShows />
  <TheMusicFan />
  <ConcertVaultFeatured />
  <LatestNews />
  <OrangefieldRecords />
</template>
