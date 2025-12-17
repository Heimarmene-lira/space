import { createRouter, createWebHistory } from 'vue-router'
import StarMap from '../components/StarMap.vue'
import Gallery from '../components/Gallery.vue'
import Articles from '../components/Articles.vue'

const routes = [
  { path: '/', component: StarMap },
  { path: '/gallery', component: Gallery },
  { path: '/articles', component: Articles }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
