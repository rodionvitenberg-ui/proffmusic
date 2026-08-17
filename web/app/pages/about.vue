<script setup lang="ts">
import { useI18nArray } from '~/composables/useI18nArray'

const { t } = useI18n()
const localePath = useLocalePath()
const aboutParas = useI18nArray('static.aboutParas')
</script>
<template>
  <div class="pm-page">
    <h1 class="pm-page__title">{{ t('static.aboutTitle') }}</h1>
    <p v-for="(para, i) in aboutParas" :key="i" class="pm-page__body">{{ para }}</p>
    <p class="pm-page__body pm-page__body--cta">
      <NuxtLink :to="localePath('/contacts')" class="button button--solid">{{ t('home.fanCta') }}</NuxtLink>
    </p>
  </div>
</template>