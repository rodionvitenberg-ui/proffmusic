<script setup lang="ts">
import { useI18nArray } from '~/composables/useI18nArray'

const { t } = useI18n()
const rulesParas = useI18nArray('legal.rulesParas')
</script>
<template>
  <div class="pm-page">
    <h1 class="pm-page__title">{{ t('legal.rulesTitle') }}</h1>
    <p v-for="(para, i) in rulesParas" :key="i" class="pm-page__body">{{ para }}</p>
  </div>
</template>