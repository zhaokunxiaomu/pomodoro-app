import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Timer from '../views/Timer.vue'
import Stats from '../views/Stats.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/timer' },
  { path: '/timer', component: Timer },
  { path: '/stats', component: Stats },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
