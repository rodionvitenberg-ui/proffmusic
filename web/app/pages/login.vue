<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const auth = useAuthStore()
const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

onMounted(() => {
  auth.hydrate()
  if (auth.isAuthenticated) navigateTo(localePath('/profile'))
})

async function submit() {
  error.value = ''
  busy.value = true
  try {
    await auth.login(email.value, password.value)
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
    <h1 class="pm-page__title">{{ t('nav.signIn') }}</h1>
    <form class="pm-page__body profile-form" @submit.prevent="submit">
      <label class="pm-field">
        <span class="pm-field__label">{{ t('auth.email') }}</span>
        <input v-model="email" type="email" required class="freeform-input profile-form__input" :placeholder="t('auth.email')" autocomplete="email" />
      </label>
      <label class="pm-field">
        <span class="pm-field__label">{{ t('auth.password') }}</span>
        <input v-model="password" type="password" required class="freeform-input profile-form__input" :placeholder="t('auth.password')" autocomplete="current-password" />
      </label>
      <p v-if="error">{{ error }}</p>
      <button type="submit" class="button button--solid" :disabled="busy">{{ t('nav.signIn') }}</button>
      <NuxtLink :to="localePath('/register')" class="site-header__bar-nav-link">{{ t('auth.toRegister') }}</NuxtLink>
    </form>
  </div>
</template>
