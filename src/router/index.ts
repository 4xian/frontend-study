/* 路由：按学习目的组织模块总览与五级内容详情。 */
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

/**
 * 为学习目的创建相互独立的目录与五级条目路由。
 */
function createPurposeRoute(purpose: 'learn' | 'reference' | 'projects'): RouteRecordRaw {
  const overviewRoute: RouteRecordRaw[] =
    purpose === 'learn'
      ? [
          {
            path: ':ecosystem/:module',
            name: 'learn-overview',
            component: () => import('@/pages/LearningOverviewPage.vue'),
          },
        ]
      : purpose === 'reference'
        ? [
            {
              path: ':ecosystem/:module',
              name: 'reference-overview',
              component: () => import('@/pages/ReferenceOverviewPage.vue'),
            },
          ]
        : []

  return {
    path: `/${purpose}`,
    component: () => import('@/layouts/ContentShell.vue'),
    children: [
      {
        path: '',
        name: `${purpose}-purpose`,
        component: () => import('@/pages/PurposePage.vue'),
        props: { purpose },
      },
      ...overviewRoute,
      {
        path: ':ecosystem/:module/:collection/:entry',
        name: `${purpose}-entry`,
        component: () => import('@/pages/ContentEntryPage.vue'),
        props: { purpose },
      },
    ],
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/ContentShell.vue'),
      children: [{ path: '', name: 'home', component: () => import('@/pages/HomePage.vue') }],
    },
    createPurposeRoute('learn'),
    createPurposeRoute('reference'),
    createPurposeRoute('projects'),
  ],
  // 路由切换滚动回顶部；hash 锚点由内容页在异步加载后自行定位。
  scrollBehavior(to) {
    if (to.hash) return false
    return { top: 0 }
  },
})

export default router
