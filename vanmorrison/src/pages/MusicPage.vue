<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MusicArchive from '../components/music/MusicArchive.vue'
import MusicEntry from '../components/music/MusicEntry.vue'

const route = useRoute()
const slug = computed(() => (typeof route.params.slug === 'string' ? route.params.slug : ''))
</script>

<template>
  <div id="musicApp">
    <MusicEntry v-if="slug" :slug="slug" />
    <MusicArchive v-else />
  </div>
</template>
