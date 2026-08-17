<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { post } = useApi()
const cart = useCartStore()
const auth = useAuthStore()
const email = ref('')
const busy = ref(false)
const error = ref('')

onMounted(() => {
  cart.hydrate()
  auth.hydrate()
  if (auth.user?.email) email.value = auth.user.email
})

async function submit() {
  error.value = ''
  if (!email.value || !cart.items.length) return
  busy.value = true
  try {
    const payload = {
      email: email.value,
      provider: 'lemonsqueezy',
      locale: locale.value,
      items: cart.items.map((i) => ({
        id: i.id,
        type: i.type,
        title: i.title,
        price: i.price,
      })),
    }
    const res = await post<{ payment_url?: string; order_id?: string }>(
      '/api/orders/checkout/',
      payload,
      auth.authHeaders(),
    )
    if (res.payment_url) {
      window.location.href = res.payment_url
      return
    }
    await navigateTo(localePath(`/success${res.order_id ? `?order_id=${res.order_id}` : ''}`))
  } catch {
    error.value = t('checkout.fail')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="pm-page">
    <h1 class="pm-page__title">{{ t('checkout.title') }}</h1>
    <form class="pm-page__body profile-form" @submit.prevent="submit">
      <label class="pm-field">
        <span class="pm-field__label">{{ t('auth.email') }}</span>
        <input v-model="email" type="email" required class="freeform-input" :placeholder="t('auth.email')" autocomplete="email" />
      </label>
      <p>{{ t('cart.total') }}: {{ formatPrice(cart.total) }}</p>
      <p v-if="error">{{ error }}</p>
      <button type="submit" class="button button--solid" :disabled="busy || !cart.items.length">
        {{ t('checkout.pay') }}
      </button>
    </form>
  </div>
</template>
