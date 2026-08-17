import { defineStore } from 'pinia'
import type { CartItem, Collection, Track } from '~/types/catalog'

const KEY = 'pm-cart'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    ready: false,
  }),
  getters: {
    count: (s) => s.items.length,
    total: (s) => s.items.reduce((sum, i) => sum + Number(i.price), 0),
  },
  actions: {
    hydrate() {
      if (!import.meta.client || this.ready) return
      try {
        const raw = localStorage.getItem(KEY)
        if (raw) this.items = JSON.parse(raw)
      } catch { /* empty */ }
      this.ready = true
    },
    persist() {
      if (!import.meta.client) return
      localStorage.setItem(KEY, JSON.stringify(this.items))
    },
    isInCart(id: number, type: CartItem['type']) {
      return this.items.some((i) => i.id === id && i.type === type)
    },
    add(item: Track | Collection, type: CartItem['type']) {
      if (this.isInCart(item.id, type)) return
      this.items.push({
        id: item.id,
        type,
        title: item.title,
        price: Number(item.price),
        image: item.cover_image,
        slug: item.slug,
        cartId: `${type}-${item.id}`,
      })
      this.persist()
    },
    remove(id: number, type: CartItem['type']) {
      this.items = this.items.filter((i) => !(i.id === id && i.type === type))
      this.persist()
    },
    clear() {
      this.items = []
      this.persist()
    },
  },
})
