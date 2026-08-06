import type { DemoAssetManifest } from '@/common/content/demo-registry'

export const vuePiniaDemoAssets: DemoAssetManifest[] = [
  {
    id: 'vue.pinia.learn.basics.actions-async.pinia-action-lifecycle-lab-demo',
    loadComponent: () => import('./demos/actions-async/pinia-action-lifecycle-lab-demo.vue'),
    loadSource: async () =>
      (await import('./demos/actions-async/pinia-action-lifecycle-lab-demo.vue?raw')).default,
  },
  {
    id: 'vue.pinia.learn.basics.component-store-to-refs.pinia-store-to-refs-lab-demo',
    loadComponent: () => import('./demos/component-store-to-refs/pinia-store-to-refs-lab-demo.vue'),
    loadSource: async () =>
      (await import('./demos/component-store-to-refs/pinia-store-to-refs-lab-demo.vue?raw'))
        .default,
  },
  {
    id: 'vue.pinia.learn.basics.getters.pinia-getter-dependency-lab-demo',
    loadComponent: () => import('./demos/getters/pinia-getter-dependency-lab-demo.vue'),
    loadSource: async () =>
      (await import('./demos/getters/pinia-getter-dependency-lab-demo.vue?raw')).default,
  },
  {
    id: 'vue.pinia.learn.advanced.hmr-devtools-maintenance.pinia-store-lifecycle-maintenance-lab-demo',
    loadComponent: () =>
      import('./demos/hmr-devtools-maintenance/pinia-store-lifecycle-maintenance-lab-demo.vue'),
    loadSource: async () =>
      (
        await import('./demos/hmr-devtools-maintenance/pinia-store-lifecycle-maintenance-lab-demo.vue?raw')
      ).default,
  },
  {
    id: 'vue.pinia.learn.intermediate.outside-components-router.pinia-outside-component-context-lab-demo',
    loadComponent: () =>
      import('./demos/outside-components-router/pinia-outside-component-context-lab-demo.vue'),
    loadSource: async () =>
      (
        await import('./demos/outside-components-router/pinia-outside-component-context-lab-demo.vue?raw')
      ).default,
  },
  {
    id: 'vue.pinia.learn.advanced.plugins-persistence.pinia-plugin-persistence-boundary-lab-demo',
    loadComponent: () =>
      import('./demos/plugins-persistence/pinia-plugin-persistence-boundary-lab-demo.vue'),
    loadSource: async () =>
      (
        await import('./demos/plugins-persistence/pinia-plugin-persistence-boundary-lab-demo.vue?raw')
      ).default,
  },
  {
    id: 'vue.pinia.learn.basics.setup-first-store.pinia-first-store-lab-demo',
    loadComponent: () => import('./demos/setup-first-store/pinia-first-store-lab-demo.vue'),
    loadSource: async () =>
      (await import('./demos/setup-first-store/pinia-first-store-lab-demo.vue?raw')).default,
  },
  {
    id: 'vue.pinia.learn.intermediate.setup-stores.pinia-setup-store-contract-lab-demo',
    loadComponent: () => import('./demos/setup-stores/pinia-setup-store-contract-lab-demo.vue'),
    loadSource: async () =>
      (await import('./demos/setup-stores/pinia-setup-store-contract-lab-demo.vue?raw')).default,
  },
  {
    id: 'vue.pinia.learn.advanced.ssr-hydration.pinia-ssr-hydration-model-lab-demo',
    loadComponent: () => import('./demos/ssr-hydration/pinia-ssr-hydration-model-lab-demo.vue'),
    loadSource: async () =>
      (await import('./demos/ssr-hydration/pinia-ssr-hydration-model-lab-demo.vue?raw')).default,
  },
  {
    id: 'vue.pinia.learn.basics.state-patch-reset.pinia-state-mutation-lab-demo',
    loadComponent: () => import('./demos/state-patch-reset/pinia-state-mutation-lab-demo.vue'),
    loadSource: async () =>
      (await import('./demos/state-patch-reset/pinia-state-mutation-lab-demo.vue?raw')).default,
  },
  {
    id: 'vue.pinia.learn.intermediate.store-composition.pinia-store-composition-lab-demo',
    loadComponent: () => import('./demos/store-composition/pinia-store-composition-lab-demo.vue'),
    loadSource: async () =>
      (await import('./demos/store-composition/pinia-store-composition-lab-demo.vue?raw')).default,
  },
  {
    id: 'vue.pinia.learn.intermediate.store-modeling.pinia-store-responsibility-lab-demo',
    loadComponent: () => import('./demos/store-modeling/pinia-store-responsibility-lab-demo.vue'),
    loadSource: async () =>
      (await import('./demos/store-modeling/pinia-store-responsibility-lab-demo.vue?raw')).default,
  },
  {
    id: 'vue.pinia.learn.advanced.store-testing.pinia-testing-semantics-lab-demo',
    loadComponent: () => import('./demos/store-testing/pinia-testing-semantics-lab-demo.vue'),
    loadSource: async () =>
      (await import('./demos/store-testing/pinia-testing-semantics-lab-demo.vue?raw')).default,
  },
  {
    id: 'vue.pinia.learn.intermediate.subscriptions-actions.pinia-subscription-lifecycle-lab-demo',
    loadComponent: () =>
      import('./demos/subscriptions-actions/pinia-subscription-lifecycle-lab-demo.vue'),
    loadSource: async () =>
      (await import('./demos/subscriptions-actions/pinia-subscription-lifecycle-lab-demo.vue?raw'))
        .default,
  },
]
