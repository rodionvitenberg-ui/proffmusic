<script setup lang="ts">
function playHover(event: Event) {
  const media = (event.currentTarget as HTMLElement).querySelector<HTMLVideoElement>('video')
  if (!media) return
  if (!media.src) media.src = media.dataset.src || ''
  media.play().catch(() => {})
}

function stopHover(event: Event) {
  const media = (event.currentTarget as HTMLElement).querySelector<HTMLVideoElement>('video')
  if (!media) return
  media.pause()
  media.currentTime = 0
}
</script>

<template>
  <section class="concert-vault-featured concert-vault-featured--single js-concert-vault-listing" aria-labelledby="concert-vault-featured-title">
    <div class="concert-vault-featured__background" aria-hidden="true">
      <video
        class="concert-vault-featured__video"
        src="/media/video/vault-bg.mp4"
        poster="/media/vault-poster.webp"
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
      ></video>
    </div>
    <div class="concert-vault-featured__inner">
      <header class="concert-vault-featured__header">
        <p class="concert-vault-featured__eyebrow">EXCLUSIVE on-demand access</p>
        <h2 class="concert-vault-featured__heading" id="concert-vault-featured-title">Concert Vault</h2>
        <div class="concert-vault-featured__intro">A curated archive of exclusive, full-length filmed live concerts</div>
      </header>
      <div class="concert-vault-featured__grid">
        <article class="concert-vault-listing__card concert-vault-listing__card--large js-concert-vault-card">
          <div class="concert-vault-listing__ticket-surface">
            <a
              class="concert-vault-listing__media concert-vault-listing__media--has-video"
              href="https://vanmorrison.com/concert-vault/astral-weeks-live-at-the-hollywood-bowl"
              aria-label="View Astral Weeks: Live At The Hollywood Bowl"
              @pointerenter="playHover"
              @pointerleave="stopHover"
            >
              <video
                class="concert-vault-listing__video js-concert-vault-hover-video"
                data-src="/media/video/astral-weeks.mp4"
                muted
                loop
                playsinline
                preload="none"
              ></video>
              <img
                src="/media/astral-weeks-thumb.webp"
                alt="Astral Weeks: Live At The Hollywood Bowl"
                width="460"
                height="306"
                class="concert-vault-listing__image"
              />
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
              <a class="concert-vault-listing__button" href="https://vanmorrison.com/concert-vault/astral-weeks-live-at-the-hollywood-bowl">
                <span><span class="concert-vault-listing__button-label">Access for 7 Days - $20</span></span>
              </a>
            </div>
          </div>
        </article>
      </div>
      <p class="concert-vault-featured__more">
        <a href="https://vanmorrison.com/concert-vault" class="button button--solid">All concerts</a>
      </p>
    </div>
  </section>
</template>
