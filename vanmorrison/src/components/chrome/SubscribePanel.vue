<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useUiStore } from '../../stores/ui'
import { animateSubscribe } from '../../motion/header'

const ui = useUiStore()
const { subscribeOpen } = storeToRefs(ui)
const root = ref<HTMLElement | null>(null)
const sent = ref(false)

watch(subscribeOpen, async (open) => {
  await nextTick()
  if (root.value) animateSubscribe(open, root.value)
  if (open) sent.value = false
})

function onSubmit(event: Event) {
  event.preventDefault()
  sent.value = true
}
</script>

<template>
  <div
    ref="root"
    class="subscribe-panel"
    id="subscribe-panel"
    :aria-hidden="subscribeOpen ? 'false' : 'true'"
    role="dialog"
    aria-modal="true"
    aria-label="Subscribe to Van Morrison mailing list"
    :style="{ visibility: 'hidden' }"
  >
    <div class="subscribe-panel__backdrop" aria-hidden="true" @click="ui.closeSubscribe()"></div>
    <div class="subscribe-panel__drawer">
      <button class="subscribe-panel__close" type="button" aria-label="Close subscribe panel" @click="ui.closeSubscribe()">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 29 29" fill="none" aria-hidden="true">
          <path d="M2.1875 28.4375L0 26.25L12.0312 14.2188L0 2.1875L2.1875 0L14.2187 12.0312L26.25 0L28.4375 2.1875L16.4063 14.2188L28.4375 26.25L26.25 28.4375L14.2187 16.4062L2.1875 28.4375Z" fill="currentColor" />
        </svg>
      </button>
      <h2 class="subscribe-panel__heading">Join our Community</h2>
      <p class="subscribe-panel__intro">Sign up to receive exclusive updates on Van’s music, tours and latest news.</p>
      <div class="subscribe-panel__form">
        <form class="freeform-form default-form" novalidate @submit="onSubmit">
          <div class="freeform-row">
            <div class="freeform-column-6 freeform-fieldtype-text freeform-column">
              <label class="sr-only freeform-label freeform-required" for="sub-first">First Name</label>
              <input id="sub-first" class="freeform-input freeform-required" name="firstName" placeholder="First Name*" required />
            </div>
            <div class="freeform-column-6 freeform-fieldtype-text freeform-column">
              <label class="sr-only freeform-label freeform-required" for="sub-last">Last Name</label>
              <input id="sub-last" class="freeform-input freeform-required" name="lastName" placeholder="Last Name*" required />
            </div>
          </div>
          <div class="freeform-row">
            <div class="freeform-column-12 freeform-fieldtype-email freeform-column">
              <label class="sr-only freeform-label freeform-required" for="sub-email">Email</label>
              <input id="sub-email" type="email" class="freeform-input freeform-required" name="email" placeholder="Email*" required />
            </div>
          </div>
          <div class="freeform-button-container">
            <button type="submit" class="button button--solid">{{ sent ? 'Thanks' : 'Sign Up' }}</button>
          </div>
          <div class="freeform-row">
            <div class="freeform-column-12 freeform-fieldtype-checkbox freeform-column">
              <label class="top-label freeform-label freeform-required">
                <input type="checkbox" class="freeform-input freeform-required" required />
                <span class="freeform-checkbox-label">
                  I agree to be contacted by email for marketing purposes from vanmorrison.com. For further information see our
                  <a href="https://vanmorrison.com/privacy-policy">Privacy Policy</a>
                </span>
              </label>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
