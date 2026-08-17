<script setup lang="ts">
import type { Track } from '~/types/catalog'

defineProps<{
  title: string
  tracks: Track[]
  moreHref: string
  moreLabel: string
}>()
</script>

<template>
  <section v-if="tracks.length" class="home-rail">
    <div class="home-rail__head">
      <h2 class="home-rail__title">{{ title }}</h2>
      <NuxtLink :to="moreHref" class="site-header__bar-nav-link">{{ moreLabel }}</NuxtLink>
    </div>
    <div class="cat-grid">
      <CatalogTrackCard v-for="track in tracks" :key="track.id" :track="track" :playlist="tracks" />
    </div>
  </section>
</template>
