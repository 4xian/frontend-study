import type { DemoAssetManifest } from '@/common/content/demo-registry'

export const viteDemoAssets: DemoAssetManifest[] = [
  {
    id: 'engineering.vite.learn.basics.hmr-model-state-preservation-demo',
    loadComponent: () => import('./demos/hmr-model-state-preservation-demo.vue'),
    loadSource: async () =>
      (await import('./demos/hmr-model-state-preservation-demo.vue?raw')).default,
  },
]
