<script setup lang="ts">
const player = usePlayerStore()
const { t } = useI18n()
const { coverSrc } = useApi()
const audio = ref<HTMLAudioElement | null>(null)

watch(
  () => [player.current?.id, player.playing, player.current?.audio_file_preview] as const,
  async () => {
    await nextTick()
    const el = audio.value
    if (!el || !player.current?.audio_file_preview) return
    const src = coverSrc(player.current.audio_file_preview) || player.current.audio_file_preview
    if (el.getAttribute('src') !== src) {
      el.src = src
    }
    if (player.playing) el.play().catch(() => player.pause())
    else el.pause()
  },
)
</script>

<template>
  <div v-if="player.current" class="player-bar" role="region" :aria-label="player.current.title">
    <div class="player-bar__track">
      <img
        v-if="coverSrc(player.current.cover_image)"
        class="player-bar__cover"
        :src="coverSrc(player.current.cover_image)"
        :alt="player.current.title"
      />
      <span v-else class="player-bar__cover player-bar__cover--empty" aria-hidden />
      <p class="player-bar__title">{{ player.current.title }}</p>
      <audio ref="audio" preload="metadata" @ended="player.next()" />
    </div>
    <div class="player-bar__controls">
      <button type="button" class="player-bar__btn" :aria-label="t('player.prev')" @click="player.prev()">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M6 6h2.2v12H6V6zm3.2 6 8.8 6.2V5.8L9.2 12z" />
        </svg>
      </button>
      <button
        type="button"
        class="player-bar__btn player-bar__btn--play"
        :aria-label="player.playing ? t('player.pause') : t('player.play')"
        @click="player.toggle()"
      >
        <svg v-if="player.playing" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M7 5h3.4v14H7V5zm6.6 0H17v14h-3.4V5z" />
        </svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M8 5.2v13.6L19 12 8 5.2z" />
        </svg>
      </button>
      <button type="button" class="player-bar__btn" :aria-label="t('player.next')" @click="player.next()">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M15.8 6H18v12h-2.2V6zM6 18.2 14.8 12 6 5.8v12.4z" />
        </svg>
      </button>
      <button type="button" class="player-bar__btn player-bar__btn--close" :aria-label="t('player.close')" @click="player.close()">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M6.2 5 5 6.2 10.8 12 5 17.8 6.2 19 12 13.2 17.8 19 19 17.8 13.2 12 19 6.2 17.8 5 12 10.8 6.2 5z" />
        </svg>
      </button>
    </div>
  </div>
</template>
