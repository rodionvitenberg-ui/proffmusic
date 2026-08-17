<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const articles = useI18nList<{
  slug: string
  title: string
  lead: string
}>('journal.articles')
</script>

<template>
  <div class="pm-page">
    <h1 class="pm-page__title">{{ t('journal.title') }}</h1>
    <article v-for="article in articles" :key="article.slug" class="journal-card">
      <h2 class="journal-card__title">
        <NuxtLink :to="localePath(`/journal/${article.slug}`)" class="journal-card__link">
          {{ article.title }}
        </NuxtLink>
      </h2>
      <p class="journal-card__lead">{{ article.lead }}</p>
      <NuxtLink :to="localePath(`/journal/${article.slug}`)" class="journal-card__more">
        {{ t('journal.readMore') }} →
      </NuxtLink>
    </article>
  </div>
</template>