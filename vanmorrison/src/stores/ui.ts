import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const navOpen = ref(false)
  const subscribeOpen = ref(false)

  function openNav() {
    navOpen.value = true
  }

  function closeNav() {
    navOpen.value = false
  }

  function openSubscribe() {
    subscribeOpen.value = true
  }

  function closeSubscribe() {
    subscribeOpen.value = false
  }

  return { navOpen, subscribeOpen, openNav, closeNav, openSubscribe, closeSubscribe }
})
