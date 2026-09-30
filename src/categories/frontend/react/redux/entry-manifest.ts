import type { CategoryContentEntryManifest } from '@/common/catalog'
import { getContentMeta } from 'virtual:content-catalog-meta'

export const reactReduxContentEntries: CategoryContentEntryManifest[] = [
  {
    slug: 'modern-redux-stack',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/modern-redux-stack.md'),
    load: async () => (await import('./learn/modern-redux-stack.md?content-entry')).default,
  },
  {
    slug: 'redux-one-way-data-flow',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/redux-one-way-data-flow.md'),
    load: async () => (await import('./learn/redux-one-way-data-flow.md?content-entry')).default,
  },
  {
    slug: 'configure-store',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/configure-store.md'),
    load: async () => (await import('./learn/configure-store.md?content-entry')).default,
  },
  {
    slug: 'provider',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/provider.md'),
    load: async () => (await import('./learn/provider.md?content-entry')).default,
  },
  {
    slug: 'create-slice',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/create-slice.md'),
    load: async () => (await import('./learn/create-slice.md?content-entry')).default,
  },
  {
    slug: 'action-and-payload',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/action-and-payload.md'),
    load: async () => (await import('./learn/action-and-payload.md?content-entry')).default,
  },
  {
    slug: 'reducer-and-immer',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/reducer-and-immer.md'),
    load: async () => (await import('./learn/reducer-and-immer.md?content-entry')).default,
  },
  {
    slug: 'use-selector',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/use-selector.md'),
    load: async () => (await import('./learn/use-selector.md?content-entry')).default,
  },
  {
    slug: 'use-dispatch',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/use-dispatch.md'),
    load: async () => (await import('./learn/use-dispatch.md?content-entry')).default,
  },
  {
    slug: 'typescript-pretyped-hooks',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/typescript-pretyped-hooks.md'),
    load: async () => (await import('./learn/typescript-pretyped-hooks.md?content-entry')).default,
  },
  {
    slug: 'multiple-slices-root-state',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/multiple-slices-root-state.md'),
    load: async () => (await import('./learn/multiple-slices-root-state.md?content-entry')).default,
  },
  {
    slug: 'state-ownership',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/state-ownership.md'),
    load: async () => (await import('./learn/state-ownership.md?content-entry')).default,
  },
  {
    slug: 'redux-devtools',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/redux-devtools.md'),
    load: async () => (await import('./learn/redux-devtools.md?content-entry')).default,
  },
  {
    slug: 'feature-folder-organization',
    meta: getContentMeta(
      'src/categories/frontend/react/redux/learn/feature-folder-organization.md',
    ),
    load: async () =>
      (await import('./learn/feature-folder-organization.md?content-entry')).default,
  },
  {
    slug: 'task-filter-panel',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/task-filter-panel.md'),
    load: async () => (await import('./learn/task-filter-panel.md?content-entry')).default,
  },
  {
    slug: 'shopping-cart-state-center',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/shopping-cart-state-center.md'),
    load: async () => (await import('./learn/shopping-cart-state-center.md?content-entry')).default,
  },
  {
    slug: 'selector',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/selector.md'),
    load: async () => (await import('./learn/selector.md?content-entry')).default,
  },
  {
    slug: 'create-selector',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/create-selector.md'),
    load: async () => (await import('./learn/create-selector.md?content-entry')).default,
  },
  {
    slug: 'use-selector-result-identity-and-subscription',
    meta: getContentMeta(
      'src/categories/frontend/react/redux/learn/use-selector-result-identity-and-subscription.md',
    ),
    load: async () =>
      (await import('./learn/use-selector-result-identity-and-subscription.md?content-entry'))
        .default,
  },
  {
    slug: 'thunk-async-logic',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/thunk-async-logic.md'),
    load: async () => (await import('./learn/thunk-async-logic.md?content-entry')).default,
  },
  {
    slug: 'create-async-thunk',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/create-async-thunk.md'),
    load: async () => (await import('./learn/create-async-thunk.md?content-entry')).default,
  },
  {
    slug: 'async-lifecycle-state',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/async-lifecycle-state.md'),
    load: async () => (await import('./learn/async-lifecycle-state.md?content-entry')).default,
  },
  {
    slug: 'async-error-reject-with-value',
    meta: getContentMeta(
      'src/categories/frontend/react/redux/learn/async-error-reject-with-value.md',
    ),
    load: async () =>
      (await import('./learn/async-error-reject-with-value.md?content-entry')).default,
  },
  {
    slug: 'async-cancel-condition',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/async-cancel-condition.md'),
    load: async () => (await import('./learn/async-cancel-condition.md?content-entry')).default,
  },
  {
    slug: 'extra-reducers-action-matcher',
    meta: getContentMeta(
      'src/categories/frontend/react/redux/learn/extra-reducers-action-matcher.md',
    ),
    load: async () =>
      (await import('./learn/extra-reducers-action-matcher.md?content-entry')).default,
  },
  {
    slug: 'middleware-chain',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/middleware-chain.md'),
    load: async () => (await import('./learn/middleware-chain.md?content-entry')).default,
  },
  {
    slug: 'default-middleware-checks',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/default-middleware-checks.md'),
    load: async () => (await import('./learn/default-middleware-checks.md?content-entry')).default,
  },
  {
    slug: 'listener-middleware',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/listener-middleware.md'),
    load: async () => (await import('./learn/listener-middleware.md?content-entry')).default,
  },
  {
    slug: 'normalized-state',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/normalized-state.md'),
    load: async () => (await import('./learn/normalized-state.md?content-entry')).default,
  },
  {
    slug: 'create-entity-adapter',
    meta: getContentMeta('src/categories/frontend/react/redux/learn/create-entity-adapter.md'),
    load: async () => (await import('./learn/create-entity-adapter.md?content-entry')).default,
  },
  {
    slug: 'async-content-management-workspace',
    meta: getContentMeta(
      'src/categories/frontend/react/redux/learn/async-content-management-workspace.md',
    ),
    load: async () =>
      (await import('./learn/async-content-management-workspace.md?content-entry')).default,
  },
]
