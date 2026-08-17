<script setup lang="ts">
// Preload шрифтов в <head> ещё на SSR. Без него браузер рендерит логотип
// (Oswald) и кнопки системным fallback-шрифтом, а когда TTF догружаются —
// текст меняет ширину, и раскладка хедера «прыгает» (FOUT из-за
// font-display: swap). Preload заставляет браузер качать шрифты с приоритетом.
useHead({
  link: [
    { rel: 'preload', as: 'font', type: 'font/ttf', crossorigin: '', href: '/fonts/oswald/Oswald-Regular.ttf' },
    { rel: 'preload', as: 'font', type: 'font/ttf', crossorigin: '', href: '/fonts/oswald/Oswald-Bold.ttf' },
    { rel: 'preload', as: 'font', type: 'font/ttf', crossorigin: '', href: '/fonts/inria-serif/InriaSerif-Regular.ttf' },
    { rel: 'preload', as: 'font', type: 'font/ttf', crossorigin: '', href: '/fonts/inria-serif/InriaSerif-Bold.ttf' },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>