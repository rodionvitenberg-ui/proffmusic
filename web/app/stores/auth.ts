import { defineStore } from 'pinia'

export type User = {
  id: number
  email: string
  first_name: string
  last_name: string
  avatar: string | null
}

const TOKEN = 'accessToken'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: '' as string,
    ready: false,
  }),
  getters: {
    isAuthenticated: (s) => Boolean(s.token),
  },
  actions: {
    hydrate() {
      if (!import.meta.client || this.ready) return
      this.token = localStorage.getItem(TOKEN) || ''
      this.ready = true
    },
    authHeaders(): Record<string, string> {
      return this.token ? { Authorization: `Bearer ${this.token}` } : {}
    },
    async login(email: string, password: string) {
      const { post } = useApi()
      const tokens = await post<{ access: string }>('/api/auth/jwt/create/', { email, password })
      this.token = tokens.access
      if (import.meta.client) localStorage.setItem(TOKEN, this.token)
      await this.fetchMe()
    },
    async register(email: string, password: string, rePassword: string) {
      const { post } = useApi()
      await post('/api/auth/users/', {
        email,
        password,
        re_password: rePassword,
        username: email,
      })
      await this.login(email, password)
    },
    async fetchMe() {
      if (!this.token) {
        this.user = null
        return
      }
      const { get } = useApi()
      try {
        this.user = await get<User>('/api/auth/users/me/', this.authHeaders())
      } catch {
        this.logout()
      }
    },
    async uploadAvatar(file: File) {
      const { post } = useApi()
      const body = new FormData()
      body.append('avatar', file)
      this.user = await post<User>('/api/users/upload_avatar/', body, this.authHeaders())
    },
    logout() {
      this.user = null
      this.token = ''
      if (import.meta.client) localStorage.removeItem(TOKEN)
    },
  },
})
