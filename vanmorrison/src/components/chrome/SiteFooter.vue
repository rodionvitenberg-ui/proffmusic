<script setup lang="ts">
import { RouterLink } from 'vue-router'
import StreamIcons from '../icons/StreamIcons.vue'
import { ref } from 'vue'
import { useUiStore } from '../../stores/ui'

const ui = useUiStore()
const sent = ref(false)

function onSubmit(event: Event) {
  event.preventDefault()
  sent.value = true
}
</script>

<template>
  <section class="site-footer__prefooter">
    <div class="site-footer__prefooter-images">
      <div class="site-footer__prefooter-cluster site-footer__prefooter-cluster--left">
        <img src="/images/footer/vm-footer-1.webp" alt="Van Morrison performing songs with his band" class="site-footer__prefooter-image site-footer__prefooter-image--1" loading="lazy" />
        <img src="/images/footer/vm-footer-2.webp" alt="Van Morrison performing songs with band on stage" class="site-footer__prefooter-image site-footer__prefooter-image--2" loading="lazy" />
      </div>
      <img src="/images/footer/vm-footer-3.webp" alt="Van Morrison performing songs live with band" class="site-footer__prefooter-image site-footer__prefooter-image--3" loading="lazy" />
      <img src="/images/footer/vm-footer-4.webp" alt="Van Morrison performing songs with band members" class="site-footer__prefooter-image site-footer__prefooter-image--4" loading="lazy" />
      <img src="/images/footer/vm-footer-5.webp" alt="Van Morrison performing songs with his live band" class="site-footer__prefooter-image site-footer__prefooter-image--5" loading="lazy" />
      <img src="/images/footer/vm-footer-6.webp" alt="Van Morrison performing songs with band" class="site-footer__prefooter-image site-footer__prefooter-image--6" loading="lazy" />
      <div class="site-footer__prefooter-cluster site-footer__prefooter-cluster--right">
        <img src="/images/footer/vm-footer-7.webp" alt="Van Morrison performing songs with band on stage" class="site-footer__prefooter-image site-footer__prefooter-image--7" loading="lazy" />
        <img src="/images/footer/vm-footer-8.webp" alt="Van Morrison performing songs live with band" class="site-footer__prefooter-image site-footer__prefooter-image--8" loading="lazy" />
      </div>
    </div>

    <div class="container-1680">
      <div class="form-wrapper">
        <header>
          <h2>Join our Community</h2>
          <p>Sign up to receive exclusive updates on Van’s music, tours and latest news.</p>
        </header>
        <form class="freeform-form default-form" novalidate @submit="onSubmit">
          <div class="freeform-row">
            <div class="freeform-column-6 freeform-fieldtype-text freeform-column">
              <label class="sr-only" for="footer-first">First Name</label>
              <input id="footer-first" class="freeform-input freeform-required" placeholder="First Name*" required />
            </div>
            <div class="freeform-column-6 freeform-fieldtype-text freeform-column">
              <label class="sr-only" for="footer-last">Last Name</label>
              <input id="footer-last" class="freeform-input freeform-required" placeholder="Last Name*" required />
            </div>
          </div>
          <div class="freeform-row">
            <div class="freeform-column-12 freeform-fieldtype-email freeform-column">
              <label class="sr-only" for="footer-email">Email</label>
              <input id="footer-email" type="email" class="freeform-input freeform-required" placeholder="Email*" required />
            </div>
          </div>
          <div class="freeform-button-container">
            <button type="submit" class="button button--white">{{ sent ? 'Thanks' : 'Sign Up' }}</button>
          </div>
        </form>
      </div>
    </div>
  </section>

  <footer class="site-footer" aria-label="Site footer">
    <p class="site-footer__watermark" aria-hidden="true">Van Morrison</p>
    <div class="site-footer__inner">
      <nav class="site-footer__nav" aria-label="Footer navigation">
        <ul class="site-footer__nav-list">
          <li class="site-footer__nav-item"><RouterLink to="/" class="site-footer__nav-link">Home</RouterLink></li>
          <li class="site-footer__nav-item"><a href="https://vanmorrison.com/live" class="site-footer__nav-link">Shows</a></li>
          <li class="site-footer__nav-item"><RouterLink to="/music" class="site-footer__nav-link">Music</RouterLink></li>
          <li class="site-footer__nav-item"><RouterLink to="/news" class="site-footer__nav-link">News</RouterLink></li>
          <li class="site-footer__nav-item"><a href="https://vanmorrison.com/concert-vault" class="site-footer__nav-link">Concert Vault</a></li>
          <li class="site-footer__nav-item"><a href="https://vanmorrison.com/orangefield-records" class="site-footer__nav-link">Orangefield Records</a></li>
          <li class="site-footer__nav-item"><a href="https://vanmorrison.com/fans" class="site-footer__nav-link">Fans</a></li>
          <li class="site-footer__nav-item"><a href="https://vanmorrison.com/about" class="site-footer__nav-link">About</a></li>
          <li class="site-footer__nav-item"><a href="https://vanmorrison.com/store" class="site-footer__nav-link">Store</a></li>
        </ul>
      </nav>
      <ul class="site-footer__socials" aria-label="Follow Van Morrison on social media">
        <li>
          <a href="https://open.spotify.com/artist/44NX2ffIYHr6D4n7RaZF7A" class="site-footer__social-link" target="_blank" rel="noopener noreferrer" aria-label="Van Morrison on Spotify"><StreamIcons name="spotify" /></a>
        </li>
        <li>
          <a href="https://music.apple.com/gb/artist/van-morrison/253638" class="site-footer__social-link" target="_blank" rel="noopener noreferrer" aria-label="Van Morrison on Apple Music"><StreamIcons name="apple" /></a>
        </li>
        <li>
          <a href="https://music.amazon.co.uk/artists/B001E2ZA5I" class="site-footer__social-link" target="_blank" rel="noopener noreferrer" aria-label="Van Morrison on Amazon Music"><StreamIcons name="amazon" /></a>
        </li>
        <li>
          <a href="https://www.youtube.com/channel/UCEaleBSrSBDmm3VFKgpDsgA" class="site-footer__social-link" target="_blank" rel="noopener noreferrer" aria-label="Van Morrison on YouTube"><StreamIcons name="youtube" /></a>
        </li>
      </ul>
      <p class="site-footer__legal">
        <button type="button" class="site-footer__legal-link" @click="ui.openSubscribe()">Subscribe</button>
        ·
        <a href="https://vanmorrison.com/privacy-policy" class="site-footer__legal-link">Privacy Policy</a>
      </p>
    </div>
  </footer>
</template>
