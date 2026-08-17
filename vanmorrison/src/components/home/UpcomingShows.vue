<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Show } from '../../types'

const shows = ref<Show[]>([])

onMounted(async () => {
  const res = await fetch('/shows.json')
  shows.value = await res.json()
})
</script>

<template>
  <section class="upcoming-shows">
    <div class="upcoming-shows__inner">
      <h2 class="upcoming-shows__title">Upcoming Shows</h2>
      <ul class="shows__list upcoming-shows__list" role="list">
        <li v-for="show in shows" :key="show.date + show.venue" class="shows__item">
          <time class="shows__date" :datetime="show.date || undefined">
            <span class="shows__date-day">{{ show.day }}</span>
            <span class="shows__date-month">{{ show.month }}</span>
          </time>
          <div class="shows__details">
            <p class="shows__venue">{{ show.venue }}</p>
            <p class="shows__location">{{ show.location }}</p>
          </div>
          <div class="shows__action">
            <a
              v-if="show.href && !show.soldOut"
              :href="show.href"
              class="button button--solid shows__btn"
              target="_blank"
              rel="noopener noreferrer"
            >{{ show.label }}</a>
            <span v-else class="button button--solid shows__btn shows__btn--sold">Sold Out</span>
          </div>
        </li>
      </ul>
      <p class="upcoming-shows__more">
        <a href="https://vanmorrison.com/live" class="button button--solid">All Live Shows</a>
      </p>
    </div>
  </section>
</template>
