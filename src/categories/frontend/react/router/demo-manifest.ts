import type { DemoAssetManifest, ReactComponentModule } from '@/common/content/demo-registry'

type DataRouterIntroductionDemoModule = {
  createDataRouterIntroductionDemo: () => ReactComponentModule['default']
}

type RouteObjectsDemoModule = {
  createRouteObjectsDemo: () => ReactComponentModule['default']
}

type RouteMatchingDemoModule = {
  createRouteMatchingDemo: () => ReactComponentModule['default']
}

type LinkNavigationDemoModule = {
  createLinkNavigationDemo: () => ReactComponentModule['default']
}

type NavLinkStateDemoModule = {
  createNavLinkStateDemo: () => ReactComponentModule['default']
}

type NestedRoutesAndOutletDemoModule = {
  createNestedRoutesAndOutletDemo: () => ReactComponentModule['default']
}

type LayoutRoutesDemoModule = {
  createLayoutRoutesDemo: () => ReactComponentModule['default']
}

type IndexRoutesDemoModule = {
  createIndexRoutesDemo: () => ReactComponentModule['default']
}

type DynamicSegmentsDemoModule = {
  createDynamicSegmentsDemo: () => ReactComponentModule['default']
}

type OptionalSegmentsAndSplatsDemoModule = {
  createOptionalSegmentsAndSplatsDemo: () => ReactComponentModule['default']
}

type RouteParamsDemoModule = {
  createRouteParamsDemo: () => ReactComponentModule['default']
}

type QueryParamsAndUrlStateDemoModule = {
  createQueryParamsAndUrlStateDemo: () => ReactComponentModule['default']
}

type ProgrammaticNavigationDemoModule = {
  createProgrammaticNavigationDemo: () => ReactComponentModule['default']
}

type LocationAndHistoryStateDemoModule = {
  createLocationAndHistoryStateDemo: () => ReactComponentModule['default']
}

type MultiPageCourseCenterDemoModule = {
  createCourseCenterDemo: () => ReactComponentModule['default']
}

type NestedDocumentationCenterDemoModule = {
  createDocumentationCenterDemo: () => ReactComponentModule['default']
}

type LoaderDataLoadingDemoModule = {
  createLoaderDataLoadingDemo: () => ReactComponentModule['default']
}

type LoaderRequestsAndRedirectsDemoModule = {
  createLoaderRequestsAndRedirectsDemo: () => ReactComponentModule['default']
}

type RouteDataReadingAndSharingDemoModule = {
  createRouteDataReadingAndSharingDemo: () => ReactComponentModule['default']
}

type NavigationPendingUiDemoModule = {
  createNavigationPendingUiDemo: () => ReactComponentModule['default']
}

type ActionDataSubmissionDemoModule = {
  createActionDataSubmissionDemo: () => ReactComponentModule['default']
}

type ActionResultsAndFormValidationDemoModule = {
  createActionResultsAndFormValidationDemo: () => ReactComponentModule['default']
}

type FormNavigationFormDemoModule = {
  createFormNavigationFormDemo: () => ReactComponentModule['default']
}

type FetcherDemoModule = {
  createFetcherDemo: () => ReactComponentModule['default']
}

type FormFetcherChoiceDemoModule = {
  createFormFetcherChoiceDemo: () => ReactComponentModule['default']
}

type AuthRouteBoundaryDemoModule = {
  createAuthRouteBoundaryDemo: () => ReactComponentModule['default']
}

type RouteMetadataAndBreadcrumbsDemoModule = {
  createRouteMetadataAndBreadcrumbsDemo: () => ReactComponentModule['default']
}

type LazyRoutesDemoModule = {
  createLazyRoutesDemo: () => ReactComponentModule['default']
}

type ContentManagementWorkspaceDemoModule = {
  createContentManagementWorkspaceDemo: () => ReactComponentModule['default']
}

type AuthAdminWorkspaceDemoModule = {
  createAuthAdminWorkspaceDemo: () => ReactComponentModule['default']
}

type OptimisticUiDemoModule = {
  createOptimisticUiDemo: () => ReactComponentModule['default']
}

type NavigationConcurrencyAndCancellationDemoModule = {
  createNavigationConcurrencyAndCancellationDemo: () => ReactComponentModule['default']
}

type RaceConditionsDemoModule = {
  createRaceConditionsDemo: () => ReactComponentModule['default']
}

type RouteStateOwnershipDemoModule = {
  createRouteStateOwnershipDemo: () => ReactComponentModule['default']
}

type CustomDataStrategyDemoModule = {
  createCustomDataStrategyDemo: () => ReactComponentModule['default']
}

type DynamicRouteDiscoveryDemoModule = {
  createDynamicRouteDiscoveryDemo: () => ReactComponentModule['default']
}

type ScrollRestorationDemoModule = {
  createScrollRestorationDemo: () => ReactComponentModule['default']
}

type NavigationBlockingDemoModule = {
  createNavigationBlockingDemo: () => ReactComponentModule['default']
}

type DemoSourceFile = {
  name: string
  load: () => Promise<string>
}

const dataRouterIntroductionFactories = import.meta.glob<DataRouterIntroductionDemoModule>(
  './demos/data-router-introduction/*.tsx',
)
const routeObjectsFactories = import.meta.glob<RouteObjectsDemoModule>(
  './demos/route-objects/*.tsx',
)
const routeMatchingFactories = import.meta.glob<RouteMatchingDemoModule>(
  './demos/route-matching/*.tsx',
)
const linkNavigationFactories = import.meta.glob<LinkNavigationDemoModule>(
  './demos/link-navigation/*.tsx',
)
const navLinkStateFactories = import.meta.glob<NavLinkStateDemoModule>(
  './demos/nav-link-state/*.tsx',
)
const nestedRoutesAndOutletFactories = import.meta.glob<NestedRoutesAndOutletDemoModule>(
  './demos/nested-routes-and-outlet/*.tsx',
)
const layoutRoutesFactories = import.meta.glob<LayoutRoutesDemoModule>(
  './demos/layout-routes/*.tsx',
)
const indexRoutesFactories = import.meta.glob<IndexRoutesDemoModule>('./demos/index-routes/*.tsx')
const dynamicSegmentsFactories = import.meta.glob<DynamicSegmentsDemoModule>(
  './demos/dynamic-segments/*.tsx',
)
const optionalSegmentsAndSplatsFactories = import.meta.glob<OptionalSegmentsAndSplatsDemoModule>(
  './demos/optional-segments-and-splats/*.tsx',
)
const routeParamsFactories = import.meta.glob<RouteParamsDemoModule>('./demos/route-params/*.tsx')
const queryParamsAndUrlStateFactories = import.meta.glob<QueryParamsAndUrlStateDemoModule>(
  './demos/query-params-and-url-state/*.tsx',
)
const programmaticNavigationFactories = import.meta.glob<ProgrammaticNavigationDemoModule>(
  './demos/programmatic-navigation/*.tsx',
)
const locationAndHistoryStateFactories = import.meta.glob<LocationAndHistoryStateDemoModule>(
  './demos/location-and-history-state/*.tsx',
)
const multiPageCourseCenterFactories = import.meta.glob<MultiPageCourseCenterDemoModule>(
  './demos/multi-page-course-center/*.tsx',
)
const nestedDocumentationCenterFactories = import.meta.glob<NestedDocumentationCenterDemoModule>(
  './demos/nested-documentation-center/*.tsx',
)
const loaderDataLoadingFactories = import.meta.glob<LoaderDataLoadingDemoModule>(
  './demos/loader-data-loading/*.tsx',
)
const loaderRequestsAndRedirectsFactories = import.meta.glob<LoaderRequestsAndRedirectsDemoModule>(
  './demos/loader-requests-and-redirects/*.tsx',
)
const routeDataReadingAndSharingFactories = import.meta.glob<RouteDataReadingAndSharingDemoModule>(
  './demos/route-data-reading-and-sharing/*.tsx',
)
const navigationPendingUiFactories = import.meta.glob<NavigationPendingUiDemoModule>(
  './demos/navigation-pending-ui/*.tsx',
)
const actionDataSubmissionFactories = import.meta.glob<ActionDataSubmissionDemoModule>(
  './demos/action-data-submission/*.tsx',
)
const actionResultsAndFormValidationFactories =
  import.meta.glob<ActionResultsAndFormValidationDemoModule>(
    './demos/action-results-and-form-validation/*.tsx',
  )
