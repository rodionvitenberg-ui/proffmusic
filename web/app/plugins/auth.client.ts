export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()
  auth.hydrate()
  if (auth.token) await auth.fetchMe()
})
