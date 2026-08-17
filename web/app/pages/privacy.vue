<script setup lang="ts">
import { useI18nArray } from '~/composables/useI18nArray'

const { t } = useI18n()
const privacyParas = useI18nArray('legal.privacyParas')
</script>
<template>
  <div class="pm-page">
    <h1 class="pm-page__title">{{ t('legal.privacyTitle') }}</h1>
    <p v-for="(para, i) in privacyParas" :key="i" class="pm-page__body">{{ para }}</p>
  </div>
</template>