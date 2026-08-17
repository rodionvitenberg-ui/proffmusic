<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import gsap from 'gsap'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()
const cart = useCartStore()
const auth = useAuthStore()
const navOpen = ref(false)
const navEl = ref<HTMLElement | null>(null)

const bar = [
  { to: '/music', key: 'nav.music' },
  { to: '/collections', key: 'nav.collections' },
  { to: '/about', key: 'nav.about' },
]

const menu = [
  { to: '/music', key: 'nav.music' },
  { to: '/collections', key: 'nav.collections' },
  { to: '/journal', key: 'nav.journal' },
  { to: '/about', key: 'nav.about' },
  { to: '/license', key: 'nav.license' },
]

function isActive(to: string) {
  const path = route.path.replace(/^\/(ru|en)/, '') || '/'
  return to === '/' ? path === '/' : path.startsWith(to)
}

watch(navOpen, async (open) => {
  await nextTick()
  const root = navEl.value
  if (!root) return
  const panel = root.querySelector<HTMLElement>('.site-nav__panel--left')
  const items = root.querySelectorAll('.site-nav__item, .site-nav__secondary')
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.set(root, { autoAlpha: open ? 1 : 0, visibility: open ? 'visible' : 'hidden' })
    gsap.set(panel, { x: open ? '0%' : '-100%' })
    gsap.set(items, { autoAlpha: 1, y: 0 })
    document.body.classList.toggle('site-header--nav-open', open)
    return
  }
  if (open) {
    gsap.set(root, { autoAlpha: 1, visibility: 'visible' })
    gsap.set(panel, { x: '-100%' })
    gsap.set(items, { autoAlpha: 0, y: 16 })
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.to(panel, { x: '0%', duration: 0.5 }, 0)
    tl.to(items, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.05 }, 0.15)
  } else {
    gsap.to(panel, {
      x: '-100%',
      duration: 0.35,
      ease: 'power3.in',
      onComplete: () => gsap.set(root, { autoAlpha: 0, visibility: 'hidden' }),
    })
  }
  document.body.classList.toggle('site-header--nav-open', open)
})

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') navOpen.value = false
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <header class="site-header" :class="{ 'site-header--nav-open': navOpen }" role="banner">
    <div class="site-header__bar">
      <div class="site-header__left">
        <button
          class="site-header__toggle"
          type="button"
          :aria-expanded="navOpen"
          aria-controls="site-nav"
          :aria-label="navOpen ? t('nav.closeMenu') : t('nav.openMenu')"
          @click="navOpen = !navOpen"
        >
          <span class="site-header__toggle-icon" aria-hidden>
            <span /><span /><span />
          </span>
        </button>
        <nav class="site-header__bar-nav" aria-label="Primary">
          <ul class="site-header__bar-nav-list">
            <li v-for="link in bar" :key="link.to">
              <NuxtLink
                :to="localePath(link.to)"
                class="site-header__bar-nav-link"
                :class="{ 'site-header__bar-nav-link--active': isActive(link.to) }"
              >
                {{ t(link.key) }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>

      <NuxtLink :to="localePath('/')" class="site-header__wordmark" aria-label="ProffMusic">ProffMusic</NuxtLink>

      <div class="site-header__right">
        <div class="site-header__account">
          <template v-if="auth.isAuthenticated">
            <NuxtLink :to="localePath('/profile')" class="site-header__bar-nav-link">{{ t('nav.profile') }}</NuxtLink>
            <button type="button" class="site-header__bar-nav-link" @click="auth.logout(); navigateTo(localePath('/'))">
              {{ t('nav.signOut') }}
            </button>
          </template>
          <NuxtLink v-else :to="localePath('/login')" class="site-header__bar-nav-link">{{ t('nav.signIn') }}</NuxtLink>
        </div>
        <NuxtLink :to="localePath('/cart')" class="site-header__bar-nav-link site-header__cart" :aria-label="t('nav.cart')">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span v-if="cart.count" class="site-header__cart-count" aria-hidden="true">{{ cart.count }}</span>
        </NuxtLink>
        <div class="site-header__locale">
          <NuxtLink :to="switchLocalePath('ru')" class="site-header__bar-nav-link" :class="{ 'site-header__bar-nav-link--active': locale === 'ru' }">RU</NuxtLink>
          <NuxtLink :to="switchLocalePath('en')" class="site-header__bar-nav-link" :class="{ 'site-header__bar-nav-link--active': locale === 'en' }">EN</NuxtLink>
        </div>
        <NuxtLink :to="localePath('/contacts')" class="button site-header__subscribe">{{ t('nav.contacts') }}</NuxtLink>
      </div>
    </div>

    <div
      ref="navEl"
      class="site-nav"
      id="site-nav"
      :aria-hidden="!navOpen"
      role="dialog"
      aria-modal="true"
      style="visibility: hidden"
    >
      <div class="site-nav__panel site-nav__panel--left">
        <button class="site-nav__close" type="button" :aria-label="t('nav.closeMenu')" @click="navOpen = false">
          <svg xmlns="http://www.w3.org/2000/svg" width="29" height="29" viewBox="0 0 29 29" fill="none" aria-hidden>
            <path d="M2.1875 28.4375L0 26.25L12.0312 14.2188L0 2.1875L2.1875 0L14.2187 12.0312L26.25 0L28.4375 2.1875L16.4063 14.2188L28.4375 26.25L26.25 28.4375L14.2187 16.4062L2.1875 28.4375Z" fill="#0F0F0F" />
          </svg>
        </button>
        <nav class="site-nav__main">
          <ul class="site-nav__list">
            <li v-for="link in menu" :key="link.to" class="site-nav__item">
              <NuxtLink :to="localePath(link.to)" class="site-nav__link" @click="navOpen = false">{{ t(link.key) }}</NuxtLink>
            </li>
          </ul>
        </nav>
        <div class="site-nav__secondary">
          <ul class="site-nav__sub-list">
            <li><NuxtLink :to="localePath('/contacts')" class="site-nav__sub-link" @click="navOpen = false">{{ t('nav.contacts') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/cart')" class="site-nav__sub-link" @click="navOpen = false">{{ t('nav.cart') }}</NuxtLink></li>
            <li v-if="auth.isAuthenticated">
              <NuxtLink :to="localePath('/profile')" class="site-nav__sub-link" @click="navOpen = false">{{ t('nav.profile') }}</NuxtLink>
            </li>
            <li v-if="auth.isAuthenticated">
              <button type="button" class="site-nav__sub-link" @click="auth.logout(); navOpen = false; navigateTo(localePath('/'))">{{ t('nav.signOut') }}</button>
            </li>
            <li v-else>
              <NuxtLink :to="localePath('/login')" class="site-nav__sub-link" @click="navOpen = false">{{ t('nav.signIn') }}</NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>
