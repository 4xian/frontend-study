import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/app/layouts/ContentShell.vue'),
      children: [
        {
          path: '',
          name: 'technology-center',
          component: () => import('@/app/pages/HomePage.vue'),
        },
        {
          path: ':domain(frontend|backend|network)/:technology/:module',
          name: 'module-overview',
          component: () => import('@/app/pages/ModuleOverviewPage.vue'),
        },
        {
          path: ':domain(frontend|backend|network)/:technology/:module/:contentType(learn|reference)/:entry',
          name: 'content-entry',
          component: () => import('@/app/pages/ContentEntryPage.vue'),
        },
        {
          path: ':pathMatch(.*)*',
          name: 'not-found',
          component: () => import('@/app/pages/NotFoundPage.vue'),
        },
      ],
    },
  ],
  /** 路由切换时回到顶部；详情页锚点由正文加载完成后定位。 */
  scrollBehavior(to) {
    if (to.hash) return false
    return { top: 0 }
  },
})

export default router
