<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

interface JournalArticle {
  slug: string
  title: string
  lead: string
  body: string[]
}

const articles = useI18nList<JournalArticle>('journal.articles')
const slug = route.params.slug as string
const article = computed(() => articles.value.find((a) => a.slug === slug))
</script>

<template>
  <div class="pm-page">
    <template v-if="article">
      <p class="pm-page__breadcrumb">
        <NuxtLink :to="localePath('/journal')" class="pm-page__back">← {{ t('journal.title') }}</NuxtLink>
      </p>
      <h1 class="pm-page__title">{{ article.title }}</h1>
      <p class="pm-page__lead">{{ article.lead }}</p>
      <p v-for="(para, i) in article.body" :key="i" class="pm-page__body">{{ para }}</p>
      <p class="pm-page__body pm-page__body--byline">— {{ t('journal.byline') }}</p>
    </template>
    <template v-else>
      <h1 class="pm-page__title">{{ t('collections.missing') }}</h1>
      <p class="pm-page__body">
        <NuxtLink :to="localePath('/journal')" class="pm-page__back">← {{ t('journal.title') }}</NuxtLink>
      </p>
    </template>
  </div>
</template>

<style scoped>
.pm-page__breadcrumb {
  margin: 0 0 1.5rem;
}

.pm-page__back {
  color: #a78bfa;
  text-decoration: none;
  font-weight: 600;
}

.pm-page__back:hover {
  text-decoration: underline;
}

.pm-page__lead {
  margin: 0 0 1.5rem;
  font-size: 1.2rem;
  line-height: 1.7;
  opacity: 0.85;
}

.pm-page__body--byline {
  margin-top: 2.5rem;
  font-style: italic;
  opacity: 0.7;
}
</style>