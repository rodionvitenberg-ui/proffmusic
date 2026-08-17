<script setup lang="ts">
import { formatPrice } from '~/utils/price'

type OrderRow = {
  id: string
  amount: string
  created_at: string
  items_display: string[]
}

definePageMeta({ ssr: false })

const { t } = useI18n()
const localePath = useLocalePath()
const auth = useAuthStore()
const { coverSrc, get } = useApi()
const fileInput = ref<HTMLInputElement | null>(null)
const orders = ref<OrderRow[]>([])
const loading = ref(true)

onMounted(async () => {
  auth.hydrate()
  if (!auth.token) {
    await navigateTo(localePath('/login'))
    return
  }
  if (!auth.user) await auth.fetchMe()
  if (!auth.user) {
    await navigateTo(localePath('/login'))
    return
  }
  try {
    orders.value = await get<OrderRow[]>('/api/users/orders/', auth.authHeaders())
  } catch {
    orders.value = []
  } finally {
    loading.value = false
  }
})

async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    await auth.uploadAvatar(file)
  } catch {
    alert(t('profile.uploadError'))
  }
}

function logout() {
  auth.logout()
  navigateTo(localePath('/'))
}
</script>

<template>
  <div class="cat">
    <div class="cat__head">
      <h1 class="cat__title">{{ t('profile.title') }}</h1>
    </div>
    <div v-if="auth.user" class="profile">
      <aside class="profile__card">
        <button type="button" class="profile__avatar" @click="fileInput?.click()">
          <img v-if="auth.user.avatar" :src="coverSrc(auth.user.avatar)" :alt="auth.user.email" />
          <span v-else>{{ (auth.user.email || 'U')[0].toUpperCase() }}</span>
        </button>
        <input ref="fileInput" type="file" accept="image/*" hidden @change="onFile" />
        <p class="cat-card__name">{{ auth.user.first_name || t('profile.user') }} {{ auth.user.last_name }}</p>
        <p class="profile__email">{{ auth.user.email }}</p>
        <button type="button" class="button button--solid" @click="logout">{{ t('nav.signOut') }}</button>
      </aside>
      <section>
        <h2 class="profile__orders-title">{{ t('profile.orders') }}</h2>
        <p v-if="loading" class="cat-empty">{{ t('music.loading') }}</p>
        <p v-else-if="!orders.length" class="cat-empty">{{ t('profile.noOrders') }}</p>
        <ul v-else class="profile__orders">
          <li v-for="order in orders" :key="order.id" class="profile__order">
            <div>
              <p class="profile__meta">
                {{ new Date(order.created_at).toLocaleDateString() }}
                · #{{ String(order.id).slice(0, 8) }}
              </p>
              <p v-for="(title, i) in order.items_display" :key="i" class="cat-card__name">{{ title }}</p>
            </div>
            <div class="profile__sum">
              <p class="cat-card__price">{{ formatPrice(order.amount) }}</p>
              <p class="profile__paid">{{ t('profile.paid') }}</p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
