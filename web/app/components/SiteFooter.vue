<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <footer class="site-footer">
    <p class="site-footer__watermark" aria-hidden>ProffMusic</p>
    <div class="site-footer__inner">
      <nav class="site-footer__nav" aria-label="Footer">
        <ul class="site-footer__nav-list">
          <li class="site-footer__nav-item"><NuxtLink :to="localePath('/')" class="site-footer__nav-link">{{ t('nav.home') }}</NuxtLink></li>
          <li class="site-footer__nav-item"><NuxtLink :to="localePath('/music')" class="site-footer__nav-link">{{ t('nav.music') }}</NuxtLink></li>
          <li class="site-footer__nav-item"><NuxtLink :to="localePath('/collections')" class="site-footer__nav-link">{{ t('nav.collections') }}</NuxtLink></li>
          <li class="site-footer__nav-item"><NuxtLink :to="localePath('/about')" class="site-footer__nav-link">{{ t('nav.about') }}</NuxtLink></li>
          <li class="site-footer__nav-item"><NuxtLink :to="localePath('/license')" class="site-footer__nav-link">{{ t('nav.license') }}</NuxtLink></li>
          <li class="site-footer__nav-item"><NuxtLink :to="localePath('/contacts')" class="site-footer__nav-link">{{ t('nav.contacts') }}</NuxtLink></li>
        </ul>
      </nav>
      <nav class="site-footer__legal" aria-label="Legal">
        <NuxtLink :to="localePath('/journal')" class="site-footer__nav-link">{{ t('nav.journal') }}</NuxtLink>
        <span aria-hidden="true"> · </span>
        <NuxtLink :to="localePath('/rules')" class="site-footer__nav-link">{{ t('legal.rules') }}</NuxtLink>
        <span aria-hidden="true"> · </span>
        <NuxtLink :to="localePath('/privacy')" class="site-footer__nav-link">{{ t('legal.privacy') }}</NuxtLink>
        <span aria-hidden="true"> · </span>
        <NuxtLink :to="localePath('/gdpr')" class="site-footer__nav-link">{{ t('legal.gdpr') }}</NuxtLink>
        <span aria-hidden="true"> · </span>
        <NuxtLink :to="localePath('/terms')" class="site-footer__nav-link">{{ t('legal.terms') }}</NuxtLink>
      </nav>
      <p class="site-footer__email">
        <a href="mailto:shop@proffmusic.shop">shop@proffmusic.shop</a>
      </p>
    </div>
  </footer>
</template>
