<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import StreamIcons from '../icons/StreamIcons.vue'
import SubscribePanel from './SubscribePanel.vue'
import { useUiStore } from '../../stores/ui'
import { animateNav } from '../../motion/header'

const ui = useUiStore()
const { navOpen } = storeToRefs(ui)
const navEl = ref<HTMLElement | null>(null)

watch(navOpen, async (open) => {
  await nextTick()
  document.body.classList.toggle('site-header--nav-open', open)
  document.documentElement.classList.toggle('nav-open', open)
  if (navEl.value) animateNav(open, navEl.value)
})

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    ui.closeNav()
    ui.closeSubscribe()
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  document.body.classList.remove('site-header--nav-open')
})
</script>

<template>
  <header class="site-header" role="banner" :class="{ 'site-header--nav-open': navOpen }">
    <div class="site-header__bar">
      <div class="site-header__left">
        <button
          class="site-header__toggle"
          type="button"
          :aria-expanded="navOpen ? 'true' : 'false'"
          aria-controls="site-nav"
          :aria-label="navOpen ? 'Close navigation' : 'Open navigation'"
          @click="navOpen ? ui.closeNav() : ui.openNav()"
        >
          <span class="site-header__toggle-icon" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        <nav class="site-header__bar-nav" aria-label="Primary navigation">
          <ul class="site-header__bar-nav-list">
            <li><a href="https://vanmorrison.com/live" class="site-header__bar-nav-link">Shows</a></li>
            <li><RouterLink to="/music" class="site-header__bar-nav-link">Music</RouterLink></li>
            <li><RouterLink to="/news" class="site-header__bar-nav-link">News</RouterLink></li>
          </ul>
        </nav>
      </div>

      <RouterLink to="/" class="site-header__wordmark" aria-label="Van Morrison — Home">Van Morrison</RouterLink>

      <div class="site-header__right">
        <ul class="site-header__bar-stream" aria-label="Streaming platforms">
          <li>
            <a href="https://open.spotify.com/artist/44NX2ffIYHr6D4n7RaZF7A" class="site-header__bar-stream-icon" aria-label="Spotify" target="_blank" rel="noopener noreferrer">
              <StreamIcons name="spotify" />
            </a>
          </li>
          <li>
            <a href="https://music.apple.com/gb/artist/van-morrison/253638" class="site-header__bar-stream-icon" aria-label="Apple Music" target="_blank" rel="noopener noreferrer">
              <StreamIcons name="apple" />
            </a>
          </li>
          <li>
            <a href="https://music.amazon.co.uk/artists/B001E2ZA5I" class="site-header__bar-stream-icon" aria-label="Amazon Music" target="_blank" rel="noopener noreferrer">
              <StreamIcons name="amazon" />
            </a>
          </li>
          <li>
            <a href="https://www.youtube.com/channel/UCEaleBSrSBDmm3VFKgpDsgA" class="site-header__bar-stream-icon" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
              <StreamIcons name="youtube" />
            </a>
          </li>
        </ul>
        <button type="button" class="button site-header__subscribe js-subscribe-open" aria-controls="subscribe-panel" @click="ui.openSubscribe()">
          Subscribe
        </button>
      </div>
    </div>

    <div
      ref="navEl"
      class="site-nav"
      id="site-nav"
      :aria-hidden="navOpen ? 'false' : 'true'"
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      :style="{ visibility: 'hidden' }"
    >
      <div class="site-nav__panel site-nav__panel--left">
        <button class="site-nav__close" type="button" aria-label="Close navigation" @click="ui.closeNav()">
          <svg xmlns="http://www.w3.org/2000/svg" width="29" height="29" viewBox="0 0 29 29" fill="none" aria-hidden="true">
            <path d="M2.1875 28.4375L0 26.25L12.0312 14.2188L0 2.1875L2.1875 0L14.2187 12.0312L26.25 0L28.4375 2.1875L16.4063 14.2188L28.4375 26.25L26.25 28.4375L14.2187 16.4062L2.1875 28.4375Z" fill="#0F0F0F" />
          </svg>
        </button>
        <nav class="site-nav__main" aria-label="Primary">
          <ul class="site-nav__list">
            <li class="site-nav__item"><a href="https://vanmorrison.com/live" class="site-nav__link">Shows</a></li>
            <li class="site-nav__item"><RouterLink to="/music" class="site-nav__link" @click="ui.closeNav()">Music</RouterLink></li>
            <li class="site-nav__item"><RouterLink to="/news" class="site-nav__link" @click="ui.closeNav()">News</RouterLink></li>
            <li class="site-nav__item"><a href="https://vanmorrison.com/fans" class="site-nav__link">Fans</a></li>
          </ul>
        </nav>
        <div class="site-nav__secondary">
          <ul class="site-nav__sub-list">
            <li><a href="https://vanmorrison.com/concert-vault" class="site-nav__sub-link">Concert Vault</a></li>
            <li><a href="https://vanmorrison.com/orangefield-records" class="site-nav__sub-link">Orangefield Records</a></li>
            <li><a href="https://vanmorrison.com/about" class="site-nav__sub-link">About</a></li>
            <li><a href="https://vanmorrison.com/store" class="site-nav__sub-link">Store</a></li>
          </ul>
          <div class="site-nav__stream">
            <p class="site-nav__stream-label">Stream on</p>
            <div class="site-nav__stream-actions">
              <ul class="site-nav__stream-icons" aria-label="Streaming platforms">
                <li>
                  <a href="https://open.spotify.com/artist/44NX2ffIYHr6D4n7RaZF7A" class="site-nav__stream-icon" aria-label="Spotify" target="_blank" rel="noopener noreferrer"><StreamIcons name="spotify" /></a>
                </li>
                <li>
                  <a href="https://music.apple.com/gb/artist/van-morrison/253638" class="site-nav__stream-icon" aria-label="Apple Music" target="_blank" rel="noopener noreferrer"><StreamIcons name="apple" /></a>
                </li>
                <li>
                  <a href="https://music.amazon.co.uk/artists/B001E2ZA5I" class="site-nav__stream-icon" aria-label="Amazon Music" target="_blank" rel="noopener noreferrer"><StreamIcons name="amazon" /></a>
                </li>
                <li>
                  <a href="https://www.youtube.com/channel/UCEaleBSrSBDmm3VFKgpDsgA" class="site-nav__stream-icon" aria-label="YouTube" target="_blank" rel="noopener noreferrer"><StreamIcons name="youtube" /></a>
                </li>
              </ul>
              <button type="button" class="button button--black js-subscribe-open" @click="ui.openSubscribe()">Subscribe</button>
            </div>
          </div>
        </div>
      </div>

      <div
        class="site-nav__panel site-nav__panel--right site-nav__panel--vault"
        :style="{ backgroundImage: 'url(/media/concert-vault-nav-bg.webp)' }"
        aria-hidden="true"
      >
        <div class="site-nav__vault">
          <h2 class="site-nav__vault-title">Unlock the<br />Concert Vault</h2>
          <div class="site-nav__vault-cards">
            <div class="site-nav__vault-card-wrap">
              <article class="concert-vault-listing__card js-concert-vault-card">
                <a
                  class="concert-vault-listing__media concert-vault-listing__media--has-video"
                  href="https://vanmorrison.com/concert-vault/astral-weeks-live-at-the-hollywood-bowl"
                  aria-label="View Astral Weeks: Live At The Hollywood Bowl"
                >
                  <img src="/media/astral-weeks-thumb.webp" alt="Astral Weeks: Live At The Hollywood Bowl" width="460" height="306" class="concert-vault-listing__image" />
                  <span class="concert-vault-listing__play" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none">
                      <circle cx="40" cy="40" r="39.5" fill="black" fill-opacity="0.7" stroke="white" />
                      <path d="M51.3203 39.6227L34.3392 27.531V51.7144L51.3203 39.6227Z" fill="white" />
                    </svg>
                  </span>
                </a>
                <div class="concert-vault-listing__content">
                  <p class="concert-vault-listing__eyebrow">Full Concert</p>
                  <h2 class="concert-vault-listing__title">
                    <a href="https://vanmorrison.com/concert-vault/astral-weeks-live-at-the-hollywood-bowl">Astral Weeks: Live At The Hollywood Bowl</a>
                  </h2>
                  <p class="concert-vault-listing__meta">Los Angeles, November 2008</p>
                </div>
                <div class="concert-vault-listing__action">
                  <a class="concert-vault-listing__button" href="https://vanmorrison.com/concert-vault">
                    <span><span class="concert-vault-listing__button-label">Access full concerts &amp; more</span></span>
                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M13.3607 9.19271L7.11068 15.4427L8.33464 16.6667L16.668 8.33333L8.33464 0L7.11068 1.22396L13.3607 7.47396H0.00130081V9.19271H13.3607Z" fill="currentColor" />
                    </svg>
                  </a>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>

    <SubscribePanel />
  </header>
</template>
