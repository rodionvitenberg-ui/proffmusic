<script setup lang="ts">
const { t } = useI18n()
</script>
<template>
  <div class="pm-page">
    <h1 class="pm-page__title">{{ t('static.contactsTitle') }}</h1>
    <p class="pm-page__body">{{ t('static.contactsLead') }}</p>
    <p class="pm-page__body pm-page__body--email">
      <a href="mailto:shop@proffmusic.shop">shop@proffmusic.shop</a>
    </p>
    <p class="pm-page__body">{{ t('static.contactsBody') }}</p>
  </div>
</template>