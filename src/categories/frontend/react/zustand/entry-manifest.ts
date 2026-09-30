import type { CategoryContentEntryManifest } from '@/common/catalog'
import { getContentMeta } from 'virtual:content-catalog-meta'

export const reactZustandContentEntries: CategoryContentEntryManifest[] = [
  {
    slug: 'client-state-and-zustand',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/client-state-and-zustand.md'),
    load: async () => (await import('./learn/client-state-and-zustand.md?content-entry')).default,
  },
  {
    slug: 'first-store',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/first-store.md'),
    load: async () => (await import('./learn/first-store.md?content-entry')).default,
  },
  {
    slug: 'state-and-actions',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/state-and-actions.md'),
    load: async () => (await import('./learn/state-and-actions.md?content-entry')).default,
  },
  {
    slug: 'set-state-updates',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/set-state-updates.md'),
    load: async () => (await import('./learn/set-state-updates.md?content-entry')).default,
  },
  {
    slug: 'get-current-state',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/get-current-state.md'),
    load: async () => (await import('./learn/get-current-state.md?content-entry')).default,
  },
  {
    slug: 'component-subscription',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/component-subscription.md'),
    load: async () => (await import('./learn/component-subscription.md?content-entry')).default,
  },
  {
    slug: 'selector',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/selector.md'),
    load: async () => (await import('./learn/selector.md?content-entry')).default,
  },
  {
    slug: 'object-and-array-updates',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/object-and-array-updates.md'),
    load: async () => (await import('./learn/object-and-array-updates.md?content-entry')).default,
  },
  {
    slug: 'typescript-store',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/typescript-store.md'),
    load: async () => (await import('./learn/typescript-store.md?content-entry')).default,
  },
  {
    slug: 'state-ownership',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/state-ownership.md'),
    load: async () => (await import('./learn/state-ownership.md?content-entry')).default,
  },
  {
    slug: 'task-filter',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/task-filter.md'),
    load: async () => (await import('./learn/task-filter.md?content-entry')).default,
  },
  {
    slug: 'shopping-cart',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/shopping-cart.md'),
    load: async () => (await import('./learn/shopping-cart.md?content-entry')).default,
  },
  {
    slug: 'atomic-selector',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/atomic-selector.md'),
    load: async () => (await import('./learn/atomic-selector.md?content-entry')).default,
  },
  {
    slug: 'selector-result-stability',
    meta: getContentMeta(
      'src/categories/frontend/react/zustand/learn/selector-result-stability.md',
    ),
    load: async () => (await import('./learn/selector-result-stability.md?content-entry')).default,
  },
  {
    slug: 'use-shallow',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/use-shallow.md'),
    load: async () => (await import('./learn/use-shallow.md?content-entry')).default,
  },
  {
    slug: 'derived-state',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/derived-state.md'),
    load: async () => (await import('./learn/derived-state.md?content-entry')).default,
  },
  {
    slug: 'async-action',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/async-action.md'),
    load: async () => (await import('./learn/async-action.md?content-entry')).default,
  },
  {
    slug: 'state-reset',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/state-reset.md'),
    load: async () => (await import('./learn/state-reset.md?content-entry')).default,
  },
  {
    slug: 'persist',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/persist.md'),
    load: async () => (await import('./learn/persist.md?content-entry')).default,
  },
  {
    slug: 'devtools',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/devtools.md'),
    load: async () => (await import('./learn/devtools.md?content-entry')).default,
  },
  {
    slug: 'subscribe',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/subscribe.md'),
    load: async () => (await import('./learn/subscribe.md?content-entry')).default,
  },
  {
    slug: 'slices-pattern',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/slices-pattern.md'),
    load: async () => (await import('./learn/slices-pattern.md?content-entry')).default,
  },
  {
    slug: 'preferences-center',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/preferences-center.md'),
    load: async () => (await import('./learn/preferences-center.md?content-entry')).default,
  },
  {
    slug: 'content-workspace',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/content-workspace.md'),
    load: async () => (await import('./learn/content-workspace.md?content-entry')).default,
  },
  {
    slug: 'vanilla-store',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/vanilla-store.md'),
    load: async () => (await import('./learn/vanilla-store.md?content-entry')).default,
  },
  {
    slug: 'context-scope',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/context-scope.md'),
    load: async () => (await import('./learn/context-scope.md?content-entry')).default,
  },
  {
    slug: 'store-factory',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/store-factory.md'),
    load: async () => (await import('./learn/store-factory.md?content-entry')).default,
  },
  {
    slug: 'advanced-typescript',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/advanced-typescript.md'),
    load: async () => (await import('./learn/advanced-typescript.md?content-entry')).default,
  },
  {
    slug: 'subscribe-with-selector',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/subscribe-with-selector.md'),
    load: async () => (await import('./learn/subscribe-with-selector.md?content-entry')).default,
  },
  {
    slug: 'middleware-composition',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/middleware-composition.md'),
    load: async () => (await import('./learn/middleware-composition.md?content-entry')).default,
  },
  {
    slug: 'immer-middleware',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/immer-middleware.md'),
    load: async () => (await import('./learn/immer-middleware.md?content-entry')).default,
  },
  {
    slug: 'persist-version-migration',
    meta: getContentMeta(
      'src/categories/frontend/react/zustand/learn/persist-version-migration.md',
    ),
    load: async () => (await import('./learn/persist-version-migration.md?content-entry')).default,
  },
  {
    slug: 'zustand-testing',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/zustand-testing.md'),
    load: async () => (await import('./learn/zustand-testing.md?content-entry')).default,
  },
  {
    slug: 'ssr-and-hydration',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/ssr-and-hydration.md'),
    load: async () => (await import('./learn/ssr-and-hydration.md?content-entry')).default,
  },
  {
    slug: 'multi-instance-editor',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/multi-instance-editor.md'),
    load: async () => (await import('./learn/multi-instance-editor.md?content-entry')).default,
  },
  {
    slug: 'client-state-platform',
    meta: getContentMeta('src/categories/frontend/react/zustand/learn/client-state-platform.md'),
    load: async () => (await import('./learn/client-state-platform.md?content-entry')).default,
  },
]
