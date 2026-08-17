<script setup lang="ts">
import type { Collection } from '~/types/catalog'

const { t } = useI18n()
const { list, coverSrc } = useApi()
const localePath = useLocalePath()
const cart = useCartStore()
const items = ref<Collection[]>([])

onMounted(async () => {
  items.value = await list<Collection>('/api/collections/?ordering=-created_at')
})

function toggleCart(col: Collection) {
  if (cart.isInCart(col.id, 'collection')) cart.remove(col.id, 'collection')
  else cart.add(col, 'collection')
}
</script>

<template>
  <div class="cat">
    <div class="cat__head">
      <h1 class="cat__title">{{ t('nav.collections') }}</h1>
    </div>
    <div v-if="items.length" class="cat-grid">
      <article
        v-for="col in items"
        :key="col.id"
        class="cat-card"
        :class="{ 'cat-card--in-cart': cart.isInCart(col.id, 'collection') }"
      >
        <div class="cat-card__cover">
          <NuxtLink :to="localePath(`/collections/${col.slug}`)" class="cat-card__link" :aria-label="col.title">
            <img v-if="coverSrc(col.cover_image)" :src="coverSrc(col.cover_image)" :alt="col.title" />
          </NuxtLink>
        </div>
        <div class="cat-card__meta">
          <NuxtLink :to="localePath(`/collections/${col.slug}`)" class="cat-card__link">
            <h3 class="cat-card__name">{{ col.title }}</h3>
          </NuxtLink>
          <div class="cat-card__row">
            <span class="cat-card__price">{{ formatPrice(col.price) }}</span>
            <button
              type="button"
              class="cat-card__cart"
              :aria-label="cart.isInCart(col.id, 'collection') ? t('cart.inCart') : t('cart.add')"
              @click="toggleCart(col)"
            >
              {{ cart.isInCart(col.id, 'collection') ? t('cart.inCart') : t('cart.add') }}
            </button>
          </div>
        </div>
      </article>
    </div>
    <p v-else class="cat-empty">{{ t('collections.empty') }}</p>
  </div>
</template>