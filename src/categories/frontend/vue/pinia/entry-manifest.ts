import type { CategoryContentEntryManifest } from '@/common/catalog'
import { getContentMeta } from 'virtual:content-catalog-meta'

export const vuePiniaContentEntries: CategoryContentEntryManifest[] = [
  {
    slug: 'actions-async',
    meta: getContentMeta('src/categories/frontend/vue/pinia/learn/actions-async.md'),
    load: async () => (await import('./learn/actions-async.md?content-entry')).default,
  },
  {
    slug: 'component-store-to-refs',
    meta: getContentMeta('src/categories/frontend/vue/pinia/learn/component-store-to-refs.md'),
    load: async () => (await import('./learn/component-store-to-refs.md?content-entry')).default,
  },
  {
    slug: 'getters',
    meta: getContentMeta('src/categories/frontend/vue/pinia/learn/getters.md'),
    load: async () => (await import('./learn/getters.md?content-entry')).default,
  },
  {
    slug: 'hmr-devtools-maintenance',
    meta: getContentMeta('src/categories/frontend/vue/pinia/learn/hmr-devtools-maintenance.md'),
    load: async () => (await import('./learn/hmr-devtools-maintenance.md?content-entry')).default,
  },
  {
    slug: 'outside-components-router',
    meta: getContentMeta('src/categories/frontend/vue/pinia/learn/outside-components-router.md'),
    load: async () => (await import('./learn/outside-components-router.md?content-entry')).default,
  },
  {
    slug: 'plugins-persistence',
    meta: getContentMeta('src/categories/frontend/vue/pinia/learn/plugins-persistence.md'),
    load: async () => (await import('./learn/plugins-persistence.md?content-entry')).default,
  },
  {
    slug: 'setup-first-store',
    meta: getContentMeta('src/categories/frontend/vue/pinia/learn/setup-first-store.md'),
    load: async () => (await import('./learn/setup-first-store.md?content-entry')).default,
  },
  {
    slug: 'setup-stores',
    meta: getContentMeta('src/categories/frontend/vue/pinia/learn/setup-stores.md'),
    load: async () => (await import('./learn/setup-stores.md?content-entry')).default,
  },
  {
    slug: 'ssr-hydration',
    meta: getContentMeta('src/categories/frontend/vue/pinia/learn/ssr-hydration.md'),
    load: async () => (await import('./learn/ssr-hydration.md?content-entry')).default,
  },
  {
    slug: 'state-patch-reset',
    meta: getContentMeta('src/categories/frontend/vue/pinia/learn/state-patch-reset.md'),
    load: async () => (await import('./learn/state-patch-reset.md?content-entry')).default,
  },
  {
    slug: 'store-composition',
    meta: getContentMeta('src/categories/frontend/vue/pinia/learn/store-composition.md'),
    load: async () => (await import('./learn/store-composition.md?content-entry')).default,
  },
  {
    slug: 'store-modeling',
    meta: getContentMeta('src/categories/frontend/vue/pinia/learn/store-modeling.md'),
    load: async () => (await import('./learn/store-modeling.md?content-entry')).default,
  },
  {
    slug: 'store-testing',
    meta: getContentMeta('src/categories/frontend/vue/pinia/learn/store-testing.md'),
    load: async () => (await import('./learn/store-testing.md?content-entry')).default,
  },
  {
    slug: 'subscriptions-actions',
    meta: getContentMeta('src/categories/frontend/vue/pinia/learn/subscriptions-actions.md'),
    load: async () => (await import('./learn/subscriptions-actions.md?content-entry')).default,
  },
  {
    slug: 'define-store',
    meta: getContentMeta('src/categories/frontend/vue/pinia/reference/define-store.md'),
    load: async () => (await import('./reference/define-store.md?content-entry')).default,
  },
  {
    slug: 'hmr',
    meta: getContentMeta('src/categories/frontend/vue/pinia/reference/hmr.md'),
    load: async () => (await import('./reference/hmr.md?content-entry')).default,
  },
  {
    slug: 'hydration',
    meta: getContentMeta('src/categories/frontend/vue/pinia/reference/hydration.md'),
    load: async () => (await import('./reference/hydration.md?content-entry')).default,
  },
  {
    slug: 'internal-types',
    meta: getContentMeta('src/categories/frontend/vue/pinia/reference/internal-types.md'),
    load: async () => (await import('./reference/internal-types.md?content-entry')).default,
  },
  {
    slug: 'map-helpers',
    meta: getContentMeta('src/categories/frontend/vue/pinia/reference/map-helpers.md'),
    load: async () => (await import('./reference/map-helpers.md?content-entry')).default,
  },
  {
    slug: 'pinia-instance',
    meta: getContentMeta('src/categories/frontend/vue/pinia/reference/pinia-instance.md'),
    load: async () => (await import('./reference/pinia-instance.md?content-entry')).default,
  },
  {
    slug: 'plugin-contracts',
    meta: getContentMeta('src/categories/frontend/vue/pinia/reference/plugin-contracts.md'),
    load: async () => (await import('./reference/plugin-contracts.md?content-entry')).default,
  },
  {
    slug: 'store-shape',
    meta: getContentMeta('src/categories/frontend/vue/pinia/reference/store-shape.md'),
    load: async () => (await import('./reference/store-shape.md?content-entry')).default,
  },
  {
    slug: 'store-to-refs',
    meta: getContentMeta('src/categories/frontend/vue/pinia/reference/store-to-refs.md'),
    load: async () => (await import('./reference/store-to-refs.md?content-entry')).default,
  },
  {
    slug: 'subscriptions',
    meta: getContentMeta('src/categories/frontend/vue/pinia/reference/subscriptions.md'),
    load: async () => (await import('./reference/subscriptions.md?content-entry')).default,
  },
]
