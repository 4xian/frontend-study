import type { DemoAssetManifest } from '@/common/content/demo-registry'

export const vueRouterDemoAssets: DemoAssetManifest[] = [
  {
    id: 'vue.router.learn.basics.setup-first-router.first-router-lab-demo',
    loadComponent: () => import('./demos/setup-first-router/first-router-lab-demo.vue'),
    loadSource: async () =>
      (await import('./demos/setup-first-router/first-router-lab-demo.vue?raw')).default,
  },
  {
    id: 'vue.router.learn.basics.router-link-view-active.router-link-view-active-lab-demo',
    loadComponent: () =>
      import('./demos/router-link-view-active/router-link-view-active-lab-demo.vue'),
    loadSource: async () =>
      (await import('./demos/router-link-view-active/router-link-view-active-lab-demo.vue?raw'))
        .default,
  },
  {
    id: 'vue.router.learn.basics.route-params-query-matching.route-matching-lab-demo',
    loadComponent: () => import('./demos/route-params-query-matching/route-matching-lab-demo.vue'),
    loadSource: async () =>
      (await import('./demos/route-params-query-matching/route-matching-lab-demo.vue?raw')).default,
  },
  {
    id: 'vue.router.learn.basics.nested-routes.nested-routes-lab-demo',
    loadComponent: () => import('./demos/nested-routes/nested-routes-lab-demo.vue'),
    loadSource: async () =>
      (await import('./demos/nested-routes/nested-routes-lab-demo.vue?raw')).default,
  },
  {
    id: 'vue.router.learn.basics.composition-programmatic-navigation.composition-navigation-lab-demo',
    loadComponent: () =>
      import('./demos/composition-programmatic-navigation/composition-navigation-lab-demo.vue'),
    loadSource: async () =>
      (
        await import('./demos/composition-programmatic-navigation/composition-navigation-lab-demo.vue?raw')
      ).default,
  },
  {
    id: 'vue.router.learn.intermediate.named-routes-redirects-aliases.named-routes-redirects-aliases-lab-demo',
    loadComponent: () =>
      import('./demos/named-routes-redirects-aliases/named-routes-redirects-aliases-lab-demo.vue'),
    loadSource: async () =>
      (
        await import('./demos/named-routes-redirects-aliases/named-routes-redirects-aliases-lab-demo.vue?raw')
      ).default,
  },
  {
    id: 'vue.router.learn.intermediate.named-views-route-props.named-views-route-props-lab-demo',
    loadComponent: () =>
      import('./demos/named-views-route-props/named-views-route-props-lab-demo.vue'),
    loadSource: async () =>
      (await import('./demos/named-views-route-props/named-views-route-props-lab-demo.vue?raw'))
        .default,
  },
  {
    id: 'vue.router.learn.intermediate.meta-navigation-guards.meta-navigation-guards-lab-demo',
    loadComponent: () =>
      import('./demos/meta-navigation-guards/meta-navigation-guards-lab-demo.vue'),
    loadSource: async () =>
      (await import('./demos/meta-navigation-guards/meta-navigation-guards-lab-demo.vue?raw'))
        .default,
  },
  {
    id: 'vue.router.learn.intermediate.route-data-fetching.route-data-fetching-lab-demo',
    loadComponent: () => import('./demos/route-data-fetching/route-data-fetching-lab-demo.vue'),
    loadSource: async () =>
      (await import('./demos/route-data-fetching/route-data-fetching-lab-demo.vue?raw')).default,
  },
  {
    id: 'vue.router.learn.intermediate.lazy-loading.lazy-loading-lab-demo',
    loadComponent: () => import('./demos/lazy-loading/lazy-loading-lab-demo.vue'),
    loadSource: async () =>
      (await import('./demos/lazy-loading/lazy-loading-lab-demo.vue?raw')).default,
  },
  {
    id: 'vue.router.learn.advanced.navigation-failures.navigation-failures-lab-demo',
    loadComponent: () => import('./demos/navigation-failures/navigation-failures-lab-demo.vue'),
    loadSource: async () =>
      (await import('./demos/navigation-failures/navigation-failures-lab-demo.vue?raw')).default,
  },
  {
    id: 'vue.router.learn.advanced.router-view-slots-transitions.router-view-transitions-lab-demo',
    loadComponent: () =>
      import('./demos/router-view-slots-transitions/router-view-transitions-lab-demo.vue'),
    loadSource: async () =>
      (
        await import('./demos/router-view-slots-transitions/router-view-transitions-lab-demo.vue?raw')
      ).default,
  },
  {
    id: 'vue.router.learn.advanced.scroll-history-deployment.scroll-history-deployment-lab-demo',
    loadComponent: () =>
      import('./demos/scroll-history-deployment/scroll-history-deployment-lab-demo.vue'),
    loadSource: async () =>
      (await import('./demos/scroll-history-deployment/scroll-history-deployment-lab-demo.vue?raw'))
        .default,
  },
  {
    id: 'vue.router.learn.advanced.dynamic-routing-router-link.dynamic-routing-router-link-lab-demo',
    loadComponent: () =>
      import('./demos/dynamic-routing-router-link/dynamic-routing-router-link-lab-demo.vue'),
    loadSource: async () =>
      (
        await import('./demos/dynamic-routing-router-link/dynamic-routing-router-link-lab-demo.vue?raw')
      ).default,
  },
]