const formNavigationFormFactories = import.meta.glob<FormNavigationFormDemoModule>(
  './demos/form-navigation-form/*.tsx',
)
const fetcherFactories = import.meta.glob<FetcherDemoModule>('./demos/fetcher/*.tsx')
const formFetcherChoiceFactories = import.meta.glob<FormFetcherChoiceDemoModule>(
  './demos/form-fetcher-choice/*.tsx',
)
const revalidationFactories = import.meta.glob<{
  createRevalidationDemo: () => ReactComponentModule['default']
}>('./demos/revalidation/*.tsx')
const routeErrorBoundaryFactories = import.meta.glob<{
  createRouteErrorBoundaryDemo: () => ReactComponentModule['default']
}>('./demos/route-error-boundary/*.tsx')
const authRouteBoundaryFactories = import.meta.glob<AuthRouteBoundaryDemoModule>(
  './demos/auth-route-boundary/*.tsx',
)
const routeMetadataAndBreadcrumbsFactories =
  import.meta.glob<RouteMetadataAndBreadcrumbsDemoModule>(
    './demos/route-metadata-and-breadcrumbs/*.tsx',
  )
const lazyRoutesFactories = import.meta.glob<LazyRoutesDemoModule>('./demos/lazy-routes/*.tsx')
const contentManagementWorkspaceFactories = import.meta.glob<ContentManagementWorkspaceDemoModule>(
  './demos/content-management-workspace/*.tsx',
)
const authAdminWorkspaceFactories = import.meta.glob<AuthAdminWorkspaceDemoModule>(
  './demos/auth-admin-workspace/*.tsx',
)
const optimisticUiFactories = import.meta.glob<OptimisticUiDemoModule>(
  './demos/optimistic-ui/*.tsx',
)
const navigationConcurrencyAndCancellationFactories =
  import.meta.glob<NavigationConcurrencyAndCancellationDemoModule>(
    './demos/navigation-concurrency-and-cancellation/*.tsx',
  )
const raceConditionsFactories = import.meta.glob<RaceConditionsDemoModule>(
  './demos/race-conditions/*.tsx',
)
const routeStateOwnershipFactories = import.meta.glob<RouteStateOwnershipDemoModule>(
  './demos/route-state-ownership/*.tsx',
)
const customDataStrategyFactories = import.meta.glob<CustomDataStrategyDemoModule>(
  './demos/custom-data-strategy/*.tsx',
)
const dynamicRouteDiscoveryFactories = import.meta.glob<DynamicRouteDiscoveryDemoModule>(
  './demos/dynamic-route-discovery/*.tsx',
)
const scrollRestorationFactories = import.meta.glob<ScrollRestorationDemoModule>(
  './demos/scroll-restoration/*.tsx',
)
const navigationBlockingFactories = import.meta.glob<NavigationBlockingDemoModule>(
  './demos/navigation-blocking/*.tsx',
)
const demoSources = import.meta.glob<string>('./demos/**/*.tsx', {
  query: '?raw',
  import: 'default',
})
const demoTypeScriptSources = import.meta.glob<string>('./demos/**/*.ts', {
  query: '?raw',
  import: 'default',
})
const demoStyleSources = import.meta.glob<string>('./demos/**/*.css', {
  query: '?raw',
  import: 'default',
})

const dataRouterIntroductionSourceFiles = [
  {
    name: 'data-router-introduction-demo.tsx',
    load: demoSources['./demos/data-router-introduction/data-router-introduction-demo.tsx']!,
  },
  {
    name: 'data-router-introduction-demo.css',
    load: demoStyleSources['./demos/data-router-introduction/data-router-introduction-demo.css']!,
  },
] as const

const routeObjectsSourceFiles = [
  {
    name: 'route-objects-demo.tsx',
    load: demoSources['./demos/route-objects/route-objects-demo.tsx']!,
  },
  {
    name: 'route-objects-demo.css',
    load: demoStyleSources['./demos/route-objects/route-objects-demo.css']!,
  },
] as const

const routeMatchingSourceFiles = [
  {
    name: 'route-matching-demo.tsx',
    load: demoSources['./demos/route-matching/route-matching-demo.tsx']!,
  },
  {
    name: 'route-matching-demo.css',
    load: demoStyleSources['./demos/route-matching/route-matching-demo.css']!,
  },
] as const

const linkNavigationSourceFiles = [
  {
    name: 'link-navigation-demo.tsx',
    load: demoSources['./demos/link-navigation/link-navigation-demo.tsx']!,
  },
  {
    name: 'link-navigation-demo.css',
    load: demoStyleSources['./demos/link-navigation/link-navigation-demo.css']!,
  },
] as const

const navLinkStateSourceFiles = [
  {
    name: 'nav-link-state-demo.tsx',
    load: demoSources['./demos/nav-link-state/nav-link-state-demo.tsx']!,
  },
  {
    name: 'nav-link-state-demo.css',
    load: demoStyleSources['./demos/nav-link-state/nav-link-state-demo.css']!,
  },
] as const

const nestedRoutesAndOutletSourceFiles = [
  {
    name: 'nested-routes-and-outlet-demo.tsx',
    load: demoSources['./demos/nested-routes-and-outlet/nested-routes-and-outlet-demo.tsx']!,
  },
  {
    name: 'nested-routes-and-outlet-demo.css',
    load: demoStyleSources['./demos/nested-routes-and-outlet/nested-routes-and-outlet-demo.css']!,
  },
] as const

const layoutRoutesSourceFiles = [
  {
    name: 'layout-routes-demo.tsx',
    load: demoSources['./demos/layout-routes/layout-routes-demo.tsx']!,
  },
  {
    name: 'layout-routes-demo.css',
    load: demoStyleSources['./demos/layout-routes/layout-routes-demo.css']!,
  },
] as const

const indexRoutesSourceFiles = [
  {
    name: 'index-routes-demo.tsx',
    load: demoSources['./demos/index-routes/index-routes-demo.tsx']!,
  },
  {
    name: 'index-routes-demo.css',
    load: demoStyleSources['./demos/index-routes/index-routes-demo.css']!,
  },
] as const

const dynamicSegmentsSourceFiles = [
  {
    name: 'dynamic-segments-demo.tsx',
    load: demoSources['./demos/dynamic-segments/dynamic-segments-demo.tsx']!,
  },
  {
    name: 'dynamic-segments-demo.css',
    load: demoStyleSources['./demos/dynamic-segments/dynamic-segments-demo.css']!,
  },
] as const

const optionalSegmentsAndSplatsSourceFiles = [
  {
    name: 'optional-segments-and-splats-demo.tsx',
    load: demoSources[
      './demos/optional-segments-and-splats/optional-segments-and-splats-demo.tsx'
    ]!,
  },
  {
    name: 'optional-segments-and-splats-demo.css',
    load: demoStyleSources[
      './demos/optional-segments-and-splats/optional-segments-and-splats-demo.css'
    ]!,
  },
] as const

const routeParamsSourceFiles = [
  {
    name: 'route-params-demo.tsx',
    load: demoSources['./demos/route-params/route-params-demo.tsx']!,
  },
  {
    name: 'route-params-demo.css',
    load: demoStyleSources['./demos/route-params/route-params-demo.css']!,
  },
] as const

const queryParamsAndUrlStateSourceFiles = [
  {
    name: 'query-params-and-url-state-demo.tsx',
    load: demoSources['./demos/query-params-and-url-state/query-params-and-url-state-demo.tsx']!,
  },
  {
    name: 'query-params-and-url-state-demo.css',
    load: demoStyleSources[
      './demos/query-params-and-url-state/query-params-and-url-state-demo.css'
    ]!,
  },
] as const

