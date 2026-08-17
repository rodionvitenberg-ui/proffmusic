import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './pages/HomePage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    {
      path: '/music',
      name: 'archive',
      component: () => import('./pages/MusicPage.vue'),
    },
    {
      path: '/music/:slug',
      name: 'entry',
      component: () => import('./pages/MusicPage.vue'),
      props: true,
    },
    {
      path: '/news',
      name: 'news',
      component: () => import('./pages/NewsPage.vue'),
    },
  ],
  scrollBehavior(to) {
    if (to.name === 'archive') return false
    return { top: 0 }
  },
})

export default router
