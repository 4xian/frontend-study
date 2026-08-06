import type { CategoryContentEntryManifest } from '@/common/catalog'

import { meta as learnCompositionProgrammaticNavigationMeta } from './learn/composition-programmatic-navigation.md?catalog-meta'
import { meta as learnDynamicRoutingRouterLinkMeta } from './learn/dynamic-routing-router-link.md?catalog-meta'
import { meta as learnLazyLoadingMeta } from './learn/lazy-loading.md?catalog-meta'
import { meta as learnMetaNavigationGuardsMeta } from './learn/meta-navigation-guards.md?catalog-meta'
import { meta as learnNamedRoutesRedirectsAliasesMeta } from './learn/named-routes-redirects-aliases.md?catalog-meta'
import { meta as learnNamedViewsRoutePropsMeta } from './learn/named-views-route-props.md?catalog-meta'
import { meta as learnNavigationFailuresMeta } from './learn/navigation-failures.md?catalog-meta'
import { meta as learnNestedRoutesMeta } from './learn/nested-routes.md?catalog-meta'
import { meta as learnRouteDataFetchingMeta } from './learn/route-data-fetching.md?catalog-meta'
import { meta as learnRouteParamsQueryMatchingMeta } from './learn/route-params-query-matching.md?catalog-meta'
import { meta as learnRouterLinkViewActiveMeta } from './learn/router-link-view-active.md?catalog-meta'
import { meta as learnRouterViewSlotsTransitionsMeta } from './learn/router-view-slots-transitions.md?catalog-meta'
import { meta as learnScrollHistoryDeploymentMeta } from './learn/scroll-history-deployment.md?catalog-meta'
import { meta as learnSetupFirstRouterMeta } from './learn/setup-first-router.md?catalog-meta'
import { meta as learnTypedFileBasedRoutingMeta } from './learn/typed-file-based-routing.md?catalog-meta'
import { meta as referenceCreateRouterMeta } from './reference/create-router.md?catalog-meta'
import { meta as referenceFailuresMeta } from './reference/failures.md?catalog-meta'
import { meta as referenceGuardsMeta } from './reference/guards.md?catalog-meta'
import { meta as referenceHistoryMeta } from './reference/history.md?catalog-meta'
import { meta as referenceInjectionKeysMeta } from './reference/injection-keys.md?catalog-meta'
import { meta as referenceMatcherMeta } from './reference/matcher.md?catalog-meta'
import { meta as referenceNavigationMeta } from './reference/navigation.md?catalog-meta'
import { meta as referenceOverviewMeta } from './reference/overview.md?catalog-meta'
import { meta as referenceParamsQueryMeta } from './reference/params-query.md?catalog-meta'
import { meta as referenceRouteLocationsMeta } from './reference/route-locations.md?catalog-meta'
import { meta as referenceRouteMapMeta } from './reference/route-map.md?catalog-meta'
import { meta as referenceRouteRecordsMeta } from './reference/route-records.md?catalog-meta'
import { meta as referenceRouterInstanceMeta } from './reference/router-instance.md?catalog-meta'
import { meta as referenceRouterLinkMeta } from './reference/router-link.md?catalog-meta'
import { meta as referenceRouterViewMeta } from './reference/router-view.md?catalog-meta'
import { meta as referenceUnpluginMeta } from './reference/unplugin.md?catalog-meta'
import { meta as referenceVirtualModulesMeta } from './reference/virtual-modules.md?catalog-meta'
import { meta as referenceVolarMigrationMeta } from './reference/volar-migration.md?catalog-meta'
import { meta as referenceWatchlistMeta } from './reference/watchlist.md?catalog-meta'

