<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useNewsStore } from '../../stores/news'
import { newsCover, newsCoverFallback, onImgError } from '../../data/media'

const news = useNewsStore()

const pages = computed(() => {
  const total = news.totalPages
  const current = news.page
  const set = new Set([1, total, current])
  if (current > 1) set.add(current - 1)
  if (current < total) set.add(current + 1)
  const sorted = Array.from(set).sort((a, b) => a - b)
  const out: Array<number | '…'> = []
  let prev = 0
  for (const n of sorted) {
    if (n - prev > 1) out.push('…')
    out.push(n)
    prev = n
  }
  return out
})

onMounted(() => news.load())
</script>

<template>
  <div class="news-archive" :class="{ 'news-archive--loading': news.loading }">
    <Transition name="news-fade" mode="out-in">
      <div v-if="news.featured" :key="news.featured.id">
        <div
          class="news-featured"
          :class="{
            'news-featured--album': news.featured.newsType === 'albumNews',
            'news-featured--invert-text': news.featured.invertTextColour,
          }"
          :style="news.featured.backgroundColour ? { backgroundColor: news.featured.backgroundColour } : undefined"
        >
          <a class="news-featured__inner" :href="news.featured.url" :aria-label="`Read more: ${news.featured.title}`"></a>
          <div class="news-featured__layout">
            <div class="news-featured__content">
              <h2 class="news-featured__title">
                <a class="news-featured__title-link" :href="news.featured.url">{{ news.featured.featuredTitle || news.featured.title }}</a>
              </h2>
              <div v-if="news.featured.featuredPrimaryCtaUrl || news.featured.url" class="news-featured__actions">
                <a class="button button--solid" :href="news.featured.featuredPrimaryCtaUrl || news.featured.url">
                  {{ news.featured.featuredPrimaryCtaLabel || 'Read more' }}
                </a>
              </div>
            </div>
            <div class="news-featured__image-wrap">
              <img
                class="news-featured__image"
                :src="newsCover(news.featured)"
                :alt="news.featured.title"
                @error="onImgError($event, newsCoverFallback(news.featured, 'featured'))"
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <div class="news-grid">
      <div v-if="!news.pageItems.length && !news.loading" class="news-grid__empty">No news yet.</div>
      <div v-else class="news-grid__list">
        <article
          v-for="item in news.pageItems"
          :key="item.id"
          class="news-card"
          :class="{ 'news-card--album': item.newsType === 'albumNews' }"
        >
          <a class="news-card__link" :href="item.url">
            <div class="news-card__image-wrap" :style="item.backgroundColour ? { backgroundColor: item.backgroundColour } : undefined">
              <img
                v-if="item.featuredImageUrl || item.featuredImage"
                class="news-card__image"
                :src="newsCover(item)"
                :alt="item.title"
                @error="onImgError($event, newsCoverFallback(item))"
              />
              <div v-else class="news-card__image-placeholder"></div>
            </div>
            <div class="news-card__body">
              <h3 class="news-card__title">{{ item.title }}</h3>
            </div>
          </a>
        </article>
      </div>
    </div>

    <nav v-if="news.totalPages > 1" class="news-pagination" aria-label="News pages">
      <button type="button" class="news-pagination__btn" :disabled="news.page === 1" @click="news.setPage(news.page - 1)">Prev</button>
      <div class="news-pagination__pages">
        <template v-for="(p, i) in pages" :key="i">
          <span v-if="p === '…'" class="news-pagination__page news-pagination__page--ellipsis">…</span>
          <button
            v-else
            type="button"
            class="news-pagination__page"
            :class="{ 'news-pagination__page--active': p === news.page }"
            @click="news.setPage(p)"
          >
            {{ p }}
          </button>
        </template>
      </div>
      <button type="button" class="news-pagination__btn" :disabled="news.page === news.totalPages" @click="news.setPage(news.page + 1)">Next</button>
    </nav>
  </div>
</template>
