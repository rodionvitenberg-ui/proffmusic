<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const auth = useAuthStore()
const email = ref('')
const password = ref('')
const again = ref('')
const error = ref('')
const busy = ref(false)

onMounted(() => {
  auth.hydrate()
  if (auth.isAuthenticated) navigateTo(localePath('/profile'))
})

async function submit() {
  error.value = ''
  if (password.value !== again.value) {
    error.value = t('auth.mismatch')
    return
  }
  busy.value = true
  try {
    await auth.register(email.value, password.value, again.value)
    await navigateTo(localePath('/profile'))
  } catch {
    error.value = t('auth.fail')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="pm-page">
    <h1 class="pm-page__title">{{ t('auth.register') }}</h1>
    <form class="pm-page__body profile-form" @submit.prevent="submit">
      <label class="pm-field">
        <span class="pm-field__label">{{ t('auth.email') }}</span>
        <input v-model="email" type="email" required class="freeform-input profile-form__input" :placeholder="t('auth.email')" autocomplete="email" />
      </label>
      <label class="pm-field">
        <span class="pm-field__label">{{ t('auth.password') }}</span>
        <input v-model="password" type="password" required class="freeform-input profile-form__input" :placeholder="t('auth.password')" autocomplete="new-password" />
      </label>
      <label class="pm-field">
        <span class="pm-field__label">{{ t('auth.passwordAgain') }}</span>
        <input v-model="again" type="password" required class="freeform-input profile-form__input" :placeholder="t('auth.passwordAgain')" autocomplete="new-password" />
      </label>
      <p v-if="error">{{ error }}</p>
      <button type="submit" class="button button--solid" :disabled="busy">{{ t('auth.register') }}</button>
      <NuxtLink :to="localePath('/login')" class="site-header__bar-nav-link">{{ t('nav.signIn') }}</NuxtLink>
    </form>
  </div>
</template>
