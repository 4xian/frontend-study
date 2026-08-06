import type { DemoAssetManifest } from '@/common/content/demo-registry'

export const typeScriptDemoAssets: DemoAssetManifest[] = [
  {
    id: 'engineering.typescript.learn.basics.narrowing.control-flow-demo',
    loadComponent: () => import('./demos/narrowing/control-flow-demo.vue'),
    loadSource: async () => (await import('./demos/narrowing/control-flow-demo.vue?raw')).default,
  },
  {
    id: 'engineering.typescript.learn.intermediate.classes-and-compatibility.runtime-identity-demo',
    loadComponent: () => import('./demos/classes-and-compatibility/runtime-identity-demo.vue'),
    loadSource: async () =>
      (await import('./demos/classes-and-compatibility/runtime-identity-demo.vue?raw')).default,
  },
  {
    id: 'engineering.typescript.learn.intermediate.unknown-never-and-errors.error-narrowing-demo',
    loadComponent: () => import('./demos/unknown-never-and-errors/error-narrowing-demo.vue'),
    loadSource: async () =>
      (await import('./demos/unknown-never-and-errors/error-narrowing-demo.vue?raw')).default,
  },
]
