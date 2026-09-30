import type { CategoryContentEntryManifest } from '@/common/catalog'
import { getContentMeta } from 'virtual:content-catalog-meta'

export const reactRouterContentEntries: CategoryContentEntryManifest[] = [
  {
    slug: 'data-router-introduction',
    meta: getContentMeta('src/categories/frontend/react/router/learn/data-router-introduction.md'),
    load: async () => (await import('./learn/data-router-introduction.md?content-entry')).default,
  },
  {
    slug: 'route-objects',
    meta: getContentMeta('src/categories/frontend/react/router/learn/route-objects.md'),
    load: async () => (await import('./learn/route-objects.md?content-entry')).default,
  },
  {
    slug: 'route-matching',
    meta: getContentMeta('src/categories/frontend/react/router/learn/route-matching.md'),
    load: async () => (await import('./learn/route-matching.md?content-entry')).default,
  },
  {
    slug: 'link-navigation',
    meta: getContentMeta('src/categories/frontend/react/router/learn/link-navigation.md'),
    load: async () => (await import('./learn/link-navigation.md?content-entry')).default,
  },
  {
    slug: 'nav-link-state',
    meta: getContentMeta('src/categories/frontend/react/router/learn/nav-link-state.md'),
    load: async () => (await import('./learn/nav-link-state.md?content-entry')).default,
  },
  {
    slug: 'nested-routes-and-outlet',
    meta: getContentMeta('src/categories/frontend/react/router/learn/nested-routes-and-outlet.md'),
    load: async () => (await import('./learn/nested-routes-and-outlet.md?content-entry')).default,
  },
  {
    slug: 'layout-routes',
    meta: getContentMeta('src/categories/frontend/react/router/learn/layout-routes.md'),
    load: async () => (await import('./learn/layout-routes.md?content-entry')).default,
  },
  {
    slug: 'index-routes',
    meta: getContentMeta('src/categories/frontend/react/router/learn/index-routes.md'),
    load: async () => (await import('./learn/index-routes.md?content-entry')).default,
  },
  {
    slug: 'dynamic-segments',
    meta: getContentMeta('src/categories/frontend/react/router/learn/dynamic-segments.md'),
    load: async () => (await import('./learn/dynamic-segments.md?content-entry')).default,
  },
  {
    slug: 'optional-segments-and-splats',
    meta: getContentMeta(
      'src/categories/frontend/react/router/learn/optional-segments-and-splats.md',
    ),
    load: async () =>
      (await import('./learn/optional-segments-and-splats.md?content-entry')).default,
  },
  {
    slug: 'route-params',
    meta: getContentMeta('src/categories/frontend/react/router/learn/route-params.md'),
    load: async () => (await import('./learn/route-params.md?content-entry')).default,
  },
  {
    slug: 'query-params-and-url-state',
    meta: getContentMeta(
      'src/categories/frontend/react/router/learn/query-params-and-url-state.md',
    ),
    load: async () => (await import('./learn/query-params-and-url-state.md?content-entry')).default,
  },
  {
    slug: 'programmatic-navigation',
    meta: getContentMeta('src/categories/frontend/react/router/learn/programmatic-navigation.md'),
    load: async () => (await import('./learn/programmatic-navigation.md?content-entry')).default,
  },
  {
    slug: 'location-and-history-state',
    meta: getContentMeta(
      'src/categories/frontend/react/router/learn/location-and-history-state.md',
    ),
    load: async () => (await import('./learn/location-and-history-state.md?content-entry')).default,
  },
  {
    slug: 'lab-multi-page-course-center',
    meta: getContentMeta(
      'src/categories/frontend/react/router/learn/lab-multi-page-course-center.md',
    ),
    load: async () =>
      (await import('./learn/lab-multi-page-course-center.md?content-entry')).default,
  },
  {
    slug: 'lab-nested-documentation-center',
    meta: getContentMeta(
      'src/categories/frontend/react/router/learn/lab-nested-documentation-center.md',
    ),
    load: async () =>
      (await import('./learn/lab-nested-documentation-center.md?content-entry')).default,
  },
  {
    slug: 'loader-data-loading',
    meta: getContentMeta('src/categories/frontend/react/router/learn/loader-data-loading.md'),
    load: async () => (await import('./learn/loader-data-loading.md?content-entry')).default,
  },
  {
    slug: 'loader-requests-and-redirects',
    meta: getContentMeta(
      'src/categories/frontend/react/router/learn/loader-requests-and-redirects.md',
    ),
    load: async () =>
      (await import('./learn/loader-requests-and-redirects.md?content-entry')).default,
  },
  {
    slug: 'route-data-reading-and-sharing',
    meta: getContentMeta(
      'src/categories/frontend/react/router/learn/route-data-reading-and-sharing.md',
    ),
    load: async () =>
      (await import('./learn/route-data-reading-and-sharing.md?content-entry')).default,
  },
  {
    slug: 'navigation-pending-ui',
    meta: getContentMeta('src/categories/frontend/react/router/learn/navigation-pending-ui.md'),
    load: async () => (await import('./learn/navigation-pending-ui.md?content-entry')).default,
  },
  {
    slug: 'action-data-submission',
    meta: getContentMeta('src/categories/frontend/react/router/learn/action-data-submission.md'),
    load: async () => (await import('./learn/action-data-submission.md?content-entry')).default,
  },
  {
    slug: 'form-navigation-form',
    meta: getContentMeta('src/categories/frontend/react/router/learn/form-navigation-form.md'),
    load: async () => (await import('./learn/form-navigation-form.md?content-entry')).default,
  },
  {
    slug: 'action-results-and-form-validation',
    meta: getContentMeta(
      'src/categories/frontend/react/router/learn/action-results-and-form-validation.md',
    ),
    load: async () =>
      (await import('./learn/action-results-and-form-validation.md?content-entry')).default,
  },
  {
    slug: 'fetcher',
    meta: getContentMeta('src/categories/frontend/react/router/learn/fetcher.md'),
    load: async () => (await import('./learn/fetcher.md?content-entry')).default,
  },
  {
    slug: 'form-fetcher-choice',
    meta: getContentMeta('src/categories/frontend/react/router/learn/form-fetcher-choice.md'),
    load: async () => (await import('./learn/form-fetcher-choice.md?content-entry')).default,
  },
  {
    slug: 'revalidation',
    meta: getContentMeta('src/categories/frontend/react/router/learn/revalidation.md'),
    load: async () => (await import('./learn/revalidation.md?content-entry')).default,
  },
  {
    slug: 'route-error-boundary',
    meta: getContentMeta('src/categories/frontend/react/router/learn/route-error-boundary.md'),
    load: async () => (await import('./learn/route-error-boundary.md?content-entry')).default,
  },
  {
    slug: 'auth-route-boundary',
    meta: getContentMeta('src/categories/frontend/react/router/learn/auth-route-boundary.md'),
    load: async () => (await import('./learn/auth-route-boundary.md?content-entry')).default,
  },
  {
    slug: 'route-metadata-and-breadcrumbs',
    meta: getContentMeta(
      'src/categories/frontend/react/router/learn/route-metadata-and-breadcrumbs.md',
    ),
    load: async () =>
      (await import('./learn/route-metadata-and-breadcrumbs.md?content-entry')).default,
  },
  {
    slug: 'lazy-routes',
    meta: getContentMeta('src/categories/frontend/react/router/learn/lazy-routes.md'),
    load: async () => (await import('./learn/lazy-routes.md?content-entry')).default,
  },
  {
    slug: 'lab-content-management-workspace',
    meta: getContentMeta(
      'src/categories/frontend/react/router/learn/lab-content-management-workspace.md',
    ),
    load: async () =>
      (await import('./learn/lab-content-management-workspace.md?content-entry')).default,
  },
  {
    slug: 'lab-auth-admin-workspace',
    meta: getContentMeta('src/categories/frontend/react/router/learn/lab-auth-admin-workspace.md'),
    load: async () => (await import('./learn/lab-auth-admin-workspace.md?content-entry')).default,
  },
  {
    slug: 'optimistic-ui',
    meta: getContentMeta('src/categories/frontend/react/router/learn/optimistic-ui.md'),
    load: async () => (await import('./learn/optimistic-ui.md?content-entry')).default,
  },
  {
    slug: 'navigation-concurrency-and-cancellation',
    meta: getContentMeta(
      'src/categories/frontend/react/router/learn/navigation-concurrency-and-cancellation.md',
    ),
    load: async () =>
      (await import('./learn/navigation-concurrency-and-cancellation.md?content-entry')).default,
  },
  {
    slug: 'race-conditions',
    meta: getContentMeta('src/categories/frontend/react/router/learn/race-conditions.md'),
    load: async () => (await import('./learn/race-conditions.md?content-entry')).default,
  },
  {
    slug: 'route-state-ownership',
    meta: getContentMeta('src/categories/frontend/react/router/learn/route-state-ownership.md'),
    load: async () => (await import('./learn/route-state-ownership.md?content-entry')).default,
  },
  {
    slug: 'custom-data-strategy',
    meta: getContentMeta('src/categories/frontend/react/router/learn/custom-data-strategy.md'),
    load: async () => (await import('./learn/custom-data-strategy.md?content-entry')).default,
  },
  {
    slug: 'dynamic-route-discovery',
    meta: getContentMeta('src/categories/frontend/react/router/learn/dynamic-route-discovery.md'),
    load: async () => (await import('./learn/dynamic-route-discovery.md?content-entry')).default,
  },
  {
    slug: 'scroll-restoration',
    meta: getContentMeta('src/categories/frontend/react/router/learn/scroll-restoration.md'),
    load: async () => (await import('./learn/scroll-restoration.md?content-entry')).default,
  },
  {
    slug: 'navigation-blocking',
    meta: getContentMeta('src/categories/frontend/react/router/learn/navigation-blocking.md'),
    load: async () => (await import('./learn/navigation-blocking.md?content-entry')).default,
  },
]
