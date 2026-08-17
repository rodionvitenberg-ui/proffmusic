<script setup lang="ts">
import { useI18nArray } from '~/composables/useI18nArray'

const { t } = useI18n()
const termsParas = useI18nArray('legal.termsParas')
</script>
<template>
  <div class="pm-page">
    <h1 class="pm-page__title">{{ t('legal.termsTitle') }}</h1>
    <p v-for="(para, i) in termsParas" :key="i" class="pm-page__body">{{ para }}</p>
  </div>
</template>