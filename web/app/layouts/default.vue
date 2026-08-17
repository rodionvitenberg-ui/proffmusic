<script setup lang="ts">
const route = useRoute()

const isHome = computed(
  () =>
    route.name === 'index' ||
    String(route.name || '').endsWith('index') ||
    route.path.replace(/^\/(ru|en)/, '') === '' ||
    route.path.match(/^\/(ru|en)\/?$/) !== null,
)

// Прописываем is-homepage на <body> ещё на сервере, чтобы хедер не «мигал»:
// без него SSR-классов нет, и при гидратации body получает theme-dark + is-homepage,
// из-за чего текст хедера переключается чёрный→белый, а разметка прыгает.
useHead({
  bodyAttrs: {
    class: computed(() => (isHome.value ? 'theme-dark is-homepage' : 'theme-dark')),
  },
})

function onScroll() {
  document.body.classList.toggle('is-scrolled', window.scrollY > 24)
}

watch(
  () => route.path,
  () => {
    if (!import.meta.client) return
    // Откладываем до следующего кадра: браузер ещё не пересчитал высоту
    // документа после смены маршрута, поэтому scrollY в этот момент может
    // быть «из прошлой жизни». rAF даёт стабильный layout и корректный
    // is-scrolled, из-за которого раньше «дёргалась» правая часть хедера.
    requestAnimationFrame(onScroll)
  },
  { immediate: true },
)

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <div>
    <SiteHeader />
    <main class="pm-main" :class="{ 'pm-main--hero': isHome }">
      <slot />
    </main>
    <SiteFooter />
    <ClientOnly>
      <PlayerBar />
    </ClientOnly>
  </div>
</template>
