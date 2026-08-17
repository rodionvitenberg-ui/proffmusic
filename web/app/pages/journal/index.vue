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

<style scoped>
.journal-card {
  padding: 1.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.journal-card:first-of-type {
  padding-top: 0;
}

.journal-card:last-of-type {
  border-bottom: none;
}

.journal-card__title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  line-height: 1.4;
}

.journal-card__link {
  color: inherit;
  text-decoration: none;
}

.journal-card__link:hover {
  color: #a78bfa;
}

.journal-card__lead {
  margin: 0 0 0.75rem;
  opacity: 0.75;
  line-height: 1.6;
}

.journal-card__more {
  color: #a78bfa;
  text-decoration: none;
  font-weight: 600;
}

.journal-card__more:hover {
  text-decoration: underline;
}
</style>