export const vueRouterContentEntries: CategoryContentEntryManifest[] = [
  {
    slug: 'composition-programmatic-navigation',
    meta: learnCompositionProgrammaticNavigationMeta,
    load: async () =>
      (await import('./learn/composition-programmatic-navigation.md?content-entry')).default,
  },
  {
    slug: 'dynamic-routing-router-link',
    meta: learnDynamicRoutingRouterLinkMeta,
    load: async () =>
      (await import('./learn/dynamic-routing-router-link.md?content-entry')).default,
  },
  {
    slug: 'lazy-loading',
    meta: learnLazyLoadingMeta,
    load: async () => (await import('./learn/lazy-loading.md?content-entry')).default,
  },
  {
    slug: 'meta-navigation-guards',
    meta: learnMetaNavigationGuardsMeta,
    load: async () => (await import('./learn/meta-navigation-guards.md?content-entry')).default,
  },
  {
    slug: 'named-routes-redirects-aliases',
    meta: learnNamedRoutesRedirectsAliasesMeta,
    load: async () =>
      (await import('./learn/named-routes-redirects-aliases.md?content-entry')).default,
  },
  {
    slug: 'named-views-route-props',
    meta: learnNamedViewsRoutePropsMeta,
    load: async () => (await import('./learn/named-views-route-props.md?content-entry')).default,
  },
  {
    slug: 'navigation-failures',
    meta: learnNavigationFailuresMeta,
    load: async () => (await import('./learn/navigation-failures.md?content-entry')).default,
  },
  {
    slug: 'nested-routes',
    meta: learnNestedRoutesMeta,
    load: async () => (await import('./learn/nested-routes.md?content-entry')).default,
  },
  {
    slug: 'route-data-fetching',
    meta: learnRouteDataFetchingMeta,
    load: async () => (await import('./learn/route-data-fetching.md?content-entry')).default,
  },
  {
    slug: 'route-params-query-matching',
    meta: learnRouteParamsQueryMatchingMeta,
    load: async () =>
      (await import('./learn/route-params-query-matching.md?content-entry')).default,
  },
  {
    slug: 'router-link-view-active',
    meta: learnRouterLinkViewActiveMeta,
    load: async () => (await import('./learn/router-link-view-active.md?content-entry')).default,
  },
  {
    slug: 'router-view-slots-transitions',
    meta: learnRouterViewSlotsTransitionsMeta,
    load: async () =>
      (await import('./learn/router-view-slots-transitions.md?content-entry')).default,
  },
  {
    slug: 'scroll-history-deployment',
    meta: learnScrollHistoryDeploymentMeta,
    load: async () => (await import('./learn/scroll-history-deployment.md?content-entry')).default,
  },
  {
    slug: 'setup-first-router',
    meta: learnSetupFirstRouterMeta,
    load: async () => (await import('./learn/setup-first-router.md?content-entry')).default,
  },
  {
    slug: 'typed-file-based-routing',
    meta: learnTypedFileBasedRoutingMeta,
    load: async () => (await import('./learn/typed-file-based-routing.md?content-entry')).default,
  },
  {
    slug: 'create-router',
    meta: referenceCreateRouterMeta,
    load: async () => (await import('./reference/create-router.md?content-entry')).default,
  },
  {
    slug: 'failures',
    meta: referenceFailuresMeta,
    load: async () => (await import('./reference/failures.md?content-entry')).default,
  },
  {
    slug: 'guards',
    meta: referenceGuardsMeta,
    load: async () => (await import('./reference/guards.md?content-entry')).default,
  },
  {
    slug: 'history',
    meta: referenceHistoryMeta,
    load: async () => (await import('./reference/history.md?content-entry')).default,
  },
  {
    slug: 'injection-keys',
    meta: referenceInjectionKeysMeta,
    load: async () => (await import('./reference/injection-keys.md?content-entry')).default,
  },
  {
    slug: 'matcher',
    meta: referenceMatcherMeta,
    load: async () => (await import('./reference/matcher.md?content-entry')).default,
  },
  {
    slug: 'navigation',
    meta: referenceNavigationMeta,
    load: async () => (await import('./reference/navigation.md?content-entry')).default,
  },
  {
    slug: 'overview',
    meta: referenceOverviewMeta,
    load: async () => (await import('./reference/overview.md?content-entry')).default,
  },
  {
    slug: 'params-query',
    meta: referenceParamsQueryMeta,
    load: async () => (await import('./reference/params-query.md?content-entry')).default,
  },
  {
    slug: 'route-locations',
    meta: referenceRouteLocationsMeta,
    load: async () => (await import('./reference/route-locations.md?content-entry')).default,
  },
  {
    slug: 'route-map',
    meta: referenceRouteMapMeta,
    load: async () => (await import('./reference/route-map.md?content-entry')).default,
  },
  {
    slug: 'route-records',
    meta: referenceRouteRecordsMeta,
    load: async () => (await import('./reference/route-records.md?content-entry')).default,
  },
  {
    slug: 'router-instance',
    meta: referenceRouterInstanceMeta,
    load: async () => (await import('./reference/router-instance.md?content-entry')).default,
  },
  {
    slug: 'router-link',
    meta: referenceRouterLinkMeta,
    load: async () => (await import('./reference/router-link.md?content-entry')).default,
  },
  {
    slug: 'router-view',
    meta: referenceRouterViewMeta,
    load: async () => (await import('./reference/router-view.md?content-entry')).default,
  },
  {
    slug: 'unplugin',
    meta: referenceUnpluginMeta,
    load: async () => (await import('./reference/unplugin.md?content-entry')).default,
  },
  {
    slug: 'virtual-modules',
    meta: referenceVirtualModulesMeta,
    load: async () => (await import('./reference/virtual-modules.md?content-entry')).default,
  },
  {
    slug: 'volar-migration',
    meta: referenceVolarMigrationMeta,
    load: async () => (await import('./reference/volar-migration.md?content-entry')).default,
  },
  {
    slug: 'watchlist',
    meta: referenceWatchlistMeta,
    load: async () => (await import('./reference/watchlist.md?content-entry')).default,
  },
]