const programmaticNavigationSourceFiles = [
  {
    name: 'programmatic-navigation-demo.tsx',
    load: demoSources['./demos/programmatic-navigation/programmatic-navigation-demo.tsx']!,
  },
  {
    name: 'programmatic-navigation-demo.css',
    load: demoStyleSources['./demos/programmatic-navigation/programmatic-navigation-demo.css']!,
  },
] as const

const locationAndHistoryStateSourceFiles = [
  {
    name: 'location-and-history-state-demo.tsx',
    load: demoSources['./demos/location-and-history-state/location-and-history-state-demo.tsx']!,
  },
  {
    name: 'location-and-history-state-demo.css',
    load: demoStyleSources[
      './demos/location-and-history-state/location-and-history-state-demo.css'
    ]!,
  },
] as const

const multiPageCourseCenterSourceFiles = [
  {
    name: 'course-center-demo.tsx',
    load: demoSources['./demos/multi-page-course-center/course-center-demo.tsx']!,
  },
  {
    name: 'course-center-demo.css',
    load: demoStyleSources['./demos/multi-page-course-center/course-center-demo.css']!,
  },
] as const

const nestedDocumentationCenterSourceFiles = [
  {
    name: 'documentation-center-demo.tsx',
    load: demoSources['./demos/nested-documentation-center/documentation-center-demo.tsx']!,
  },
  {
    name: 'documentation-center-demo.css',
    load: demoStyleSources['./demos/nested-documentation-center/documentation-center-demo.css']!,
  },
] as const

const loaderDataLoadingSourceFiles = [
  {
    name: 'loader-data-loading-demo.tsx',
    load: demoSources['./demos/loader-data-loading/loader-data-loading-demo.tsx']!,
  },
  {
    name: 'loader-data-loading-demo.css',
    load: demoStyleSources['./demos/loader-data-loading/loader-data-loading-demo.css']!,
  },
] as const

const loaderRequestsAndRedirectsSourceFiles = [
  {
    name: 'loader-requests-and-redirects-demo.tsx',
    load: demoSources[
      './demos/loader-requests-and-redirects/loader-requests-and-redirects-demo.tsx'
    ]!,
  },
  {
    name: 'loader-requests-and-redirects-demo.css',
    load: demoStyleSources[
      './demos/loader-requests-and-redirects/loader-requests-and-redirects-demo.css'
    ]!,
  },
] as const

const routeDataReadingAndSharingSourceFiles = [
  {
    name: 'route-data-reading-and-sharing-demo.tsx',
    load: demoSources[
      './demos/route-data-reading-and-sharing/route-data-reading-and-sharing-demo.tsx'
    ]!,
  },
  {
    name: 'route-data-reading-and-sharing-demo.css',
    load: demoStyleSources[
      './demos/route-data-reading-and-sharing/route-data-reading-and-sharing-demo.css'
    ]!,
  },
] as const

const navigationPendingUiSourceFiles = [
  {
    name: 'navigation-pending-ui-demo.tsx',
    load: demoSources['./demos/navigation-pending-ui/navigation-pending-ui-demo.tsx']!,
  },
  {
    name: 'navigation-pending-ui-demo.css',
    load: demoStyleSources['./demos/navigation-pending-ui/navigation-pending-ui-demo.css']!,
  },
] as const

const actionDataSubmissionSourceFiles = [
  {
    name: 'action-data-submission-demo.tsx',
    load: demoSources['./demos/action-data-submission/action-data-submission-demo.tsx']!,
  },
  {
    name: 'action-data-submission-demo.css',
    load: demoStyleSources['./demos/action-data-submission/action-data-submission-demo.css']!,
  },
] as const

const actionResultsAndFormValidationSourceFiles = [
  {
    name: 'action-results-and-form-validation-demo.tsx',
    load: demoSources[
      './demos/action-results-and-form-validation/action-results-and-form-validation-demo.tsx'
    ]!,
  },
  {
    name: 'action-results-and-form-validation-demo.css',
    load: demoStyleSources[
      './demos/action-results-and-form-validation/action-results-and-form-validation-demo.css'
    ]!,
  },
] as const

const formNavigationFormSourceFiles = [
  {
    name: 'form-navigation-form-demo.tsx',
    load: demoSources['./demos/form-navigation-form/form-navigation-form-demo.tsx']!,
  },
  {
    name: 'form-navigation-form-demo.css',
    load: demoStyleSources['./demos/form-navigation-form/form-navigation-form-demo.css']!,
  },
] as const

const fetcherSourceFiles = [
  {
    name: 'fetcher-demo.tsx',
    load: demoSources['./demos/fetcher/fetcher-demo.tsx']!,
  },
  {
    name: 'fetcher-demo.css',
    load: demoStyleSources['./demos/fetcher/fetcher-demo.css']!,
  },
] as const

const formFetcherChoiceSourceFiles = [
  {
    name: 'form-fetcher-choice-demo.tsx',
    load: demoSources['./demos/form-fetcher-choice/form-fetcher-choice-demo.tsx']!,
  },
  {
    name: 'form-fetcher-choice-demo.css',
    load: demoStyleSources['./demos/form-fetcher-choice/form-fetcher-choice-demo.css']!,
  },
] as const

const revalidationSourceFiles = [
  {
    name: 'revalidation-demo.tsx',
    load: demoSources['./demos/revalidation/revalidation-demo.tsx']!,
  },
  {
    name: 'revalidation-demo.css',
    load: demoStyleSources['./demos/revalidation/revalidation-demo.css']!,
  },
] as const

const routeErrorBoundarySourceFiles = [
  {
    name: 'route-error-boundary-demo.tsx',
    load: demoSources['./demos/route-error-boundary/route-error-boundary-demo.tsx']!,
  },
  {
    name: 'route-error-boundary-demo.css',
    load: demoStyleSources['./demos/route-error-boundary/route-error-boundary-demo.css']!,
  },
] as const

const authRouteBoundarySourceFiles = [
  {
    name: 'auth-route-boundary-demo.tsx',
    load: demoSources['./demos/auth-route-boundary/auth-route-boundary-demo.tsx']!,
  },
  {
    name: 'auth-route-boundary-demo.css',
    load: demoStyleSources['./demos/auth-route-boundary/auth-route-boundary-demo.css']!,
  },
] as const

const routeMetadataAndBreadcrumbsSourceFiles = [
  {
    name: 'route-metadata-and-breadcrumbs-demo.tsx',
    load: demoSources[
      './demos/route-metadata-and-breadcrumbs/route-metadata-and-breadcrumbs-demo.tsx'
    ]!,
  },
  {
    name: 'route-metadata-and-breadcrumbs-demo.css',
    load: demoStyleSources[
      './demos/route-metadata-and-breadcrumbs/route-metadata-and-breadcrumbs-demo.css'
    ]!,
  },
] as const

const lazyRoutesSourceFiles = [
  {
    name: 'lazy-routes-demo.tsx',
    load: demoSources['./demos/lazy-routes/lazy-routes-demo.tsx']!,
  },
  {
    name: 'lazy-reports-route.tsx',
    load: demoSources['./demos/lazy-routes/lazy-reports-route.tsx']!,
  },
  {
    name: 'lazy-settings-route.tsx',
    load: demoSources['./demos/lazy-routes/lazy-settings-route.tsx']!,
  },
  {
    name: 'lazy-routes-demo.css',
    load: demoStyleSources['./demos/lazy-routes/lazy-routes-demo.css']!,
  },
] as const

