<script setup lang="ts">
import { useI18nArray } from '~/composables/useI18nArray'

const { t } = useI18n()
const gdprParas = useI18nArray('legal.gdprParas')
</script>
<template>
  <div class="pm-page">
    <h1 class="pm-page__title">{{ t('legal.gdprTitle') }}</h1>
    <p v-for="(para, i) in gdprParas" :key="i" class="pm-page__body">{{ para }}</p>
  </div>
</template>