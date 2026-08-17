<script setup lang="ts">
import { useI18nArray } from '~/composables/useI18nArray'

const { t } = useI18n()
const localePath = useLocalePath()
const fanParas = useI18nArray('home.fanParas')
</script>

<template>
  <section class="the-music">
    <div class="the-music__inner">
      <h2 class="the-music__title">{{ t('home.fanTitle') }}</h2>
      <div class="the-music__paras">
        <p v-for="para in fanParas" :key="para" class="the-music__para">{{ para }}</p>
      </div>
      <div class="the-music__actions">
        <NuxtLink :to="localePath('/music')" class="button button--solid">{{ t('nav.exploreMusic') }}</NuxtLink>
        <NuxtLink :to="localePath('/contacts')" class="button button--white">{{ t('home.fanCta') }}</NuxtLink>
      </div>
    </div>
  </section>
</template>
