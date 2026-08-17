<script setup lang="ts">
import type { Category, Tag } from '~/types/catalog'

const { list } = useApi()
const { locale } = useI18n()
const route = useRoute()
const router = useRouter()

const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])

const activeCategory = computed(() => String(route.query.category__slug || ''))
const activeTags = computed(() =>
  String(route.query.tags__slug || '')
    .split(',')
    .filter(Boolean),
)

async function loadFacets() {
  const [nextCategories, nextTags] = await Promise.all([
    list<Category>('/api/categories/'),
    list<Tag>('/api/tags/'),
  ])
  categories.value = nextCategories
  tags.value = nextTags
}

onMounted(loadFacets)
watch(locale, loadFacets)

function byType(type: string) {
  return tags.value.filter((t) => t.tag_type === type)
}

function setCategory(slug: string) {
  const q = { ...route.query } as Record<string, string>
  if (!slug || q.category__slug === slug) delete q.category__slug
  else q.category__slug = slug
  delete q.page
  router.push({ query: q })
}

function toggleTag(slug: string) {
  const next = new Set(activeTags.value)
  if (next.has(slug)) next.delete(slug)
  else next.add(slug)
  const q = { ...route.query } as Record<string, string>
  if (next.size) q.tags__slug = Array.from(next).join(',')
  else delete q.tags__slug
  delete q.page
  router.push({ query: q })
}

function clear() {
  router.push({ query: {} })
}

const { t } = useI18n()

const toggle = ref(false)
const closedGroups = ref<Set<string>>(new Set())

function isClosed(key: string) {
  return closedGroups.value.has(key)
}

function toggleGroup(key: string) {
  const next = new Set(closedGroups.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  closedGroups.value = next
}
</script>

<template>
  <aside class="cat-filters">
    <button type="button" class="cat-filters__toggle" :aria-expanded="toggle" @click="toggle = !toggle">
      {{ t('filters.toggle') }}
    </button>
    <div class="cat-filters__body" :class="{ 'is-open': toggle }">
    <div class="cat-filters__group">
      <button
        type="button"
        class="cat-filters__head"
        :aria-expanded="!isClosed('category')"
        @click="toggleGroup('category')"
      >
        <span class="cat-filters__label">{{ t('filters.category') }}</span>
        <span class="cat-filters__chev" aria-hidden="true">{{ isClosed('category') ? '+' : '−' }}</span>
      </button>
      <div v-show="!isClosed('category')" class="cat-filters__opts">
        <button
          v-for="c in categories"
          :key="c.id"
          type="button"
          class="cat-filters__opt"
          :class="{ 'is-on': activeCategory === c.slug }"
          @click="setCategory(c.slug)"
        >
          {{ c.name }}
        </button>
      </div>
    </div>
    <div v-for="type in ['mood', 'instrument', 'usage']" :key="type" class="cat-filters__group">
      <button
        type="button"
        class="cat-filters__head"
        :aria-expanded="!isClosed(type)"
        @click="toggleGroup(type)"
      >
        <span class="cat-filters__label">{{ t(`filters.${type}`) }}</span>
        <span class="cat-filters__chev" aria-hidden="true">{{ isClosed(type) ? '+' : '−' }}</span>
      </button>
      <div v-show="!isClosed(type)" class="cat-filters__opts">
        <button
          v-for="tag in byType(type)"
          :key="tag.id"
          type="button"
          class="cat-filters__opt"
          :class="{ 'is-on': activeTags.includes(tag.slug) }"
          @click="toggleTag(tag.slug)"
        >
          {{ tag.name }}
        </button>
      </div>
    </div>
    <button v-if="activeCategory || activeTags.length" type="button" class="cat-filters__clear" @click="clear">
      {{ t('filters.clear') }}
    </button>
    </div>
  </aside>
</template>