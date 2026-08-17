<script setup lang="ts">
import { useI18nArray } from '~/composables/useI18nArray'

const { t } = useI18n()
const licenseParas = useI18nArray('static.licenseParas')
</script>
<template>
  <div class="pm-page">
    <h1 class="pm-page__title">{{ t('static.licenseTitle') }}</h1>
    <p v-for="(para, i) in licenseParas" :key="i" class="pm-page__body">{{ para }}</p>
  </div>
</template>