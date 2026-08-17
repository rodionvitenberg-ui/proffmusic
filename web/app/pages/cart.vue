<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { coverSrc } = useApi()
const cart = useCartStore()

onMounted(() => cart.hydrate())
</script>

<template>
  <div class="cat">
    <div class="cat__head">
      <h1 class="cat__title">{{ t('nav.cart') }}</h1>
    </div>
    <p v-if="!cart.items.length" class="cat-empty">{{ t('cart.empty') }}</p>
    <ul v-else class="cart-list">
      <li v-for="item in cart.items" :key="item.cartId" class="cart-list__item">
        <img v-if="coverSrc(item.image)" :src="coverSrc(item.image)" :alt="item.title" width="64" height="64" />
        <div>
          <p class="cat-card__name">{{ item.title }}</p>
          <p class="cat-card__price">{{ formatPrice(item.price) }}</p>
        </div>
        <button type="button" class="cat-filters__clear" @click="cart.remove(item.id, item.type)">{{ t('cart.remove') }}</button>
      </li>
    </ul>
    <p v-if="cart.items.length" class="cart-foot">
      <span class="cat-card__price">{{ t('cart.total') }}: {{ formatPrice(cart.total) }}</span>
      <NuxtLink :to="localePath('/checkout')" class="button button--solid">{{ t('cart.checkout') }}</NuxtLink>
    </p>
  </div>
</template>