const contentManagementWorkspaceSourceFiles = [
  {
    name: 'content-management-workspace-demo.tsx',
    load: demoSources[
      './demos/content-management-workspace/content-management-workspace-demo.tsx'
    ]!,
  },
  {
    name: 'content-management-workspace-data.ts',
    load: demoTypeScriptSources[
      './demos/content-management-workspace/content-management-workspace-data.ts'
    ]!,
  },
  {
    name: 'content-detail-route.tsx',
    load: demoSources['./demos/content-management-workspace/content-detail-route.tsx']!,
  },
  {
    name: 'content-management-workspace-demo.css',
    load: demoStyleSources[
      './demos/content-management-workspace/content-management-workspace-demo.css'
    ]!,
  },
] as const

const authAdminWorkspaceSourceFiles = [
  {
    name: 'auth-admin-workspace-demo.tsx',
    load: demoSources['./demos/auth-admin-workspace/auth-admin-workspace-demo.tsx']!,
  },
  {
    name: 'auth-admin-workspace-demo.css',
    load: demoStyleSources['./demos/auth-admin-workspace/auth-admin-workspace-demo.css']!,
  },
] as const

const optimisticUiSourceFiles = [
  {
    name: 'optimistic-ui-demo.tsx',
    load: demoSources['./demos/optimistic-ui/optimistic-ui-demo.tsx']!,
  },
  {
    name: 'optimistic-ui-demo.css',
    load: demoStyleSources['./demos/optimistic-ui/optimistic-ui-demo.css']!,
  },
] as const

const navigationConcurrencyAndCancellationSourceFiles = [
  {
    name: 'navigation-concurrency-and-cancellation-demo.tsx',
    load: demoSources[
      './demos/navigation-concurrency-and-cancellation/navigation-concurrency-and-cancellation-demo.tsx'
    ]!,
  },
  {
    name: 'navigation-concurrency-and-cancellation-demo.css',
    load: demoStyleSources[
      './demos/navigation-concurrency-and-cancellation/navigation-concurrency-and-cancellation-demo.css'
    ]!,
  },
] as const

const raceConditionsSourceFiles = [
  {
    name: 'race-conditions-demo.tsx',
    load: demoSources['./demos/race-conditions/race-conditions-demo.tsx']!,
  },
  {
    name: 'race-conditions-demo.css',
    load: demoStyleSources['./demos/race-conditions/race-conditions-demo.css']!,
  },
] as const

const routeStateOwnershipSourceFiles = [
  {
    name: 'route-state-ownership-demo.tsx',
    load: demoSources['./demos/route-state-ownership/route-state-ownership-demo.tsx']!,
  },
  {
    name: 'route-state-ownership-demo.css',
    load: demoStyleSources['./demos/route-state-ownership/route-state-ownership-demo.css']!,
  },
] as const

const customDataStrategySourceFiles = [
  {
    name: 'custom-data-strategy-demo.tsx',
    load: demoSources['./demos/custom-data-strategy/custom-data-strategy-demo.tsx']!,
  },
  {
    name: 'custom-data-strategy-demo.css',
    load: demoStyleSources['./demos/custom-data-strategy/custom-data-strategy-demo.css']!,
  },
] as const

const dynamicRouteDiscoverySourceFiles = [
  {
    name: 'dynamic-route-discovery-demo.tsx',
    load: demoSources['./demos/dynamic-route-discovery/dynamic-route-discovery-demo.tsx']!,
  },
  {
    name: 'dynamic-route-discovery-demo.css',
    load: demoStyleSources['./demos/dynamic-route-discovery/dynamic-route-discovery-demo.css']!,
  },
] as const

const scrollRestorationSourceFiles = [
  {
    name: 'scroll-restoration-demo.tsx',
    load: demoSources['./demos/scroll-restoration/scroll-restoration-demo.tsx']!,
  },
  {
    name: 'scroll-restoration-demo.css',
    load: demoStyleSources['./demos/scroll-restoration/scroll-restoration-demo.css']!,
  },
] as const

const navigationBlockingSourceFiles = [
  {
    name: 'navigation-blocking-demo.tsx',
    load: demoSources['./demos/navigation-blocking/navigation-blocking-demo.tsx']!,
  },
  {
    name: 'navigation-blocking-demo.css',
    load: demoStyleSources['./demos/navigation-blocking/navigation-blocking-demo.css']!,
  },
] as const

