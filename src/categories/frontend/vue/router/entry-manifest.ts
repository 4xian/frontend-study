import type { CategoryContentEntryManifest } from '@/common/catalog'
import { getContentMeta } from 'virtual:content-catalog-meta'

export const vueRouterContentEntries: CategoryContentEntryManifest[] = [
  {
    slug: 'composition-programmatic-navigation',
    meta: getContentMeta(
      'src/categories/frontend/vue/router/learn/composition-programmatic-navigation.md',
    ),
    load: async () =>
      (await import('./learn/composition-programmatic-navigation.md?content-entry')).default,
  },
  {
    slug: 'dynamic-routing-router-link',
    meta: getContentMeta('src/categories/frontend/vue/router/learn/dynamic-routing-router-link.md'),
    load: async () =>
      (await import('./learn/dynamic-routing-router-link.md?content-entry')).default,
  },
  {
    slug: 'lazy-loading',
    meta: getContentMeta('src/categories/frontend/vue/router/learn/lazy-loading.md'),
    load: async () => (await import('./learn/lazy-loading.md?content-entry')).default,
  },
  {
    slug: 'meta-navigation-guards',
    meta: getContentMeta('src/categories/frontend/vue/router/learn/meta-navigation-guards.md'),
    load: async () => (await import('./learn/meta-navigation-guards.md?content-entry')).default,
  },
  {
    slug: 'named-routes-redirects-aliases',
    meta: getContentMeta(
      'src/categories/frontend/vue/router/learn/named-routes-redirects-aliases.md',
    ),
    load: async () =>
      (await import('./learn/named-routes-redirects-aliases.md?content-entry')).default,
  },
  {
    slug: 'named-views-route-props',
    meta: getContentMeta('src/categories/frontend/vue/router/learn/named-views-route-props.md'),
    load: async () => (await import('./learn/named-views-route-props.md?content-entry')).default,
  },
  {
    slug: 'navigation-failures',
    meta: getContentMeta('src/categories/frontend/vue/router/learn/navigation-failures.md'),
    load: async () => (await import('./learn/navigation-failures.md?content-entry')).default,
  },
  {
    slug: 'nested-routes',
    meta: getContentMeta('src/categories/frontend/vue/router/learn/nested-routes.md'),
    load: async () => (await import('./learn/nested-routes.md?content-entry')).default,
  },
  {
    slug: 'route-data-fetching',
    meta: getContentMeta('src/categories/frontend/vue/router/learn/route-data-fetching.md'),
    load: async () => (await import('./learn/route-data-fetching.md?content-entry')).default,
  },
  {
    slug: 'route-params-query-matching',
    meta: getContentMeta('src/categories/frontend/vue/router/learn/route-params-query-matching.md'),
    load: async () =>
      (await import('./learn/route-params-query-matching.md?content-entry')).default,
  },
  {
    slug: 'router-link-view-active',
    meta: getContentMeta('src/categories/frontend/vue/router/learn/router-link-view-active.md'),
    load: async () => (await import('./learn/router-link-view-active.md?content-entry')).default,
  },
  {
    slug: 'router-view-slots-transitions',
    meta: getContentMeta(
      'src/categories/frontend/vue/router/learn/router-view-slots-transitions.md',
    ),
    load: async () =>
      (await import('./learn/router-view-slots-transitions.md?content-entry')).default,
  },
  {
    slug: 'scroll-history-deployment',
    meta: getContentMeta('src/categories/frontend/vue/router/learn/scroll-history-deployment.md'),
    load: async () => (await import('./learn/scroll-history-deployment.md?content-entry')).default,
  },
  {
    slug: 'setup-first-router',
    meta: getContentMeta('src/categories/frontend/vue/router/learn/setup-first-router.md'),
    load: async () => (await import('./learn/setup-first-router.md?content-entry')).default,
  },
  {
    slug: 'typed-file-based-routing',
    meta: getContentMeta('src/categories/frontend/vue/router/learn/typed-file-based-routing.md'),
    load: async () => (await import('./learn/typed-file-based-routing.md?content-entry')).default,
  },
  {
    slug: 'create-router',
    meta: getContentMeta('src/categories/frontend/vue/router/reference/create-router.md'),
    load: async () => (await import('./reference/create-router.md?content-entry')).default,
  },
  {
    slug: 'failures',
    meta: getContentMeta('src/categories/frontend/vue/router/reference/failures.md'),
    load: async () => (await import('./reference/failures.md?content-entry')).default,
  },
  {
    slug: 'guards',
    meta: getContentMeta('src/categories/frontend/vue/router/reference/guards.md'),
    load: async () => (await import('./reference/guards.md?content-entry')).default,
  },
  {
    slug: 'history',
    meta: getContentMeta('src/categories/frontend/vue/router/reference/history.md'),
    load: async () => (await import('./reference/history.md?content-entry')).default,
  },
  {
    slug: 'injection-keys',
    meta: getContentMeta('src/categories/frontend/vue/router/reference/injection-keys.md'),
    load: async () => (await import('./reference/injection-keys.md?content-entry')).default,
  },
  {
    slug: 'matcher',
    meta: getContentMeta('src/categories/frontend/vue/router/reference/matcher.md'),
    load: async () => (await import('./reference/matcher.md?content-entry')).default,
  },
  {
    slug: 'navigation',
    meta: getContentMeta('src/categories/frontend/vue/router/reference/navigation.md'),
    load: async () => (await import('./reference/navigation.md?content-entry')).default,
  },
  {
    slug: 'overview',
    meta: getContentMeta('src/categories/frontend/vue/router/reference/overview.md'),
    load: async () => (await import('./reference/overview.md?content-entry')).default,
  },
  {
    slug: 'params-query',
    meta: getContentMeta('src/categories/frontend/vue/router/reference/params-query.md'),
    load: async () => (await import('./reference/params-query.md?content-entry')).default,
  },
  {
    slug: 'route-locations',
    meta: getContentMeta('src/categories/frontend/vue/router/reference/route-locations.md'),
    load: async () => (await import('./reference/route-locations.md?content-entry')).default,
  },
  {
    slug: 'route-map',
    meta: getContentMeta('src/categories/frontend/vue/router/reference/route-map.md'),
    load: async () => (await import('./reference/route-map.md?content-entry')).default,
  },
  {
    slug: 'route-records',
    meta: getContentMeta('src/categories/frontend/vue/router/reference/route-records.md'),
    load: async () => (await import('./reference/route-records.md?content-entry')).default,
  },
  {
    slug: 'router-instance',
    meta: getContentMeta('src/categories/frontend/vue/router/reference/router-instance.md'),
    load: async () => (await import('./reference/router-instance.md?content-entry')).default,
  },
  {
    slug: 'router-link',
    meta: getContentMeta('src/categories/frontend/vue/router/reference/router-link.md'),
    load: async () => (await import('./reference/router-link.md?content-entry')).default,
  },
  {
    slug: 'router-view',
    meta: getContentMeta('src/categories/frontend/vue/router/reference/router-view.md'),
    load: async () => (await import('./reference/router-view.md?content-entry')).default,
  },
  {
    slug: 'unplugin',
    meta: getContentMeta('src/categories/frontend/vue/router/reference/unplugin.md'),
    load: async () => (await import('./reference/unplugin.md?content-entry')).default,
  },
  {
    slug: 'virtual-modules',
    meta: getContentMeta('src/categories/frontend/vue/router/reference/virtual-modules.md'),
    load: async () => (await import('./reference/virtual-modules.md?content-entry')).default,
  },
  {
    slug: 'volar-migration',
    meta: getContentMeta('src/categories/frontend/vue/router/reference/volar-migration.md'),
    load: async () => (await import('./reference/volar-migration.md?content-entry')).default,
  },
  {
    slug: 'watchlist',
    meta: getContentMeta('src/categories/frontend/vue/router/reference/watchlist.md'),
    load: async () => (await import('./reference/watchlist.md?content-entry')).default,
  },
]
