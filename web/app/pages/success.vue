<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>
<template>
  <div class="pm-page">
    <h1 class="pm-page__title">{{ t('checkout.done') }}</h1>
    <p class="the-music__more">
      <NuxtLink :to="localePath('/profile')" class="button button--solid">{{ t('nav.profile') }}</NuxtLink>
      <NuxtLink :to="localePath('/music')" class="site-header__bar-nav-link">{{ t('nav.music') }}</NuxtLink>
    </p>
  </div>
</template>
