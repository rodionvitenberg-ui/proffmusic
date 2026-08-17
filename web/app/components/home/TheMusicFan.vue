<script setup lang="ts">
import { useI18nArray } from '~/composables/useI18nArray'

const props = defineProps<{
  items: { title: string; href: string; cover: string }[]
}>()
const { t } = useI18n()
const localePath = useLocalePath()
const fanParas = useI18nArray('home.fanParas')
const fan = ref<HTMLElement | null>(null)

function spread(e: PointerEvent) {
  if (!fan.value || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  const cards = Array.from(fan.value.querySelectorAll<HTMLElement>('.the-music__card'))
  const rect = fan.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const mid = (cards.length - 1) / 2
  cards.forEach((card, i) => {
    const fromMid = i - mid
    card.style.transform = `translateX(calc(-50% + ${fromMid * 42 + x * 28}px)) rotate(${fromMid * 8 + x * 10}deg)`
  })
}

function reset() {
  fan.value?.querySelectorAll<HTMLElement>('.the-music__card').forEach((c) => {
    c.style.transform = ''
  })
}
</script>

<template>
  <section v-if="items.length" class="the-music">
    <div class="the-music__inner">
      <h2 class="the-music__title">{{ t('home.fanTitle') }}</h2>
      <div class="the-music__paras">
        <p v-for="para in fanParas" :key="para" class="the-music__para">{{ para }}</p>
      </div>
      <div class="the-music__actions">
        <NuxtLink :to="localePath('/music')" class="button button--solid">{{ t('nav.exploreMusic') }}</NuxtLink>
        <NuxtLink :to="localePath('/contacts')" class="button button--white">{{ t('home.fanCta') }}</NuxtLink>
      </div>
      <div
        ref="fan"
        class="the-music__fan"
        :class="`the-music__fan--count-${Math.min(items.length, 5)}`"
        @pointermove="spread"
        @pointerleave="reset"
      >
        <NuxtLink
          v-for="item in items.slice(0, 5)"
          :key="item.href"
          :to="item.href"
          class="the-music__card"
          :aria-label="item.title"
          :title="item.title"
        >
          <img v-if="item.cover" :src="item.cover" :alt="item.title" class="the-music__card-img" width="522" height="522" />
          <span class="the-music__card-label">{{ item.title }}</span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>