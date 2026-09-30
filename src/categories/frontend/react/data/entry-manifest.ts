import type { CategoryContentEntryManifest } from '@/common/catalog'
import { getContentMeta } from 'virtual:content-catalog-meta'

export const reactDataContentEntries: CategoryContentEntryManifest[] = [
  {
    slug: 'server-state-and-tanstack-query',
    meta: getContentMeta(
      'src/categories/frontend/react/data/learn/server-state-and-tanstack-query.md',
    ),
    load: async () =>
      (await import('./learn/server-state-and-tanstack-query.md?content-entry')).default,
  },
  {
    slug: 'query-client-and-provider',
    meta: getContentMeta('src/categories/frontend/react/data/learn/query-client-and-provider.md'),
    load: async () => (await import('./learn/query-client-and-provider.md?content-entry')).default,
  },
  {
    slug: 'first-use-query',
    meta: getContentMeta('src/categories/frontend/react/data/learn/first-use-query.md'),
    load: async () => (await import('./learn/first-use-query.md?content-entry')).default,
  },
  {
    slug: 'query-function-and-fetch',
    meta: getContentMeta('src/categories/frontend/react/data/learn/query-function-and-fetch.md'),
    load: async () => (await import('./learn/query-function-and-fetch.md?content-entry')).default,
  },
  {
    slug: 'query-key',
    meta: getContentMeta('src/categories/frontend/react/data/learn/query-key.md'),
    load: async () => (await import('./learn/query-key.md?content-entry')).default,
  },
  {
    slug: 'query-status',
    meta: getContentMeta('src/categories/frontend/react/data/learn/query-status.md'),
    load: async () => (await import('./learn/query-status.md?content-entry')).default,
  },
  {
    slug: 'query-error-handling',
    meta: getContentMeta('src/categories/frontend/react/data/learn/query-error-handling.md'),
    load: async () => (await import('./learn/query-error-handling.md?content-entry')).default,
  },
  {
    slug: 'query-cache-and-sharing',
    meta: getContentMeta('src/categories/frontend/react/data/learn/query-cache-and-sharing.md'),
    load: async () => (await import('./learn/query-cache-and-sharing.md?content-entry')).default,
  },
  {
    slug: 'stale-time-and-freshness',
    meta: getContentMeta('src/categories/frontend/react/data/learn/stale-time-and-freshness.md'),
    load: async () => (await import('./learn/stale-time-and-freshness.md?content-entry')).default,
  },
  {
    slug: 'background-refetching',
    meta: getContentMeta('src/categories/frontend/react/data/learn/background-refetching.md'),
    load: async () => (await import('./learn/background-refetching.md?content-entry')).default,
  },
  {
    slug: 'cache-lifecycle-and-gctime',
    meta: getContentMeta('src/categories/frontend/react/data/learn/cache-lifecycle-and-gctime.md'),
    load: async () => (await import('./learn/cache-lifecycle-and-gctime.md?content-entry')).default,
  },
  {
    slug: 'conditional-queries',
    meta: getContentMeta('src/categories/frontend/react/data/learn/conditional-queries.md'),
    load: async () => (await import('./learn/conditional-queries.md?content-entry')).default,
  },
  {
    slug: 'typescript-queries',
    meta: getContentMeta('src/categories/frontend/react/data/learn/typescript-queries.md'),
    load: async () => (await import('./learn/typescript-queries.md?content-entry')).default,
  },
  {
    slug: 'react-query-devtools',
    meta: getContentMeta('src/categories/frontend/react/data/learn/react-query-devtools.md'),
    load: async () => (await import('./learn/react-query-devtools.md?content-entry')).default,
  },
  {
    slug: 'user-profile-panel',
    meta: getContentMeta('src/categories/frontend/react/data/learn/user-profile-panel.md'),
    load: async () => (await import('./learn/user-profile-panel.md?content-entry')).default,
  },
  {
    slug: 'article-list-and-detail',
    meta: getContentMeta('src/categories/frontend/react/data/learn/article-list-and-detail.md'),
    load: async () => (await import('./learn/article-list-and-detail.md?content-entry')).default,
  },
  {
    slug: 'query-key-organization',
    meta: getContentMeta('src/categories/frontend/react/data/learn/query-key-organization.md'),
    load: async () => (await import('./learn/query-key-organization.md?content-entry')).default,
  },
  {
    slug: 'query-options-reuse',
    meta: getContentMeta('src/categories/frontend/react/data/learn/query-options-reuse.md'),
    load: async () => (await import('./learn/query-options-reuse.md?content-entry')).default,
  },
  {
    slug: 'dependent-queries',
    meta: getContentMeta('src/categories/frontend/react/data/learn/dependent-queries.md'),
    load: async () => (await import('./learn/dependent-queries.md?content-entry')).default,
  },
  {
    slug: 'parallel-queries',
    meta: getContentMeta('src/categories/frontend/react/data/learn/parallel-queries.md'),
    load: async () => (await import('./learn/parallel-queries.md?content-entry')).default,
  },
  {
    slug: 'query-retry',
    meta: getContentMeta('src/categories/frontend/react/data/learn/query-retry.md'),
    load: async () => (await import('./learn/query-retry.md?content-entry')).default,
  },
  {
    slug: 'query-cancellation',
    meta: getContentMeta('src/categories/frontend/react/data/learn/query-cancellation.md'),
    load: async () => (await import('./learn/query-cancellation.md?content-entry')).default,
  },
  {
    slug: 'initial-and-placeholder-data',
    meta: getContentMeta(
      'src/categories/frontend/react/data/learn/initial-and-placeholder-data.md',
    ),
    load: async () =>
      (await import('./learn/initial-and-placeholder-data.md?content-entry')).default,
  },
  {
    slug: 'paginated-queries',
    meta: getContentMeta('src/categories/frontend/react/data/learn/paginated-queries.md'),
    load: async () => (await import('./learn/paginated-queries.md?content-entry')).default,
  },
  {
    slug: 'use-mutation',
    meta: getContentMeta('src/categories/frontend/react/data/learn/use-mutation.md'),
    load: async () => (await import('./learn/use-mutation.md?content-entry')).default,
  },
  {
    slug: 'mutation-lifecycle',
    meta: getContentMeta('src/categories/frontend/react/data/learn/mutation-lifecycle.md'),
    load: async () => (await import('./learn/mutation-lifecycle.md?content-entry')).default,
  },
  {
    slug: 'query-invalidation',
    meta: getContentMeta('src/categories/frontend/react/data/learn/query-invalidation.md'),
    load: async () => (await import('./learn/query-invalidation.md?content-entry')).default,
  },
  {
    slug: 'updates-from-mutation-responses',
    meta: getContentMeta(
      'src/categories/frontend/react/data/learn/updates-from-mutation-responses.md',
    ),
    load: async () =>
      (await import('./learn/updates-from-mutation-responses.md?content-entry')).default,
  },
  {
    slug: 'optimistic-updates',
    meta: getContentMeta('src/categories/frontend/react/data/learn/optimistic-updates.md'),
    load: async () => (await import('./learn/optimistic-updates.md?content-entry')).default,
  },
  {
    slug: 'data-hooks-and-module-organization',
    meta: getContentMeta(
      'src/categories/frontend/react/data/learn/data-hooks-and-module-organization.md',
    ),
    load: async () =>
      (await import('./learn/data-hooks-and-module-organization.md?content-entry')).default,
  },
  {
    slug: 'paginated-content-management',
    meta: getContentMeta(
      'src/categories/frontend/react/data/learn/paginated-content-management.md',
    ),
    load: async () =>
      (await import('./learn/paginated-content-management.md?content-entry')).default,
  },
  {
    slug: 'crud-management-workspace',
    meta: getContentMeta('src/categories/frontend/react/data/learn/crud-management-workspace.md'),
    load: async () => (await import('./learn/crud-management-workspace.md?content-entry')).default,
  },
  {
    slug: 'infinite-queries',
    meta: getContentMeta('src/categories/frontend/react/data/learn/infinite-queries.md'),
    load: async () => (await import('./learn/infinite-queries.md?content-entry')).default,
  },
  {
    slug: 'infinite-query-memory',
    meta: getContentMeta('src/categories/frontend/react/data/learn/infinite-query-memory.md'),
    load: async () => (await import('./learn/infinite-query-memory.md?content-entry')).default,
  },
  {
    slug: 'query-prefetching',
    meta: getContentMeta('src/categories/frontend/react/data/learn/query-prefetching.md'),
    load: async () => (await import('./learn/query-prefetching.md?content-entry')).default,
  },
  {
    slug: 'react-router-query-integration',
    meta: getContentMeta(
      'src/categories/frontend/react/data/learn/react-router-query-integration.md',
    ),
    load: async () =>
      (await import('./learn/react-router-query-integration.md?content-entry')).default,
  },
  {
    slug: 'request-waterfalls',
    meta: getContentMeta('src/categories/frontend/react/data/learn/request-waterfalls.md'),
    load: async () => (await import('./learn/request-waterfalls.md?content-entry')).default,
  },
  {
    slug: 'query-render-optimizations',
    meta: getContentMeta('src/categories/frontend/react/data/learn/query-render-optimizations.md'),
    load: async () => (await import('./learn/query-render-optimizations.md?content-entry')).default,
  },
  {
    slug: 'query-client-cache-operations',
    meta: getContentMeta(
      'src/categories/frontend/react/data/learn/query-client-cache-operations.md',
    ),
    load: async () =>
      (await import('./learn/query-client-cache-operations.md?content-entry')).default,
  },
  {
    slug: 'concurrent-mutation-state',
    meta: getContentMeta('src/categories/frontend/react/data/learn/concurrent-mutation-state.md'),
    load: async () => (await import('./learn/concurrent-mutation-state.md?content-entry')).default,
  },
  {
    slug: 'suspense-queries',
    meta: getContentMeta('src/categories/frontend/react/data/learn/suspense-queries.md'),
    load: async () => (await import('./learn/suspense-queries.md?content-entry')).default,
  },
  {
    slug: 'query-error-boundary',
    meta: getContentMeta('src/categories/frontend/react/data/learn/query-error-boundary.md'),
    load: async () => (await import('./learn/query-error-boundary.md?content-entry')).default,
  },
  {
    slug: 'offline-query-persistence',
    meta: getContentMeta('src/categories/frontend/react/data/learn/offline-query-persistence.md'),
    load: async () => (await import('./learn/offline-query-persistence.md?content-entry')).default,
  },
  {
    slug: 'ssr-and-hydration',
    meta: getContentMeta('src/categories/frontend/react/data/learn/ssr-and-hydration.md'),
    load: async () => (await import('./learn/ssr-and-hydration.md?content-entry')).default,
  },
  {
    slug: 'query-testing',
    meta: getContentMeta('src/categories/frontend/react/data/learn/query-testing.md'),
    load: async () => (await import('./learn/query-testing.md?content-entry')).default,
  },
  {
    slug: 'production-data-layer',
    meta: getContentMeta('src/categories/frontend/react/data/learn/production-data-layer.md'),
    load: async () => (await import('./learn/production-data-layer.md?content-entry')).default,
  },
  {
    slug: 'collaboration-content-platform',
    meta: getContentMeta(
      'src/categories/frontend/react/data/learn/collaboration-content-platform.md',
    ),
    load: async () =>
      (await import('./learn/collaboration-content-platform.md?content-entry')).default,
  },
  {
    slug: 'production-server-data-center',
    meta: getContentMeta(
      'src/categories/frontend/react/data/learn/production-server-data-center.md',
    ),
    load: async () =>
      (await import('./learn/production-server-data-center.md?content-entry')).default,
  },
]