/** 合并一组 Demo 文件的真实源码。 */
async function loadDemoSource(sourceFiles: readonly DemoSourceFile[]): Promise<string> {
  const sources = await Promise.all(
    sourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并 Data Router 入门 Demo 的组件与样式源码。 */
async function loadDataRouterIntroductionSource(): Promise<string> {
  return loadDemoSource(dataRouterIntroductionSourceFiles)
}

/** 为每次宿主挂载创建独立的内存路由 Demo 组件。 */
async function loadDataRouterIntroductionComponent(): Promise<ReactComponentModule> {
  const { createDataRouterIntroductionDemo } =
    await dataRouterIntroductionFactories[
      './demos/data-router-introduction/data-router-introduction-demo.tsx'
    ]!()
  return { default: createDataRouterIntroductionDemo() }
}

/** 合并路由对象 Demo 的组件与样式源码。 */
async function loadRouteObjectsSource(): Promise<string> {
  return loadDemoSource(routeObjectsSourceFiles)
}

/** 为每次宿主挂载创建路由对象观察组件。 */
async function loadRouteObjectsComponent(): Promise<ReactComponentModule> {
  const { createRouteObjectsDemo } =
    await routeObjectsFactories['./demos/route-objects/route-objects-demo.tsx']!()
  return { default: createRouteObjectsDemo() }
}

/** 合并路由匹配 Demo 的组件与样式源码。 */
async function loadRouteMatchingSource(): Promise<string> {
  return loadDemoSource(routeMatchingSourceFiles)
}

/** 为 React 宿主加载路由匹配观察组件。 */
async function loadRouteMatchingComponent(): Promise<ReactComponentModule> {
  const { createRouteMatchingDemo } =
    await routeMatchingFactories['./demos/route-matching/route-matching-demo.tsx']!()
  return { default: createRouteMatchingDemo() }
}

/** 合并 Link 导航 Demo 的组件与样式源码。 */
async function loadLinkNavigationSource(): Promise<string> {
  return loadDemoSource(linkNavigationSourceFiles)
}

/** 为每次宿主挂载创建独立的 Link 内存路由 Demo 组件。 */
async function loadLinkNavigationComponent(): Promise<ReactComponentModule> {
  const { createLinkNavigationDemo } =
    await linkNavigationFactories['./demos/link-navigation/link-navigation-demo.tsx']!()
  return { default: createLinkNavigationDemo() }
}

/** 合并 NavLink 状态 Demo 的组件与样式源码。 */
async function loadNavLinkStateSource(): Promise<string> {
  return loadDemoSource(navLinkStateSourceFiles)
}

/** 为每次宿主挂载创建独立的 NavLink 内存路由 Demo。 */
async function loadNavLinkStateComponent(): Promise<ReactComponentModule> {
  const { createNavLinkStateDemo } =
    await navLinkStateFactories['./demos/nav-link-state/nav-link-state-demo.tsx']!()
  return { default: createNavLinkStateDemo() }
}

/** 合并嵌套路由与 Outlet Demo 的组件与样式源码。 */
async function loadNestedRoutesAndOutletSource(): Promise<string> {
  return loadDemoSource(nestedRoutesAndOutletSourceFiles)
}

/** 为每次宿主挂载创建独立的嵌套路由 Demo。 */
async function loadNestedRoutesAndOutletComponent(): Promise<ReactComponentModule> {
  const { createNestedRoutesAndOutletDemo } =
    await nestedRoutesAndOutletFactories[
      './demos/nested-routes-and-outlet/nested-routes-and-outlet-demo.tsx'
    ]!()
  return { default: createNestedRoutesAndOutletDemo() }
}

/** 合并布局路由 Demo 的组件与样式源码。 */
async function loadLayoutRoutesSource(): Promise<string> {
  return loadDemoSource(layoutRoutesSourceFiles)
}

/** 为每次宿主挂载创建独立的布局路由 Demo。 */
async function loadLayoutRoutesComponent(): Promise<ReactComponentModule> {
  const { createLayoutRoutesDemo } =
    await layoutRoutesFactories['./demos/layout-routes/layout-routes-demo.tsx']!()
  return { default: createLayoutRoutesDemo() }
}

/** 合并索引路由 Demo 的组件与样式源码。 */
async function loadIndexRoutesSource(): Promise<string> {
  return loadDemoSource(indexRoutesSourceFiles)
}

/** 为每次宿主挂载创建独立的索引路由 Demo。 */
async function loadIndexRoutesComponent(): Promise<ReactComponentModule> {
  const { createIndexRoutesDemo } =
    await indexRoutesFactories['./demos/index-routes/index-routes-demo.tsx']!()
  return { default: createIndexRoutesDemo() }
}

/** 合并动态路由段 Demo 的组件与样式源码。 */
async function loadDynamicSegmentsSource(): Promise<string> {
  return loadDemoSource(dynamicSegmentsSourceFiles)
}

/** 为每次宿主挂载创建独立的动态路由段 Demo。 */
async function loadDynamicSegmentsComponent(): Promise<ReactComponentModule> {
  const { createDynamicSegmentsDemo } =
    await dynamicSegmentsFactories['./demos/dynamic-segments/dynamic-segments-demo.tsx']!()
  return { default: createDynamicSegmentsDemo() }
}

/** 合并可选段与通配路由 Demo 的组件与样式源码。 */
async function loadOptionalSegmentsAndSplatsSource(): Promise<string> {
  return loadDemoSource(optionalSegmentsAndSplatsSourceFiles)
}

/** 为每次宿主挂载创建独立的可选段与通配路由 Demo。 */
async function loadOptionalSegmentsAndSplatsComponent(): Promise<ReactComponentModule> {
  const { createOptionalSegmentsAndSplatsDemo } =
    await optionalSegmentsAndSplatsFactories[
      './demos/optional-segments-and-splats/optional-segments-and-splats-demo.tsx'
    ]!()
  return { default: createOptionalSegmentsAndSplatsDemo() }
}

/** 合并路由参数 Demo 的组件与样式源码。 */
async function loadRouteParamsSource(): Promise<string> {
  return loadDemoSource(routeParamsSourceFiles)
}

/** 为每次宿主挂载创建独立的路由参数 Demo。 */
async function loadRouteParamsComponent(): Promise<ReactComponentModule> {
  const { createRouteParamsDemo } =
    await routeParamsFactories['./demos/route-params/route-params-demo.tsx']!()
  return { default: createRouteParamsDemo() }
}

/** 合并查询参数与 URL 状态 Demo 的组件与样式源码。 */
async function loadQueryParamsAndUrlStateSource(): Promise<string> {
  return loadDemoSource(queryParamsAndUrlStateSourceFiles)
}

/** 为每次宿主挂载创建独立的查询参数 Demo。 */
async function loadQueryParamsAndUrlStateComponent(): Promise<ReactComponentModule> {
  const { createQueryParamsAndUrlStateDemo } =
    await queryParamsAndUrlStateFactories[
      './demos/query-params-and-url-state/query-params-and-url-state-demo.tsx'
    ]!()
  return { default: createQueryParamsAndUrlStateDemo() }
}

/** 合并编程式导航 Demo 的组件与样式源码。 */
async function loadProgrammaticNavigationSource(): Promise<string> {
  return loadDemoSource(programmaticNavigationSourceFiles)
}

/** 为每次宿主挂载创建独立的编程式导航 Demo。 */
async function loadProgrammaticNavigationComponent(): Promise<ReactComponentModule> {
  const { createProgrammaticNavigationDemo } =
    await programmaticNavigationFactories[
      './demos/programmatic-navigation/programmatic-navigation-demo.tsx'
    ]!()
  return { default: createProgrammaticNavigationDemo() }
}

/** 合并 Location 与历史状态 Demo 的组件与样式源码。 */
async function loadLocationAndHistoryStateSource(): Promise<string> {
  return loadDemoSource(locationAndHistoryStateSourceFiles)
}

/** 为每次宿主挂载创建独立的 Location 与历史状态 Demo。 */
async function loadLocationAndHistoryStateComponent(): Promise<ReactComponentModule> {
  const { createLocationAndHistoryStateDemo } =
    await locationAndHistoryStateFactories[
      './demos/location-and-history-state/location-and-history-state-demo.tsx'
    ]!()
  return { default: createLocationAndHistoryStateDemo() }
}

/** 合并多页面课程中心 Demo 的组件与样式源码。 */
async function loadMultiPageCourseCenterSource(): Promise<string> {
  return loadDemoSource(multiPageCourseCenterSourceFiles)
}

/** 为每次宿主挂载创建独立的多页面课程中心 Demo。 */
async function loadMultiPageCourseCenterComponent(): Promise<ReactComponentModule> {
  const { createCourseCenterDemo } =
    await multiPageCourseCenterFactories[
      './demos/multi-page-course-center/course-center-demo.tsx'
    ]!()
  return { default: createCourseCenterDemo() }
}

/** 合并嵌套文档中心 Demo 的组件与样式源码。 */
async function loadNestedDocumentationCenterSource(): Promise<string> {
  return loadDemoSource(nestedDocumentationCenterSourceFiles)
}

/** 为每次宿主挂载创建独立的嵌套文档中心 Demo。 */
async function loadNestedDocumentationCenterComponent(): Promise<ReactComponentModule> {
  const { createDocumentationCenterDemo } =
    await nestedDocumentationCenterFactories[
      './demos/nested-documentation-center/documentation-center-demo.tsx'
    ]!()
  return { default: createDocumentationCenterDemo() }
}

/** 合并 Loader 数据加载 Demo 的组件与样式源码。 */
async function loadLoaderDataLoadingSource(): Promise<string> {
  return loadDemoSource(loaderDataLoadingSourceFiles)
}

/** 为每次宿主挂载创建独立的 Loader 数据观察台。 */
async function loadLoaderDataLoadingComponent(): Promise<ReactComponentModule> {
  const { createLoaderDataLoadingDemo } =
    await loaderDataLoadingFactories['./demos/loader-data-loading/loader-data-loading-demo.tsx']!()
  return { default: createLoaderDataLoadingDemo() }
}

/** 合并 Loader 请求与重定向 Demo 的组件与样式源码。 */
async function loadLoaderRequestsAndRedirectsSource(): Promise<string> {
  return loadDemoSource(loaderRequestsAndRedirectsSourceFiles)
}

/** 为每次宿主挂载创建独立的 Loader 请求与导航观察台。 */
async function loadLoaderRequestsAndRedirectsComponent(): Promise<ReactComponentModule> {
  const { createLoaderRequestsAndRedirectsDemo } =
    await loaderRequestsAndRedirectsFactories[
      './demos/loader-requests-and-redirects/loader-requests-and-redirects-demo.tsx'
    ]!()
  return { default: createLoaderRequestsAndRedirectsDemo() }
}

/** 合并路由数据读取 Demo 的组件与样式源码。 */
async function loadRouteDataReadingAndSharingSource(): Promise<string> {
  return loadDemoSource(routeDataReadingAndSharingSourceFiles)
}

/** 为每次宿主挂载创建独立的路由数据读取与共享观察台。 */
async function loadRouteDataReadingAndSharingComponent(): Promise<ReactComponentModule> {
  const { createRouteDataReadingAndSharingDemo } =
    await routeDataReadingAndSharingFactories[
      './demos/route-data-reading-and-sharing/route-data-reading-and-sharing-demo.tsx'
    ]!()
  return { default: createRouteDataReadingAndSharingDemo() }
}

/** 合并导航 Pending UI Demo 的组件与样式源码。 */
async function loadNavigationPendingUiSource(): Promise<string> {
  return loadDemoSource(navigationPendingUiSourceFiles)
}

/** 为每次宿主挂载创建独立的导航 Pending UI 观察台。 */
async function loadNavigationPendingUiComponent(): Promise<ReactComponentModule> {
  const { createNavigationPendingUiDemo } =
    await navigationPendingUiFactories[
      './demos/navigation-pending-ui/navigation-pending-ui-demo.tsx'
    ]!()
  return { default: createNavigationPendingUiDemo() }
}

/** 合并 Action 数据提交 Demo 的组件与样式源码。 */
async function loadActionDataSubmissionSource(): Promise<string> {
  return loadDemoSource(actionDataSubmissionSourceFiles)
}

/** 为每次宿主挂载创建独立的 Action 数据提交观察台。 */
async function loadActionDataSubmissionComponent(): Promise<ReactComponentModule> {
  const { createActionDataSubmissionDemo } =
    await actionDataSubmissionFactories[
      './demos/action-data-submission/action-data-submission-demo.tsx'
    ]!()
  return { default: createActionDataSubmissionDemo() }
}

/** 合并 Action 结果与表单校验 Demo 的组件与样式源码。 */
async function loadActionResultsAndFormValidationSource(): Promise<string> {
  return loadDemoSource(actionResultsAndFormValidationSourceFiles)
}

/** 为每次宿主挂载创建独立的 Action 结果与表单校验观察台。 */
async function loadActionResultsAndFormValidationComponent(): Promise<ReactComponentModule> {
  const { createActionResultsAndFormValidationDemo } =
    await actionResultsAndFormValidationFactories[
      './demos/action-results-and-form-validation/action-results-and-form-validation-demo.tsx'
    ]!()
  return { default: createActionResultsAndFormValidationDemo() }
}

/** 合并 Form 导航表单 Demo 的组件与样式源码。 */
async function loadFormNavigationFormSource(): Promise<string> {
  return loadDemoSource(formNavigationFormSourceFiles)
}

/** 为每次宿主挂载创建独立的 Form 导航表单观察台。 */
async function loadFormNavigationFormComponent(): Promise<ReactComponentModule> {
  const { createFormNavigationFormDemo } =
    await formNavigationFormFactories[
      './demos/form-navigation-form/form-navigation-form-demo.tsx'
    ]!()
  return { default: createFormNavigationFormDemo() }
}

/** 合并 Fetcher Demo 的组件与样式源码。 */
async function loadFetcherSource(): Promise<string> {
  return loadDemoSource(fetcherSourceFiles)
}

/** 为每次宿主挂载创建独立的 Fetcher 局部数据工作台。 */
async function loadFetcherComponent(): Promise<ReactComponentModule> {
  const { createFetcherDemo } = await fetcherFactories['./demos/fetcher/fetcher-demo.tsx']!()
  return { default: createFetcherDemo() }
}

/** 合并 Form 与 Fetcher 选择 Demo 的组件与样式源码。 */
async function loadFormFetcherChoiceSource(): Promise<string> {
  return loadDemoSource(formFetcherChoiceSourceFiles)
}

/** 为每次宿主挂载创建独立的 Form 与 Fetcher 选择观察台。 */
async function loadFormFetcherChoiceComponent(): Promise<ReactComponentModule> {
  const { createFormFetcherChoiceDemo } =
    await formFetcherChoiceFactories['./demos/form-fetcher-choice/form-fetcher-choice-demo.tsx']!()
  return { default: createFormFetcherChoiceDemo() }
}

/** 合并 Revalidation Demo 的组件与样式源码。 */
async function loadRevalidationSource(): Promise<string> {
  return loadDemoSource(revalidationSourceFiles)
}

/** 为每次宿主挂载创建独立的 Revalidation 观察台。 */
async function loadRevalidationComponent(): Promise<ReactComponentModule> {
  const { createRevalidationDemo } =
    await revalidationFactories['./demos/revalidation/revalidation-demo.tsx']!()
  return { default: createRevalidationDemo() }
}

/** 合并 Route Error Boundary Demo 的组件与样式源码。 */
async function loadRouteErrorBoundarySource(): Promise<string> {
  return loadDemoSource(routeErrorBoundarySourceFiles)
}

/** 为每次宿主挂载创建独立的 Route Error Boundary 观察台。 */
async function loadRouteErrorBoundaryComponent(): Promise<ReactComponentModule> {
  const { createRouteErrorBoundaryDemo } =
    await routeErrorBoundaryFactories[
      './demos/route-error-boundary/route-error-boundary-demo.tsx'
    ]!()
  return { default: createRouteErrorBoundaryDemo() }
}

/** 合并鉴权路由边界 Demo 的组件与样式源码。 */
async function loadAuthRouteBoundarySource(): Promise<string> {
  return loadDemoSource(authRouteBoundarySourceFiles)
}

/** 为每次宿主挂载创建独立的鉴权路由边界观察台。 */
async function loadAuthRouteBoundaryComponent(): Promise<ReactComponentModule> {
  const { createAuthRouteBoundaryDemo } =
    await authRouteBoundaryFactories['./demos/auth-route-boundary/auth-route-boundary-demo.tsx']!()
  return { default: createAuthRouteBoundaryDemo() }
}

/** 合并路由元数据与面包屑 Demo 的组件与样式源码。 */
async function loadRouteMetadataAndBreadcrumbsSource(): Promise<string> {
  return loadDemoSource(routeMetadataAndBreadcrumbsSourceFiles)
}

/** 为每次宿主挂载创建独立的路由元数据与面包屑观察台。 */
async function loadRouteMetadataAndBreadcrumbsComponent(): Promise<ReactComponentModule> {
  const { createRouteMetadataAndBreadcrumbsDemo } =
    await routeMetadataAndBreadcrumbsFactories[
      './demos/route-metadata-and-breadcrumbs/route-metadata-and-breadcrumbs-demo.tsx'
    ]!()
  return { default: createRouteMetadataAndBreadcrumbsDemo() }
}

/** 合并 Lazy 路由 Demo 的组件、route module 与样式源码。 */
async function loadLazyRoutesSource(): Promise<string> {
  return loadDemoSource(lazyRoutesSourceFiles)
}

/** 为每次宿主挂载创建独立的 Lazy 路由观察台。 */
async function loadLazyRoutesComponent(): Promise<ReactComponentModule> {
  const { createLazyRoutesDemo } =
    await lazyRoutesFactories['./demos/lazy-routes/lazy-routes-demo.tsx']!()
  return { default: createLazyRoutesDemo() }
}

/** 合并内容管理工作区 Demo 的真实组件、数据、详情模块与样式源码。 */
async function loadContentManagementWorkspaceSource(): Promise<string> {
  return loadDemoSource(contentManagementWorkspaceSourceFiles)
}

/** 为每次宿主挂载创建独立的内容管理工作区。 */
async function loadContentManagementWorkspaceComponent(): Promise<ReactComponentModule> {
  const { createContentManagementWorkspaceDemo } =
    await contentManagementWorkspaceFactories[
      './demos/content-management-workspace/content-management-workspace-demo.tsx'
    ]!()
  return { default: createContentManagementWorkspaceDemo() }
}

/** 合并鉴权管理后台 Demo 的组件与样式源码。 */
async function loadAuthAdminWorkspaceSource(): Promise<string> {
  return loadDemoSource(authAdminWorkspaceSourceFiles)
}

/** 为每次宿主挂载创建独立的鉴权管理后台。 */
async function loadAuthAdminWorkspaceComponent(): Promise<ReactComponentModule> {
  const { createAuthAdminWorkspaceDemo } =
    await authAdminWorkspaceFactories[
      './demos/auth-admin-workspace/auth-admin-workspace-demo.tsx'
    ]!()
  return { default: createAuthAdminWorkspaceDemo() }
}

/** 合并 Optimistic UI Demo 的组件与样式源码。 */
async function loadOptimisticUiSource(): Promise<string> {
  return loadDemoSource(optimisticUiSourceFiles)
}

/** 为每次宿主挂载创建独立的 Optimistic UI 观察台。 */
async function loadOptimisticUiComponent(): Promise<ReactComponentModule> {
  const { createOptimisticUiDemo } =
    await optimisticUiFactories['./demos/optimistic-ui/optimistic-ui-demo.tsx']!()
  return { default: createOptimisticUiDemo() }
}

/** 合并导航并发与请求取消 Demo 的组件与样式源码。 */
async function loadNavigationConcurrencyAndCancellationSource(): Promise<string> {
  return loadDemoSource(navigationConcurrencyAndCancellationSourceFiles)
}

/** 为每次宿主挂载创建独立的导航取消观察台。 */
async function loadNavigationConcurrencyAndCancellationComponent(): Promise<ReactComponentModule> {
  const { createNavigationConcurrencyAndCancellationDemo } =
    await navigationConcurrencyAndCancellationFactories[
      './demos/navigation-concurrency-and-cancellation/navigation-concurrency-and-cancellation-demo.tsx'
    ]!()
  return { default: createNavigationConcurrencyAndCancellationDemo() }
}

/** 合并 Race Condition Demo 的真实组件与样式源码。 */
async function loadRaceConditionsSource(): Promise<string> {
  return loadDemoSource(raceConditionsSourceFiles)
}

/** 为每次宿主挂载创建独立的竞态条件观察台。 */
async function loadRaceConditionsComponent(): Promise<ReactComponentModule> {
  const { createRaceConditionsDemo } =
    await raceConditionsFactories['./demos/race-conditions/race-conditions-demo.tsx']!()
  return { default: createRaceConditionsDemo() }
}

/** 合并路由状态所有权 Demo 的真实组件与样式源码。 */
async function loadRouteStateOwnershipSource(): Promise<string> {
  return loadDemoSource(routeStateOwnershipSourceFiles)
}

/** 为每次宿主挂载创建独立的状态所有权工作台。 */
async function loadRouteStateOwnershipComponent(): Promise<ReactComponentModule> {
  const { createRouteStateOwnershipDemo } =
    await routeStateOwnershipFactories[
      './demos/route-state-ownership/route-state-ownership-demo.tsx'
    ]!()
  return { default: createRouteStateOwnershipDemo() }
}

/** 合并自定义 Data Strategy Demo 的真实组件与样式源码。 */
async function loadCustomDataStrategySource(): Promise<string> {
  return loadDemoSource(customDataStrategySourceFiles)
}

/** 为每次宿主挂载创建独立的 Data Strategy 观察台。 */
async function loadCustomDataStrategyComponent(): Promise<ReactComponentModule> {
  const { createCustomDataStrategyDemo } =
    await customDataStrategyFactories[
      './demos/custom-data-strategy/custom-data-strategy-demo.tsx'
    ]!()
  return { default: createCustomDataStrategyDemo() }
}

/** 合并动态路由发现 Demo 的真实组件与样式源码。 */
async function loadDynamicRouteDiscoverySource(): Promise<string> {
  return loadDemoSource(dynamicRouteDiscoverySourceFiles)
}

/** 为每次宿主挂载创建独立的动态路由发现观察台。 */
async function loadDynamicRouteDiscoveryComponent(): Promise<ReactComponentModule> {
  const { createDynamicRouteDiscoveryDemo } =
    await dynamicRouteDiscoveryFactories[
      './demos/dynamic-route-discovery/dynamic-route-discovery-demo.tsx'
    ]!()
  return { default: createDynamicRouteDiscoveryDemo() }
}

/** 合并滚动恢复 Demo 的真实组件与样式源码。 */
async function loadScrollRestorationSource(): Promise<string> {
  return loadDemoSource(scrollRestorationSourceFiles)
}

/** 为每次宿主挂载创建独立的滚动恢复观察台。 */
async function loadScrollRestorationComponent(): Promise<ReactComponentModule> {
  const { createScrollRestorationDemo } =
    await scrollRestorationFactories['./demos/scroll-restoration/scroll-restoration-demo.tsx']!()
  return { default: createScrollRestorationDemo() }
}

/** 合并导航阻止 Demo 的组件与样式源码。 */
async function loadNavigationBlockingSource(): Promise<string> {
  return loadDemoSource(navigationBlockingSourceFiles)
}

/** 为每次宿主挂载创建独立的导航阻止观察台。 */
async function loadNavigationBlockingComponent(): Promise<ReactComponentModule> {
  const { createNavigationBlockingDemo } =
    await navigationBlockingFactories['./demos/navigation-blocking/navigation-blocking-demo.tsx']!()
  return { default: createNavigationBlockingDemo() }
}

export const reactRouterDemoAssets: DemoAssetManifest[] = [
  {
    id: 'react.router.learn.basics.data-router-introduction.router-provider-demo',
    title: 'Data Router 启动链',
    runtime: 'react',
    loadComponent: loadDataRouterIntroductionComponent,
    loadSource: loadDataRouterIntroductionSource,
  },
  {
    id: 'react.router.learn.basics.route-objects.field-observer-demo',
    title: '路由对象字段观察',
    runtime: 'react',
    loadComponent: loadRouteObjectsComponent,
    loadSource: loadRouteObjectsSource,
  },
  {
    id: 'react.router.learn.basics.route-matching.static-matcher-demo',
    title: '静态路由匹配观察器',
    runtime: 'react',
    loadComponent: loadRouteMatchingComponent,
    loadSource: loadRouteMatchingSource,
  },
  {
    id: 'react.router.learn.basics.link-navigation.history-demo',
    title: 'Link 与内存 history',
    runtime: 'react',
    loadComponent: loadLinkNavigationComponent,
    loadSource: loadLinkNavigationSource,
  },
  {
    id: 'react.router.learn.basics.nav-link-state.state-observer-demo',
    title: 'NavLink 当前与等待状态',
    runtime: 'react',
    loadComponent: loadNavLinkStateComponent,
    loadSource: loadNavLinkStateSource,
  },
  {
    id: 'react.router.learn.basics.nested-routes-and-outlet.outlet-demo',
    title: '嵌套路由与 Outlet 插入点',
    runtime: 'react',
    loadComponent: loadNestedRoutesAndOutletComponent,
    loadSource: loadNestedRoutesAndOutletSource,
  },
  {
    id: 'react.router.learn.basics.layout-routes.layout-demo',
    title: '布局路由覆盖范围',
    runtime: 'react',
    loadComponent: loadLayoutRoutesComponent,
    loadSource: loadLayoutRoutesSource,
  },
  {
    id: 'react.router.learn.basics.index-routes.index-demo',
    title: '索引路由默认内容',
    runtime: 'react',
    loadComponent: loadIndexRoutesComponent,
    loadSource: loadIndexRoutesSource,
  },
  {
    id: 'react.router.learn.basics.dynamic-segments.segment-demo',
    title: '动态路由段与嵌套参数',
    runtime: 'react',
    loadComponent: loadDynamicSegmentsComponent,
    loadSource: loadDynamicSegmentsSource,
  },
  {
    id: 'react.router.learn.basics.optional-segments-and-splats.matcher-demo',
    title: '可选段与通配路由观察台',
    runtime: 'react',
    loadComponent: loadOptionalSegmentsAndSplatsComponent,
    loadSource: loadOptionalSegmentsAndSplatsSource,
  },
  {
    id: 'react.router.learn.basics.route-params.params-demo',
    title: '路由参数读取观察台',
    runtime: 'react',
    loadComponent: loadRouteParamsComponent,
    loadSource: loadRouteParamsSource,
  },
  {
    id: 'react.router.learn.basics.query-params-and-url-state.search-params-demo',
    title: '查询参数与 URL 状态观察台',
    runtime: 'react',
    loadComponent: loadQueryParamsAndUrlStateComponent,
    loadSource: loadQueryParamsAndUrlStateSource,
  },
  {
    id: 'react.router.learn.basics.programmatic-navigation.navigation-workbench-demo',
    title: '编程式导航与内存 history 观察台',
    runtime: 'react',
    loadComponent: loadProgrammaticNavigationComponent,
    loadSource: loadProgrammaticNavigationSource,
  },
  {
    id: 'react.router.learn.basics.location-and-history-state.location-observer-demo',
    title: 'Location 与历史记录观察台',
    runtime: 'react',
    loadComponent: loadLocationAndHistoryStateComponent,
    loadSource: loadLocationAndHistoryStateSource,
  },
  {
    id: 'react.router.learn.basics.lab-multi-page-course-center.course-center-demo',
    title: '多页面课程中心',
    runtime: 'react',
    loadComponent: loadMultiPageCourseCenterComponent,
    loadSource: loadMultiPageCourseCenterSource,
  },
  {
    id: 'react.router.learn.basics.lab-nested-documentation-center.documentation-center-demo',
    title: '嵌套文档中心',
    runtime: 'react',
    loadComponent: loadNestedDocumentationCenterComponent,
    loadSource: loadNestedDocumentationCenterSource,
  },
  {
    id: 'react.router.learn.intermediate.loader-data-loading.loader-data-demo',
    title: 'Loader 数据观察台',
    runtime: 'react',
    loadComponent: loadLoaderDataLoadingComponent,
    loadSource: loadLoaderDataLoadingSource,
  },
  {
    id: 'react.router.learn.intermediate.loader-requests-and-redirects.request-redirect-demo',
    title: 'Loader 请求与导航观察台',
    runtime: 'react',
    loadComponent: loadLoaderRequestsAndRedirectsComponent,
    loadSource: loadLoaderRequestsAndRedirectsSource,
  },
  {
    id: 'react.router.learn.intermediate.route-data-reading-and-sharing.route-data-sharing-demo',
    title: '路由数据读取与共享观察台',
    runtime: 'react',
    loadComponent: loadRouteDataReadingAndSharingComponent,
    loadSource: loadRouteDataReadingAndSharingSource,
  },
  {
    id: 'react.router.learn.intermediate.navigation-pending-ui.pending-navigation-demo',
    title: '导航 Pending UI 观察台',
    runtime: 'react',
    loadComponent: loadNavigationPendingUiComponent,
    loadSource: loadNavigationPendingUiSource,
  },
  {
    id: 'react.router.learn.intermediate.action-data-submission.action-submission-demo',
    title: 'Action 数据提交观察台',
    runtime: 'react',
    loadComponent: loadActionDataSubmissionComponent,
    loadSource: loadActionDataSubmissionSource,
  },
  {
    id: 'react.router.learn.intermediate.action-results-and-form-validation.action-validation-demo',
    title: 'Action 结果与表单校验观察台',
    runtime: 'react',
    loadComponent: loadActionResultsAndFormValidationComponent,
    loadSource: loadActionResultsAndFormValidationSource,
  },
  {
    id: 'react.router.learn.intermediate.form-navigation-form.navigation-form-demo',
    title: 'Form 导航表单观察台',
    runtime: 'react',
    loadComponent: loadFormNavigationFormComponent,
    loadSource: loadFormNavigationFormSource,
  },
  {
    id: 'react.router.learn.intermediate.fetcher.fetcher-demo',
    title: 'Fetcher 局部数据工作台',
    runtime: 'react',
    loadComponent: loadFetcherComponent,
    loadSource: loadFetcherSource,
  },
  {
    id: 'react.router.learn.intermediate.form-fetcher-choice.form-fetcher-choice-demo',
    title: 'Form 与 Fetcher 选择实验室',
    runtime: 'react',
    loadComponent: loadFormFetcherChoiceComponent,
    loadSource: loadFormFetcherChoiceSource,
  },
  {
    id: 'react.router.learn.intermediate.revalidation.revalidation-demo',
    title: 'Revalidation 库存同步观察台',
    runtime: 'react',
    loadComponent: loadRevalidationComponent,
    loadSource: loadRevalidationSource,
  },
  {
    id: 'react.router.learn.intermediate.route-error-boundary.error-boundary-demo',
    title: 'Route Error Boundary 报告故障恢复台',
    runtime: 'react',
    loadComponent: loadRouteErrorBoundaryComponent,
    loadSource: loadRouteErrorBoundarySource,
  },
  {
    id: 'react.router.learn.intermediate.auth-route-boundary.auth-boundary-demo',
    title: '鉴权路由边界观察台',
    runtime: 'react',
    loadComponent: loadAuthRouteBoundaryComponent,
    loadSource: loadAuthRouteBoundarySource,
  },
  {
    id: 'react.router.learn.intermediate.route-metadata-and-breadcrumbs.breadcrumbs-demo',
    title: '路由元数据与面包屑工作台',
    runtime: 'react',
    loadComponent: loadRouteMetadataAndBreadcrumbsComponent,
    loadSource: loadRouteMetadataAndBreadcrumbsSource,
  },
  {
    id: 'react.router.learn.intermediate.lazy-routes.lazy-routes-demo',
    title: 'Lazy 路由观察台',
    runtime: 'react',
    loadComponent: loadLazyRoutesComponent,
    loadSource: loadLazyRoutesSource,
  },
  {
    id: 'react.router.learn.intermediate.lab-content-management-workspace.content-management-workspace-demo',
    title: '内容管理工作区',
    runtime: 'react',
    loadComponent: loadContentManagementWorkspaceComponent,
    loadSource: loadContentManagementWorkspaceSource,
  },
  {
    id: 'react.router.learn.intermediate.lab-auth-admin-workspace.auth-admin-workspace-demo',
    title: '鉴权管理后台',
    runtime: 'react',
    loadComponent: loadAuthAdminWorkspaceComponent,
    loadSource: loadAuthAdminWorkspaceSource,
  },
  {
    id: 'react.router.learn.advanced.optimistic-ui.optimistic-ui-demo',
    title: 'Optimistic UI 任务状态观察台',
    runtime: 'react',
    loadComponent: loadOptimisticUiComponent,
    loadSource: loadOptimisticUiSource,
  },
  {
    id: 'react.router.learn.advanced.navigation-concurrency-and-cancellation.navigation-concurrency-demo',
    title: '导航并发与请求取消观察台',
    runtime: 'react',
    loadComponent: loadNavigationConcurrencyAndCancellationComponent,
    loadSource: loadNavigationConcurrencyAndCancellationSource,
  },
  {
    id: 'react.router.learn.advanced.race-conditions.race-conditions-demo',
    title: '竞态条件观察台',
    runtime: 'react',
    loadComponent: loadRaceConditionsComponent,
    loadSource: loadRaceConditionsSource,
  },
  {
    id: 'react.router.learn.advanced.route-state-ownership.route-state-ownership-demo',
    title: '状态所有权工作台',
    runtime: 'react',
    loadComponent: loadRouteStateOwnershipComponent,
    loadSource: loadRouteStateOwnershipSource,
  },
  {
    id: 'react.router.learn.advanced.custom-data-strategy.custom-data-strategy-demo',
    title: '自定义 Data Strategy 观察台',
    runtime: 'react',
    loadComponent: loadCustomDataStrategyComponent,
    loadSource: loadCustomDataStrategySource,
  },
  {
    id: 'react.router.learn.advanced.dynamic-route-discovery.dynamic-route-discovery-demo',
    title: '动态路由发现观察台',
    runtime: 'react',
    loadComponent: loadDynamicRouteDiscoveryComponent,
    loadSource: loadDynamicRouteDiscoverySource,
  },
  {
    id: 'react.router.learn.advanced.scroll-restoration.scroll-restoration-demo',
    title: '滚动恢复观察台',
    runtime: 'react',
    loadComponent: loadScrollRestorationComponent,
    loadSource: loadScrollRestorationSource,
  },
  {
    id: 'react.router.learn.advanced.navigation-blocking.navigation-blocking-demo',
    title: '导航阻止观察台',
    runtime: 'react',
    loadComponent: loadNavigationBlockingComponent,
    loadSource: loadNavigationBlockingSource,
  },
]
