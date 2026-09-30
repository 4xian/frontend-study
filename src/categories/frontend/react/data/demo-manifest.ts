import type { DemoAssetManifest, ReactComponentModule } from '@/common/content/demo-registry'

type ServerStateDemoModule = {
  createServerStateDemo: () => ReactComponentModule['default']
}

type QueryClientProviderDemoModule = {
  createQueryClientProviderDemo: () => ReactComponentModule['default']
}

type FirstUseQueryDemoModule = {
  createFirstUseQueryDemo: () => ReactComponentModule['default']
}

type QueryFunctionAndFetchDemoModule = {
  createQueryFunctionAndFetchDemo: () => ReactComponentModule['default']
}

type QueryKeyDemoModule = {
  createQueryKeyDemo: () => ReactComponentModule['default']
}

type QueryStatusDemoModule = {
  createQueryStatusDemo: () => ReactComponentModule['default']
}

type QueryErrorHandlingDemoModule = {
  createQueryErrorHandlingDemo: () => ReactComponentModule['default']
}

type QueryCacheSharingDemoModule = {
  createQueryCacheSharingDemo: () => ReactComponentModule['default']
}

type StaleTimeAndFreshnessDemoModule = {
  createStaleTimeAndFreshnessDemo: () => ReactComponentModule['default']
}

type BackgroundRefetchingDemoModule = {
  createBackgroundRefetchingDemo: () => ReactComponentModule['default']
}

type CacheLifecycleAndGcTimeDemoModule = {
  createCacheLifecycleAndGcTimeDemo: () => ReactComponentModule['default']
}

type ConditionalQueriesDemoModule = {
  createConditionalQueriesDemo: () => ReactComponentModule['default']
}

type ReactQueryDevtoolsDemoModule = {
  createReactQueryDevtoolsDemo: () => ReactComponentModule['default']
}

type UserProfilePanelDemoModule = {
  createUserProfilePanelDemo: () => ReactComponentModule['default']
}

type ArticleListAndDetailDemoModule = {
  createArticleListAndDetailDemo: () => ReactComponentModule['default']
}

type QueryKeyOrganizationDemoModule = {
  createQueryKeyOrganizationDemo: () => ReactComponentModule['default']
}

type QueryOptionsReuseDemoModule = {
  createQueryOptionsReuseDemo: () => ReactComponentModule['default']
}

type DependentQueriesDemoModule = {
  createDependentQueriesDemo: () => ReactComponentModule['default']
}

type ParallelQueriesDemoModule = {
  createParallelQueriesDemo: () => ReactComponentModule['default']
}

type QueryRetryDemoModule = {
  createQueryRetryDemo: () => ReactComponentModule['default']
}

type QueryCancellationDemoModule = {
  createQueryCancellationDemo: () => ReactComponentModule['default']
}

type InitialAndPlaceholderDataDemoModule = {
  createInitialAndPlaceholderDataDemo: () => ReactComponentModule['default']
}

type PaginatedQueriesDemoModule = {
  createPaginatedQueriesDemo: () => ReactComponentModule['default']
}

type UseMutationDemoModule = {
  createUseMutationDemo: () => ReactComponentModule['default']
}

type MutationLifecycleDemoModule = {
  createMutationLifecycleDemo: () => ReactComponentModule['default']
}

type QueryInvalidationDemoModule = {
  createQueryInvalidationDemo: () => ReactComponentModule['default']
}

type UpdatesFromMutationResponsesDemoModule = {
  createUpdatesFromMutationResponsesDemo: () => ReactComponentModule['default']
}

type OptimisticUpdatesDemoModule = {
  createOptimisticUpdatesDemo: () => ReactComponentModule['default']
}

type DataHooksAndModuleOrganizationDemoModule = {
  createDataHooksAndModuleOrganizationDemo: () => ReactComponentModule['default']
}

type PaginatedContentManagementDemoModule = {
  createPaginatedContentManagementDemo: () => ReactComponentModule['default']
}

type CrudManagementWorkspaceDemoModule = {
  createCrudManagementWorkspaceDemo: () => ReactComponentModule['default']
}

type InfiniteQueriesDemoModule = {
  createInfiniteQueriesDemo: () => ReactComponentModule['default']
}

type InfiniteQueryMemoryDemoModule = {
  createInfiniteQueryMemoryDemo: () => ReactComponentModule['default']
}

type QueryPrefetchingDemoModule = {
  createQueryPrefetchingDemo: () => ReactComponentModule['default']
}

type ReactRouterQueryIntegrationDemoModule = {
  createReactRouterQueryIntegrationDemo: () => ReactComponentModule['default']
}

type RequestWaterfallsDemoModule = {
  createRequestWaterfallsDemo: () => ReactComponentModule['default']
}

type QueryRenderOptimizationsDemoModule = {
  createQueryRenderOptimizationsDemo: () => ReactComponentModule['default']
}

type QueryClientCacheOperationsDemoModule = {
  createQueryClientCacheOperationsDemo: () => ReactComponentModule['default']
}

type ConcurrentMutationStateDemoModule = {
  createConcurrentMutationStateDemo: () => ReactComponentModule['default']
}

type SuspenseQueriesDemoModule = {
  createSuspenseQueriesDemo: () => ReactComponentModule['default']
}

type QueryErrorBoundaryDemoModule = {
  createQueryErrorBoundaryDemo: () => ReactComponentModule['default']
}

type OfflineQueryPersistenceDemoModule = {
  createOfflineQueryPersistenceDemo: () => ReactComponentModule['default']
}

type SsrAndHydrationDemoModule = {
  createSsrAndHydrationDemo: () => ReactComponentModule['default']
}

type QueryTestingDemoModule = {
  createQueryTestingDemo: () => ReactComponentModule['default']
}

type ProductionDataLayerDemoModule = {
  createProductionDataLayerDemo: () => ReactComponentModule['default']
}

type CollaborationContentPlatformDemoModule = {
  createCollaborationContentPlatformDemo: () => ReactComponentModule['default']
}

type ProductionServerDataCenterDemoModule = {
  createProductionServerDataCenterDemo: () => ReactComponentModule['default']
}

const demoFactories = import.meta.glob<ServerStateDemoModule>('./demos/server-state/*.tsx')
const demoSources = import.meta.glob<string>('./demos/server-state/*.tsx', {
  query: '?raw',
  import: 'default',
})
const demoStyleSources = import.meta.glob<string>('./demos/server-state/*.css', {
  query: '?raw',
  import: 'default',
})

const queryClientProviderDemoFactories = import.meta.glob<QueryClientProviderDemoModule>(
  './demos/query-client-provider/*.tsx',
)
const queryClientProviderDemoSources = import.meta.glob<string>(
  './demos/query-client-provider/*.tsx',
  { query: '?raw', import: 'default' },
)
const queryClientProviderDemoStyleSources = import.meta.glob<string>(
  './demos/query-client-provider/*.css',
  { query: '?raw', import: 'default' },
)

const firstUseQueryDemoFactories = import.meta.glob<FirstUseQueryDemoModule>(
  './demos/first-use-query/*.tsx',
)
const firstUseQueryDemoSources = import.meta.glob<string>('./demos/first-use-query/*.tsx', {
  query: '?raw',
  import: 'default',
})
const firstUseQueryDemoStyleSources = import.meta.glob<string>('./demos/first-use-query/*.css', {
  query: '?raw',
  import: 'default',
})

const queryFunctionAndFetchDemoFactories = import.meta.glob<QueryFunctionAndFetchDemoModule>(
  './demos/query-function-and-fetch/*.tsx',
)
const queryFunctionAndFetchDemoSources = import.meta.glob<string>(
  './demos/query-function-and-fetch/*.tsx',
  { query: '?raw', import: 'default' },
)
const queryFunctionAndFetchDemoStyleSources = import.meta.glob<string>(
  './demos/query-function-and-fetch/*.css',
  { query: '?raw', import: 'default' },
)

const queryKeyDemoFactories = import.meta.glob<QueryKeyDemoModule>('./demos/query-key/*.tsx')
const queryKeyDemoSources = import.meta.glob<string>('./demos/query-key/*.tsx', {
  query: '?raw',
  import: 'default',
})
const queryKeyDemoStyleSources = import.meta.glob<string>('./demos/query-key/*.css', {
  query: '?raw',
  import: 'default',
})

const queryStatusDemoFactories = import.meta.glob<QueryStatusDemoModule>(
  './demos/query-status/*.tsx',
)
const queryStatusDemoSources = import.meta.glob<string>('./demos/query-status/*.tsx', {
  query: '?raw',
  import: 'default',
})
const queryStatusDemoStyleSources = import.meta.glob<string>('./demos/query-status/*.css', {
  query: '?raw',
  import: 'default',
})

const queryErrorHandlingDemoFactories = import.meta.glob<QueryErrorHandlingDemoModule>(
  './demos/query-error-handling/*.tsx',
)
const queryErrorHandlingDemoSources = import.meta.glob<string>(
  './demos/query-error-handling/*.tsx',
  { query: '?raw', import: 'default' },
)
const queryErrorHandlingDemoStyleSources = import.meta.glob<string>(
  './demos/query-error-handling/*.css',
  { query: '?raw', import: 'default' },
)

const queryCacheSharingDemoFactories = import.meta.glob<QueryCacheSharingDemoModule>(
  './demos/query-cache-sharing/*.tsx',
)
const queryCacheSharingDemoSources = import.meta.glob<string>('./demos/query-cache-sharing/*.tsx', {
  query: '?raw',
  import: 'default',
})
const queryCacheSharingDemoStyleSources = import.meta.glob<string>(
  './demos/query-cache-sharing/*.css',
  { query: '?raw', import: 'default' },
)

const staleTimeAndFreshnessDemoFactories = import.meta.glob<StaleTimeAndFreshnessDemoModule>(
  './demos/stale-time-and-freshness/*.tsx',
)
const staleTimeAndFreshnessDemoSources = import.meta.glob<string>(
  './demos/stale-time-and-freshness/*.tsx',
  { query: '?raw', import: 'default' },
)
const staleTimeAndFreshnessDemoStyleSources = import.meta.glob<string>(
  './demos/stale-time-and-freshness/*.css',
  { query: '?raw', import: 'default' },
)

const backgroundRefetchingDemoFactories = import.meta.glob<BackgroundRefetchingDemoModule>(
  './demos/background-refetching/*.tsx',
)
const backgroundRefetchingDemoSources = import.meta.glob<string>(
  './demos/background-refetching/*.tsx',
  { query: '?raw', import: 'default' },
)
const backgroundRefetchingDemoStyleSources = import.meta.glob<string>(
  './demos/background-refetching/*.css',
  { query: '?raw', import: 'default' },
)

const cacheLifecycleAndGcTimeDemoFactories = import.meta.glob<CacheLifecycleAndGcTimeDemoModule>(
  './demos/cache-lifecycle-and-gctime/*.tsx',
)
const cacheLifecycleAndGcTimeDemoSources = import.meta.glob<string>(
  './demos/cache-lifecycle-and-gctime/*.tsx',
  { query: '?raw', import: 'default' },
)
const cacheLifecycleAndGcTimeDemoStyleSources = import.meta.glob<string>(
  './demos/cache-lifecycle-and-gctime/*.css',
  { query: '?raw', import: 'default' },
)

const conditionalQueriesDemoFactories = import.meta.glob<ConditionalQueriesDemoModule>(
  './demos/conditional-queries/*.tsx',
)
const conditionalQueriesDemoSources = import.meta.glob<string>(
  './demos/conditional-queries/*.tsx',
  {
    query: '?raw',
    import: 'default',
  },
)
const conditionalQueriesDemoStyleSources = import.meta.glob<string>(
  './demos/conditional-queries/*.css',
  { query: '?raw', import: 'default' },
)

const reactQueryDevtoolsDemoFactories = import.meta.glob<ReactQueryDevtoolsDemoModule>(
  './demos/react-query-devtools/*.tsx',
)
const reactQueryDevtoolsDemoSources = import.meta.glob<string>(
  './demos/react-query-devtools/*.tsx',
  { query: '?raw', import: 'default' },
)
const reactQueryDevtoolsDemoStyleSources = import.meta.glob<string>(
  './demos/react-query-devtools/*.css',
  { query: '?raw', import: 'default' },
)

const userProfilePanelDemoFactories = import.meta.glob<UserProfilePanelDemoModule>(
  './demos/user-profile-panel/*.tsx',
)
const userProfilePanelDemoSources = import.meta.glob<string>('./demos/user-profile-panel/*.tsx', {
  query: '?raw',
  import: 'default',
})
const userProfilePanelDemoStyleSources = import.meta.glob<string>(
  './demos/user-profile-panel/*.css',
  { query: '?raw', import: 'default' },
)

const articleListAndDetailDemoFactories = import.meta.glob<ArticleListAndDetailDemoModule>(
  './demos/article-list-and-detail/*.tsx',
)
const articleListAndDetailDemoSources = import.meta.glob<string>(
  './demos/article-list-and-detail/*.tsx',
  {
    query: '?raw',
    import: 'default',
  },
)
const articleListAndDetailDemoStyleSources = import.meta.glob<string>(
  './demos/article-list-and-detail/*.css',
  { query: '?raw', import: 'default' },
)

const queryKeyOrganizationDemoFactories = import.meta.glob<QueryKeyOrganizationDemoModule>(
  './demos/query-key-organization/*.tsx',
)
const queryKeyOrganizationDemoSources = import.meta.glob<string>(
  './demos/query-key-organization/*.tsx',
  {
    query: '?raw',
    import: 'default',
  },
)
const queryKeyOrganizationDemoStyleSources = import.meta.glob<string>(
  './demos/query-key-organization/*.css',
  { query: '?raw', import: 'default' },
)

const queryOptionsReuseDemoFactories = import.meta.glob<QueryOptionsReuseDemoModule>(
  './demos/query-options-reuse/*.tsx',
)
const queryOptionsReuseDemoSources = import.meta.glob<string>('./demos/query-options-reuse/*.tsx', {
  query: '?raw',
  import: 'default',
})
const queryOptionsReuseDemoStyleSources = import.meta.glob<string>(
  './demos/query-options-reuse/*.css',
  { query: '?raw', import: 'default' },
)

const dependentQueriesDemoFactories = import.meta.glob<DependentQueriesDemoModule>(
  './demos/dependent-queries/*.tsx',
)
const dependentQueriesDemoSources = import.meta.glob<string>('./demos/dependent-queries/*.tsx', {
  query: '?raw',
  import: 'default',
})
const dependentQueriesDemoStyleSources = import.meta.glob<string>(
  './demos/dependent-queries/*.css',
  { query: '?raw', import: 'default' },
)

const parallelQueriesDemoFactories = import.meta.glob<ParallelQueriesDemoModule>(
  './demos/parallel-queries/*.tsx',
)
const parallelQueriesDemoSources = import.meta.glob<string>('./demos/parallel-queries/*.tsx', {
  query: '?raw',
  import: 'default',
})
const parallelQueriesDemoStyleSources = import.meta.glob<string>('./demos/parallel-queries/*.css', {
  query: '?raw',
  import: 'default',
})

const queryRetryDemoFactories = import.meta.glob<QueryRetryDemoModule>('./demos/query-retry/*.tsx')
const queryRetryDemoSources = import.meta.glob<string>('./demos/query-retry/*.tsx', {
  query: '?raw',
  import: 'default',
})
const queryRetryDemoStyleSources = import.meta.glob<string>('./demos/query-retry/*.css', {
  query: '?raw',
  import: 'default',
})

const queryCancellationDemoFactories = import.meta.glob<QueryCancellationDemoModule>(
  './demos/query-cancellation/*.tsx',
)
const queryCancellationDemoSources = import.meta.glob<string>('./demos/query-cancellation/*.tsx', {
  query: '?raw',
  import: 'default',
})
const queryCancellationDemoStyleSources = import.meta.glob<string>(
  './demos/query-cancellation/*.css',
  {
    query: '?raw',
    import: 'default',
  },
)

const initialAndPlaceholderDataDemoFactories =
  import.meta.glob<InitialAndPlaceholderDataDemoModule>(
    './demos/initial-and-placeholder-data/*.tsx',
  )
const initialAndPlaceholderDataDemoSources = import.meta.glob<string>(
  './demos/initial-and-placeholder-data/*.tsx',
  {
    query: '?raw',
    import: 'default',
  },
)
const initialAndPlaceholderDataDemoStyleSources = import.meta.glob<string>(
  './demos/initial-and-placeholder-data/*.css',
  {
    query: '?raw',
    import: 'default',
  },
)

const paginatedQueriesDemoFactories = import.meta.glob<PaginatedQueriesDemoModule>(
  './demos/paginated-queries/*.tsx',
)
const paginatedQueriesDemoSources = import.meta.glob<string>('./demos/paginated-queries/*.tsx', {
  query: '?raw',
  import: 'default',
})
const paginatedQueriesDemoStyleSources = import.meta.glob<string>(
  './demos/paginated-queries/*.css',
  {
    query: '?raw',
    import: 'default',
  },
)

const useMutationDemoFactories = import.meta.glob<UseMutationDemoModule>(
  './demos/use-mutation/*.tsx',
)
const useMutationDemoSources = import.meta.glob<string>('./demos/use-mutation/*.tsx', {
  query: '?raw',
  import: 'default',
})
const useMutationDemoStyleSources = import.meta.glob<string>('./demos/use-mutation/*.css', {
  query: '?raw',
  import: 'default',
})
const mutationLifecycleDemoFactories = import.meta.glob<MutationLifecycleDemoModule>(
  './demos/mutation-lifecycle/*.tsx',
)
const mutationLifecycleDemoSources = import.meta.glob<string>('./demos/mutation-lifecycle/*.tsx', {
  query: '?raw',
  import: 'default',
})
const mutationLifecycleDemoStyleSources = import.meta.glob<string>(
  './demos/mutation-lifecycle/*.css',
  {
    query: '?raw',
    import: 'default',
  },
)
const queryInvalidationDemoFactories = import.meta.glob<QueryInvalidationDemoModule>(
  './demos/query-invalidation/*.tsx',
)
const queryInvalidationDemoSources = import.meta.glob<string>('./demos/query-invalidation/*.tsx', {
  query: '?raw',
  import: 'default',
})
const queryInvalidationDemoStyleSources = import.meta.glob<string>(
  './demos/query-invalidation/*.css',
  {
    query: '?raw',
    import: 'default',
  },
)
const updatesFromMutationResponsesDemoFactories =
  import.meta.glob<UpdatesFromMutationResponsesDemoModule>(
    './demos/updates-from-mutation-responses/*.tsx',
  )
const updatesFromMutationResponsesDemoSources = import.meta.glob<string>(
  './demos/updates-from-mutation-responses/*.tsx',
  {
    query: '?raw',
    import: 'default',
  },
)
const updatesFromMutationResponsesDemoStyleSources = import.meta.glob<string>(
  './demos/updates-from-mutation-responses/*.css',
  {
    query: '?raw',
    import: 'default',
  },
)
const optimisticUpdatesDemoFactories = import.meta.glob<OptimisticUpdatesDemoModule>(
  './demos/optimistic-updates/*.tsx',
)
const optimisticUpdatesDemoSources = import.meta.glob<string>('./demos/optimistic-updates/*.tsx', {
  query: '?raw',
  import: 'default',
})
const optimisticUpdatesDemoStyleSources = import.meta.glob<string>(
  './demos/optimistic-updates/*.css',
  {
    query: '?raw',
    import: 'default',
  },
)
const dataHooksAndModuleOrganizationDemoFactories =
  import.meta.glob<DataHooksAndModuleOrganizationDemoModule>(
    './demos/data-hooks-and-module-organization/*.tsx',
  )
const dataHooksAndModuleOrganizationDemoSources = import.meta.glob<string>(
  './demos/data-hooks-and-module-organization/*.tsx',
  {
    query: '?raw',
    import: 'default',
  },
)
const dataHooksAndModuleOrganizationDemoStyleSources = import.meta.glob<string>(
  './demos/data-hooks-and-module-organization/*.css',
  {
    query: '?raw',
    import: 'default',
  },
)
const paginatedContentManagementDemoFactories =
  import.meta.glob<PaginatedContentManagementDemoModule>(
    './demos/paginated-content-management/*.tsx',
  )
const paginatedContentManagementDemoSources = import.meta.glob<string>(
  './demos/paginated-content-management/*.tsx',
  {
    query: '?raw',
    import: 'default',
  },
)
const paginatedContentManagementDemoStyleSources = import.meta.glob<string>(
  './demos/paginated-content-management/*.css',
  {
    query: '?raw',
    import: 'default',
  },
)
const crudManagementWorkspaceDemoFactories = import.meta.glob<CrudManagementWorkspaceDemoModule>(
  './demos/crud-management-workspace/*.tsx',
)
const crudManagementWorkspaceDemoSources = import.meta.glob<string>(
  './demos/crud-management-workspace/*.tsx',
  {
    query: '?raw',
    import: 'default',
  },
)
const crudManagementWorkspaceDemoStyleSources = import.meta.glob<string>(
  './demos/crud-management-workspace/*.css',
  {
    query: '?raw',
    import: 'default',
  },
)
const infiniteQueriesDemoFactories = import.meta.glob<InfiniteQueriesDemoModule>(
  './demos/infinite-queries/*.tsx',
)
const infiniteQueriesDemoSources = import.meta.glob<string>('./demos/infinite-queries/*.tsx', {
  query: '?raw',
  import: 'default',
})
const infiniteQueriesDemoStyleSources = import.meta.glob<string>('./demos/infinite-queries/*.css', {
  query: '?raw',
  import: 'default',
})
const infiniteQueryMemoryDemoFactories = import.meta.glob<InfiniteQueryMemoryDemoModule>(
  './demos/infinite-query-memory/*.tsx',
)
const infiniteQueryMemoryDemoSources = import.meta.glob<string>(
  './demos/infinite-query-memory/*.tsx',
  {
    query: '?raw',
    import: 'default',
  },
)
const infiniteQueryMemoryDemoStyleSources = import.meta.glob<string>(
  './demos/infinite-query-memory/*.css',
  {
    query: '?raw',
    import: 'default',
  },
)
const queryPrefetchingDemoFactories = import.meta.glob<QueryPrefetchingDemoModule>(
  './demos/query-prefetching/*.tsx',
)
const queryPrefetchingDemoSources = import.meta.glob<string>('./demos/query-prefetching/*.tsx', {
  query: '?raw',
  import: 'default',
})
const queryPrefetchingDemoStyleSources = import.meta.glob<string>(
  './demos/query-prefetching/*.css',
  {
    query: '?raw',
    import: 'default',
  },
)
const reactRouterQueryIntegrationDemoFactories =
  import.meta.glob<ReactRouterQueryIntegrationDemoModule>(
    './demos/react-router-query-integration/*.tsx',
  )
const reactRouterQueryIntegrationDemoSources = import.meta.glob<string>(
  './demos/react-router-query-integration/*.tsx',
  {
    query: '?raw',
    import: 'default',
  },
)
const reactRouterQueryIntegrationDemoStyleSources = import.meta.glob<string>(
  './demos/react-router-query-integration/*.css',
  {
    query: '?raw',
    import: 'default',
  },
)
const requestWaterfallsDemoFactories = import.meta.glob<RequestWaterfallsDemoModule>(
  './demos/request-waterfalls/*.tsx',
)
const requestWaterfallsDemoSources = import.meta.glob<string>('./demos/request-waterfalls/*.tsx', {
  query: '?raw',
  import: 'default',
})
const requestWaterfallsDemoStyleSources = import.meta.glob<string>(
  './demos/request-waterfalls/*.css',
  {
    query: '?raw',
    import: 'default',
  },
)
const queryRenderOptimizationsDemoFactories = import.meta.glob<QueryRenderOptimizationsDemoModule>(
  './demos/query-render-optimizations/*.tsx',
)
const queryRenderOptimizationsDemoSources = import.meta.glob<string>(
  './demos/query-render-optimizations/*.tsx',
  {
    query: '?raw',
    import: 'default',
  },
)
const queryRenderOptimizationsDemoStyleSources = import.meta.glob<string>(
  './demos/query-render-optimizations/*.css',
  {
    query: '?raw',
    import: 'default',
  },
)
const queryClientCacheOperationsDemoFactories =
  import.meta.glob<QueryClientCacheOperationsDemoModule>(
    './demos/query-client-cache-operations/*.tsx',
  )
const queryClientCacheOperationsDemoSources = import.meta.glob<string>(
  './demos/query-client-cache-operations/*.tsx',
  {
    query: '?raw',
    import: 'default',
  },
)
const queryClientCacheOperationsDemoStyleSources = import.meta.glob<string>(
  './demos/query-client-cache-operations/*.css',
  {
    query: '?raw',
    import: 'default',
  },
)
const concurrentMutationStateDemoFactories = import.meta.glob<ConcurrentMutationStateDemoModule>(
  './demos/concurrent-mutation-state/*.tsx',
)
const concurrentMutationStateDemoSources = import.meta.glob<string>(
  './demos/concurrent-mutation-state/*.tsx',
  {
    query: '?raw',
    import: 'default',
  },
)
const concurrentMutationStateDemoStyleSources = import.meta.glob<string>(
  './demos/concurrent-mutation-state/*.css',
  {
    query: '?raw',
    import: 'default',
  },
)
const suspenseQueriesDemoFactories = import.meta.glob<SuspenseQueriesDemoModule>(
  './demos/suspense-queries/*.tsx',
)
const suspenseQueriesDemoSources = import.meta.glob<string>('./demos/suspense-queries/*.tsx', {
  query: '?raw',
  import: 'default',
})
const suspenseQueriesDemoStyleSources = import.meta.glob<string>('./demos/suspense-queries/*.css', {
  query: '?raw',
  import: 'default',
})
const queryErrorBoundaryDemoFactories = import.meta.glob<QueryErrorBoundaryDemoModule>(
  './demos/query-error-boundary/*.tsx',
)
const queryErrorBoundaryDemoSources = import.meta.glob<string>(
  './demos/query-error-boundary/*.tsx',
  {
    query: '?raw',
    import: 'default',
  },
)
const queryErrorBoundaryDemoStyleSources = import.meta.glob<string>(
  './demos/query-error-boundary/*.css',
  {
    query: '?raw',
    import: 'default',
  },
)
const offlineQueryPersistenceDemoFactories = import.meta.glob<OfflineQueryPersistenceDemoModule>(
  './demos/offline-query-persistence/*.tsx',
)
const offlineQueryPersistenceDemoSources = import.meta.glob<string>(
  './demos/offline-query-persistence/*.tsx',
  {
    query: '?raw',
    import: 'default',
  },
)
const offlineQueryPersistenceDemoStyleSources = import.meta.glob<string>(
  './demos/offline-query-persistence/*.css',
  {
    query: '?raw',
    import: 'default',
  },
)
const ssrAndHydrationDemoFactories = import.meta.glob<SsrAndHydrationDemoModule>(
  './demos/ssr-and-hydration/*.tsx',
)
const ssrAndHydrationDemoSources = import.meta.glob<string>('./demos/ssr-and-hydration/*.tsx', {
  query: '?raw',
  import: 'default',
})
const ssrAndHydrationDemoStyleSources = import.meta.glob<string>(
  './demos/ssr-and-hydration/*.css',
  {
    query: '?raw',
    import: 'default',
  },
)
const queryTestingDemoFactories = import.meta.glob<QueryTestingDemoModule>(
  './demos/query-testing/*.tsx',
)
const queryTestingDemoSources = import.meta.glob<string>('./demos/query-testing/*.tsx', {
  query: '?raw',
  import: 'default',
})
const queryTestingDemoStyleSources = import.meta.glob<string>('./demos/query-testing/*.css', {
  query: '?raw',
  import: 'default',
})
const productionDataLayerDemoFactories = import.meta.glob<ProductionDataLayerDemoModule>(
  './demos/production-data-layer/*.tsx',
)
const productionDataLayerDemoSources = import.meta.glob<string>(
  './demos/production-data-layer/*.tsx',
  {
    query: '?raw',
    import: 'default',
  },
)
const productionDataLayerDemoStyleSources = import.meta.glob<string>(
  './demos/production-data-layer/*.css',
  {
    query: '?raw',
    import: 'default',
  },
)
const collaborationContentPlatformDemoFactories =
  import.meta.glob<CollaborationContentPlatformDemoModule>(
    './demos/collaboration-content-platform/*.tsx',
  )
const collaborationContentPlatformDemoSources = import.meta.glob<string>(
  './demos/collaboration-content-platform/*.tsx',
  {
    query: '?raw',
    import: 'default',
  },
)
const collaborationContentPlatformDemoStyleSources = import.meta.glob<string>(
  './demos/collaboration-content-platform/*.css',
  {
    query: '?raw',
    import: 'default',
  },
)
const productionServerDataCenterDemoFactories =
  import.meta.glob<ProductionServerDataCenterDemoModule>(
    './demos/production-server-data-center/*.tsx',
  )
const productionServerDataCenterDemoSources = import.meta.glob<string>(
  './demos/production-server-data-center/*.tsx',
  {
    query: '?raw',
    import: 'default',
  },
)
const productionServerDataCenterDemoStyleSources = import.meta.glob<string>(
  './demos/production-server-data-center/*.css',
  {
    query: '?raw',
    import: 'default',
  },
)

const serverStateSourceFiles = [
  {
    name: 'server-state-demo.tsx',
    load: demoSources['./demos/server-state/server-state-demo.tsx']!,
  },
  {
    name: 'server-state-demo.css',
    load: demoStyleSources['./demos/server-state/server-state-demo.css']!,
  },
] as const

/** 加载服务端状态 Demo 的 React 组件。 */
async function loadServerStateComponent(): Promise<ReactComponentModule> {
  const { createServerStateDemo } =
    await demoFactories['./demos/server-state/server-state-demo.tsx']!()
  return { default: createServerStateDemo() }
}

/** 合并服务端状态 Demo 的真实组件与样式源码。 */
async function loadServerStateSource(): Promise<string> {
  const sources = await Promise.all(
    serverStateSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const queryClientProviderSourceFiles = [
  {
    name: 'query-client-provider-demo.tsx',
    load: queryClientProviderDemoSources[
      './demos/query-client-provider/query-client-provider-demo.tsx'
    ]!,
  },
  {
    name: 'query-client-provider-demo.css',
    load: queryClientProviderDemoStyleSources[
      './demos/query-client-provider/query-client-provider-demo.css'
    ]!,
  },
] as const

/** 加载 QueryClient 与 Provider 作用域 Demo 的 React 组件。 */
async function loadQueryClientProviderComponent(): Promise<ReactComponentModule> {
  const { createQueryClientProviderDemo } =
    await queryClientProviderDemoFactories[
      './demos/query-client-provider/query-client-provider-demo.tsx'
    ]!()
  return { default: createQueryClientProviderDemo() }
}

/** 合并 QueryClient 与 Provider Demo 的真实组件与样式源码。 */
async function loadQueryClientProviderSource(): Promise<string> {
  const sources = await Promise.all(
    queryClientProviderSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const firstUseQuerySourceFiles = [
  {
    name: 'first-use-query-demo.tsx',
    load: firstUseQueryDemoSources['./demos/first-use-query/first-use-query-demo.tsx']!,
  },
  {
    name: 'first-use-query-demo.css',
    load: firstUseQueryDemoStyleSources['./demos/first-use-query/first-use-query-demo.css']!,
  },
] as const

/** 加载第一个 useQuery Demo 的 React 组件。 */
async function loadFirstUseQueryComponent(): Promise<ReactComponentModule> {
  const { createFirstUseQueryDemo } =
    await firstUseQueryDemoFactories['./demos/first-use-query/first-use-query-demo.tsx']!()
  return { default: createFirstUseQueryDemo() }
}

/** 合并第一个 useQuery Demo 的真实组件与样式源码。 */
async function loadFirstUseQuerySource(): Promise<string> {
  const sources = await Promise.all(
    firstUseQuerySourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const queryFunctionAndFetchSourceFiles = [
  {
    name: 'query-function-and-fetch-demo.tsx',
    load: queryFunctionAndFetchDemoSources[
      './demos/query-function-and-fetch/query-function-and-fetch-demo.tsx'
    ]!,
  },
  {
    name: 'query-function-and-fetch-demo.css',
    load: queryFunctionAndFetchDemoStyleSources[
      './demos/query-function-and-fetch/query-function-and-fetch-demo.css'
    ]!,
  },
] as const

/** 加载 Query Function 与 fetch Demo 的 React 组件。 */
async function loadQueryFunctionAndFetchComponent(): Promise<ReactComponentModule> {
  const { createQueryFunctionAndFetchDemo } =
    await queryFunctionAndFetchDemoFactories[
      './demos/query-function-and-fetch/query-function-and-fetch-demo.tsx'
    ]!()
  return { default: createQueryFunctionAndFetchDemo() }
}

/** 合并 Query Function 与 fetch Demo 的真实组件与样式源码。 */
async function loadQueryFunctionAndFetchSource(): Promise<string> {
  const sources = await Promise.all(
    queryFunctionAndFetchSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const queryKeySourceFiles = [
  {
    name: 'query-key-demo.tsx',
    load: queryKeyDemoSources['./demos/query-key/query-key-demo.tsx']!,
  },
  {
    name: 'query-key-demo.css',
    load: queryKeyDemoStyleSources['./demos/query-key/query-key-demo.css']!,
  },
] as const

/** 加载 Query Key Demo 的 React 组件。 */
async function loadQueryKeyComponent(): Promise<ReactComponentModule> {
  const { createQueryKeyDemo } =
    await queryKeyDemoFactories['./demos/query-key/query-key-demo.tsx']!()
  return { default: createQueryKeyDemo() }
}

/** 合并 Query Key Demo 的真实组件与样式源码。 */
async function loadQueryKeySource(): Promise<string> {
  const sources = await Promise.all(
    queryKeySourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const queryStatusSourceFiles = [
  {
    name: 'query-status-demo.tsx',
    load: queryStatusDemoSources['./demos/query-status/query-status-demo.tsx']!,
  },
  {
    name: 'query-status-demo.css',
    load: queryStatusDemoStyleSources['./demos/query-status/query-status-demo.css']!,
  },
] as const

/** 加载查询状态 Demo 的 React 组件。 */
async function loadQueryStatusComponent(): Promise<ReactComponentModule> {
  const { createQueryStatusDemo } =
    await queryStatusDemoFactories['./demos/query-status/query-status-demo.tsx']!()
  return { default: createQueryStatusDemo() }
}

/** 合并查询状态 Demo 的真实组件与样式源码。 */
async function loadQueryStatusSource(): Promise<string> {
  const sources = await Promise.all(
    queryStatusSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const queryErrorHandlingSourceFiles = [
  {
    name: 'query-error-handling-demo.tsx',
    load: queryErrorHandlingDemoSources[
      './demos/query-error-handling/query-error-handling-demo.tsx'
    ]!,
  },
  {
    name: 'query-error-handling-demo.css',
    load: queryErrorHandlingDemoStyleSources[
      './demos/query-error-handling/query-error-handling-demo.css'
    ]!,
  },
] as const

/** 加载查询错误处理 Demo 的 React 组件。 */
async function loadQueryErrorHandlingComponent(): Promise<ReactComponentModule> {
  const { createQueryErrorHandlingDemo } =
    await queryErrorHandlingDemoFactories[
      './demos/query-error-handling/query-error-handling-demo.tsx'
    ]!()
  return { default: createQueryErrorHandlingDemo() }
}

/** 合并查询错误处理 Demo 的真实组件与样式源码。 */
async function loadQueryErrorHandlingSource(): Promise<string> {
  const sources = await Promise.all(
    queryErrorHandlingSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const queryCacheSharingSourceFiles = [
  {
    name: 'query-cache-sharing-demo.tsx',
    load: queryCacheSharingDemoSources['./demos/query-cache-sharing/query-cache-sharing-demo.tsx']!,
  },
  {
    name: 'query-cache-sharing-demo.css',
    load: queryCacheSharingDemoStyleSources[
      './demos/query-cache-sharing/query-cache-sharing-demo.css'
    ]!,
  },
] as const

/** 加载查询缓存共享 Demo 的 React 组件。 */
async function loadQueryCacheSharingComponent(): Promise<ReactComponentModule> {
  const { createQueryCacheSharingDemo } =
    await queryCacheSharingDemoFactories[
      './demos/query-cache-sharing/query-cache-sharing-demo.tsx'
    ]!()
  return { default: createQueryCacheSharingDemo() }
}

/** 合并查询缓存共享 Demo 的真实组件与样式源码。 */
async function loadQueryCacheSharingSource(): Promise<string> {
  const sources = await Promise.all(
    queryCacheSharingSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const staleTimeAndFreshnessSourceFiles = [
  {
    name: 'stale-time-and-freshness-demo.tsx',
    load: staleTimeAndFreshnessDemoSources[
      './demos/stale-time-and-freshness/stale-time-and-freshness-demo.tsx'
    ]!,
  },
  {
    name: 'stale-time-and-freshness-demo.css',
    load: staleTimeAndFreshnessDemoStyleSources[
      './demos/stale-time-and-freshness/stale-time-and-freshness-demo.css'
    ]!,
  },
] as const

/** 加载 staleTime 与数据新鲜度 Demo 的 React 组件。 */
async function loadStaleTimeAndFreshnessComponent(): Promise<ReactComponentModule> {
  const { createStaleTimeAndFreshnessDemo } =
    await staleTimeAndFreshnessDemoFactories[
      './demos/stale-time-and-freshness/stale-time-and-freshness-demo.tsx'
    ]!()
  return { default: createStaleTimeAndFreshnessDemo() }
}

/** 合并 staleTime 与数据新鲜度 Demo 的真实组件与样式源码。 */
async function loadStaleTimeAndFreshnessSource(): Promise<string> {
  const sources = await Promise.all(
    staleTimeAndFreshnessSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const backgroundRefetchingSourceFiles = [
  {
    name: 'background-refetching-demo.tsx',
    load: backgroundRefetchingDemoSources[
      './demos/background-refetching/background-refetching-demo.tsx'
    ]!,
  },
  {
    name: 'background-refetching-demo.css',
    load: backgroundRefetchingDemoStyleSources[
      './demos/background-refetching/background-refetching-demo.css'
    ]!,
  },
] as const

/** 加载后台重新获取 Demo 的 React 组件。 */
async function loadBackgroundRefetchingComponent(): Promise<ReactComponentModule> {
  const { createBackgroundRefetchingDemo } =
    await backgroundRefetchingDemoFactories[
      './demos/background-refetching/background-refetching-demo.tsx'
    ]!()
  return { default: createBackgroundRefetchingDemo() }
}

/** 合并后台重新获取 Demo 的真实组件与样式源码。 */
async function loadBackgroundRefetchingSource(): Promise<string> {
  const sources = await Promise.all(
    backgroundRefetchingSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const cacheLifecycleAndGcTimeSourceFiles = [
  {
    name: 'cache-lifecycle-and-gctime-demo.tsx',
    load: cacheLifecycleAndGcTimeDemoSources[
      './demos/cache-lifecycle-and-gctime/cache-lifecycle-and-gctime-demo.tsx'
    ]!,
  },
  {
    name: 'cache-lifecycle-and-gctime-demo.css',
    load: cacheLifecycleAndGcTimeDemoStyleSources[
      './demos/cache-lifecycle-and-gctime/cache-lifecycle-and-gctime-demo.css'
    ]!,
  },
] as const

/** 加载缓存生命周期与 gcTime Demo 的 React 组件。 */
async function loadCacheLifecycleAndGcTimeComponent(): Promise<ReactComponentModule> {
  const { createCacheLifecycleAndGcTimeDemo } =
    await cacheLifecycleAndGcTimeDemoFactories[
      './demos/cache-lifecycle-and-gctime/cache-lifecycle-and-gctime-demo.tsx'
    ]!()
  return { default: createCacheLifecycleAndGcTimeDemo() }
}

/** 合并缓存生命周期与 gcTime Demo 的真实组件与样式源码。 */
async function loadCacheLifecycleAndGcTimeSource(): Promise<string> {
  const sources = await Promise.all(
    cacheLifecycleAndGcTimeSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const conditionalQueriesSourceFiles = [
  {
    name: 'conditional-queries-demo.tsx',
    load: conditionalQueriesDemoSources[
      './demos/conditional-queries/conditional-queries-demo.tsx'
    ]!,
  },
  {
    name: 'conditional-queries-demo.css',
    load: conditionalQueriesDemoStyleSources[
      './demos/conditional-queries/conditional-queries-demo.css'
    ]!,
  },
] as const

/** 加载条件查询 Demo 的 React 组件。 */
async function loadConditionalQueriesComponent(): Promise<ReactComponentModule> {
  const { createConditionalQueriesDemo } =
    await conditionalQueriesDemoFactories[
      './demos/conditional-queries/conditional-queries-demo.tsx'
    ]!()
  return { default: createConditionalQueriesDemo() }
}

/** 合并条件查询 Demo 的真实组件与样式源码。 */
async function loadConditionalQueriesSource(): Promise<string> {
  const sources = await Promise.all(
    conditionalQueriesSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const reactQueryDevtoolsSourceFiles = [
  {
    name: 'react-query-devtools-demo.tsx',
    load: reactQueryDevtoolsDemoSources[
      './demos/react-query-devtools/react-query-devtools-demo.tsx'
    ]!,
  },
  {
    name: 'react-query-devtools-demo.css',
    load: reactQueryDevtoolsDemoStyleSources[
      './demos/react-query-devtools/react-query-devtools-demo.css'
    ]!,
  },
] as const

/** 加载 React Query Devtools Demo 的 React 组件。 */
async function loadReactQueryDevtoolsComponent(): Promise<ReactComponentModule> {
  const { createReactQueryDevtoolsDemo } =
    await reactQueryDevtoolsDemoFactories[
      './demos/react-query-devtools/react-query-devtools-demo.tsx'
    ]!()
  return { default: createReactQueryDevtoolsDemo() }
}

/** 合并 React Query Devtools Demo 的真实组件与样式源码。 */
async function loadReactQueryDevtoolsSource(): Promise<string> {
  const sources = await Promise.all(
    reactQueryDevtoolsSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const userProfilePanelSourceFiles = [
  {
    name: 'user-profile-panel-demo.tsx',
    load: userProfilePanelDemoSources['./demos/user-profile-panel/user-profile-panel-demo.tsx']!,
  },
  {
    name: 'user-profile-panel-demo.css',
    load: userProfilePanelDemoStyleSources[
      './demos/user-profile-panel/user-profile-panel-demo.css'
    ]!,
  },
] as const

/** 加载用户信息面板 Demo 的 React 组件。 */
async function loadUserProfilePanelComponent(): Promise<ReactComponentModule> {
  const { createUserProfilePanelDemo } =
    await userProfilePanelDemoFactories['./demos/user-profile-panel/user-profile-panel-demo.tsx']!()
  return { default: createUserProfilePanelDemo() }
}

/** 合并用户信息面板 Demo 的真实组件与样式源码。 */
async function loadUserProfilePanelSource(): Promise<string> {
  const sources = await Promise.all(
    userProfilePanelSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const articleListAndDetailSourceFiles = [
  {
    name: 'article-list-and-detail-demo.tsx',
    load: articleListAndDetailDemoSources[
      './demos/article-list-and-detail/article-list-and-detail-demo.tsx'
    ]!,
  },
  {
    name: 'article-list-and-detail-demo.css',
    load: articleListAndDetailDemoStyleSources[
      './demos/article-list-and-detail/article-list-and-detail-demo.css'
    ]!,
  },
] as const

/** 加载文章列表与详情 Demo 的 React 组件。 */
async function loadArticleListAndDetailComponent(): Promise<ReactComponentModule> {
  const { createArticleListAndDetailDemo } =
    await articleListAndDetailDemoFactories[
      './demos/article-list-and-detail/article-list-and-detail-demo.tsx'
    ]!()
  return { default: createArticleListAndDetailDemo() }
}

/** 合并文章列表与详情 Demo 的真实组件与样式源码。 */
async function loadArticleListAndDetailSource(): Promise<string> {
  const sources = await Promise.all(
    articleListAndDetailSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const queryKeyOrganizationSourceFiles = [
  {
    name: 'query-key-organization-demo.tsx',
    load: queryKeyOrganizationDemoSources[
      './demos/query-key-organization/query-key-organization-demo.tsx'
    ]!,
  },
  {
    name: 'query-key-organization-demo.css',
    load: queryKeyOrganizationDemoStyleSources[
      './demos/query-key-organization/query-key-organization-demo.css'
    ]!,
  },
] as const

/** 加载 Query Key 组织 Demo 的 React 组件。 */
async function loadQueryKeyOrganizationComponent(): Promise<ReactComponentModule> {
  const { createQueryKeyOrganizationDemo } =
    await queryKeyOrganizationDemoFactories[
      './demos/query-key-organization/query-key-organization-demo.tsx'
    ]!()
  return { default: createQueryKeyOrganizationDemo() }
}

/** 合并 Query Key 组织 Demo 的真实组件与样式源码。 */
async function loadQueryKeyOrganizationSource(): Promise<string> {
  const sources = await Promise.all(
    queryKeyOrganizationSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const queryOptionsReuseSourceFiles = [
  {
    name: 'query-options-reuse-demo.tsx',
    load: queryOptionsReuseDemoSources['./demos/query-options-reuse/query-options-reuse-demo.tsx']!,
  },
  {
    name: 'query-options-reuse-demo.css',
    load: queryOptionsReuseDemoStyleSources[
      './demos/query-options-reuse/query-options-reuse-demo.css'
    ]!,
  },
] as const

/** 加载查询配置复用 Demo 的 React 组件。 */
async function loadQueryOptionsReuseComponent(): Promise<ReactComponentModule> {
  const { createQueryOptionsReuseDemo } =
    await queryOptionsReuseDemoFactories[
      './demos/query-options-reuse/query-options-reuse-demo.tsx'
    ]!()
  return { default: createQueryOptionsReuseDemo() }
}

/** 合并查询配置复用 Demo 的真实组件与样式源码。 */
async function loadQueryOptionsReuseSource(): Promise<string> {
  const sources = await Promise.all(
    queryOptionsReuseSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const dependentQueriesSourceFiles = [
  {
    name: 'dependent-queries-demo.tsx',
    load: dependentQueriesDemoSources['./demos/dependent-queries/dependent-queries-demo.tsx']!,
  },
  {
    name: 'dependent-queries-demo.css',
    load: dependentQueriesDemoStyleSources['./demos/dependent-queries/dependent-queries-demo.css']!,
  },
] as const

/** 加载依赖查询 Demo 的 React 组件。 */
async function loadDependentQueriesComponent(): Promise<ReactComponentModule> {
  const { createDependentQueriesDemo } =
    await dependentQueriesDemoFactories['./demos/dependent-queries/dependent-queries-demo.tsx']!()
  return { default: createDependentQueriesDemo() }
}

/** 合并依赖查询 Demo 的真实组件与样式源码。 */
async function loadDependentQueriesSource(): Promise<string> {
  const sources = await Promise.all(
    dependentQueriesSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const parallelQueriesSourceFiles = [
  {
    name: 'parallel-queries-demo.tsx',
    load: parallelQueriesDemoSources['./demos/parallel-queries/parallel-queries-demo.tsx']!,
  },
  {
    name: 'parallel-queries-demo.css',
    load: parallelQueriesDemoStyleSources['./demos/parallel-queries/parallel-queries-demo.css']!,
  },
] as const

/** 加载并行查询 Demo 的 React 组件。 */
async function loadParallelQueriesComponent(): Promise<ReactComponentModule> {
  const { createParallelQueriesDemo } =
    await parallelQueriesDemoFactories['./demos/parallel-queries/parallel-queries-demo.tsx']!()
  return { default: createParallelQueriesDemo() }
}

/** 合并并行查询 Demo 的真实组件与样式源码。 */
async function loadParallelQueriesSource(): Promise<string> {
  const sources = await Promise.all(
    parallelQueriesSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const queryRetrySourceFiles = [
  {
    name: 'query-retry-demo.tsx',
    load: queryRetryDemoSources['./demos/query-retry/query-retry-demo.tsx']!,
  },
  {
    name: 'query-retry-demo.css',
    load: queryRetryDemoStyleSources['./demos/query-retry/query-retry-demo.css']!,
  },
] as const

/** 加载查询重试 Demo 的 React 组件。 */
async function loadQueryRetryComponent(): Promise<ReactComponentModule> {
  const { createQueryRetryDemo } =
    await queryRetryDemoFactories['./demos/query-retry/query-retry-demo.tsx']!()
  return { default: createQueryRetryDemo() }
}

/** 合并查询重试 Demo 的真实组件与样式源码。 */
async function loadQueryRetrySource(): Promise<string> {
  const sources = await Promise.all(
    queryRetrySourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const queryCancellationSourceFiles = [
  {
    name: 'query-cancellation-demo.tsx',
    load: queryCancellationDemoSources['./demos/query-cancellation/query-cancellation-demo.tsx']!,
  },
  {
    name: 'query-cancellation-demo.css',
    load: queryCancellationDemoStyleSources[
      './demos/query-cancellation/query-cancellation-demo.css'
    ]!,
  },
] as const

/** 加载查询取消 Demo 的 React 组件。 */
async function loadQueryCancellationComponent(): Promise<ReactComponentModule> {
  const { createQueryCancellationDemo } =
    await queryCancellationDemoFactories[
      './demos/query-cancellation/query-cancellation-demo.tsx'
    ]!()
  return { default: createQueryCancellationDemo() }
}

/** 合并查询取消 Demo 的真实组件与样式源码。 */
async function loadQueryCancellationSource(): Promise<string> {
  const sources = await Promise.all(
    queryCancellationSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const initialAndPlaceholderDataSourceFiles = [
  {
    name: 'initial-and-placeholder-data-demo.tsx',
    load: initialAndPlaceholderDataDemoSources[
      './demos/initial-and-placeholder-data/initial-and-placeholder-data-demo.tsx'
    ]!,
  },
  {
    name: 'initial-and-placeholder-data-demo.css',
    load: initialAndPlaceholderDataDemoStyleSources[
      './demos/initial-and-placeholder-data/initial-and-placeholder-data-demo.css'
    ]!,
  },
] as const

/** 加载初始数据与占位数据 Demo 的 React 组件。 */
async function loadInitialAndPlaceholderDataComponent(): Promise<ReactComponentModule> {
  const { createInitialAndPlaceholderDataDemo } =
    await initialAndPlaceholderDataDemoFactories[
      './demos/initial-and-placeholder-data/initial-and-placeholder-data-demo.tsx'
    ]!()
  return { default: createInitialAndPlaceholderDataDemo() }
}

/** 合并初始数据与占位数据 Demo 的真实组件与样式源码。 */
async function loadInitialAndPlaceholderDataSource(): Promise<string> {
  const sources = await Promise.all(
    initialAndPlaceholderDataSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const paginatedQueriesSourceFiles = [
  {
    name: 'paginated-queries-demo.tsx',
    load: paginatedQueriesDemoSources['./demos/paginated-queries/paginated-queries-demo.tsx']!,
  },
  {
    name: 'paginated-queries-demo.css',
    load: paginatedQueriesDemoStyleSources['./demos/paginated-queries/paginated-queries-demo.css']!,
  },
] as const

/** 加载分页查询 Demo 的 React 组件。 */
async function loadPaginatedQueriesComponent(): Promise<ReactComponentModule> {
  const { createPaginatedQueriesDemo } =
    await paginatedQueriesDemoFactories['./demos/paginated-queries/paginated-queries-demo.tsx']!()
  return { default: createPaginatedQueriesDemo() }
}

/** 合并分页查询 Demo 的真实组件与样式源码。 */
async function loadPaginatedQueriesSource(): Promise<string> {
  const sources = await Promise.all(
    paginatedQueriesSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const useMutationSourceFiles = [
  {
    name: 'use-mutation-demo.tsx',
    load: useMutationDemoSources['./demos/use-mutation/use-mutation-demo.tsx']!,
  },
  {
    name: 'use-mutation-demo.css',
    load: useMutationDemoStyleSources['./demos/use-mutation/use-mutation-demo.css']!,
  },
] as const

/** 加载 useMutation Demo 的 React 组件。 */
async function loadUseMutationComponent(): Promise<ReactComponentModule> {
  const { createUseMutationDemo } =
    await useMutationDemoFactories['./demos/use-mutation/use-mutation-demo.tsx']!()
  return { default: createUseMutationDemo() }
}

/** 合并 useMutation Demo 的真实组件与样式源码。 */
async function loadUseMutationSource(): Promise<string> {
  const sources = await Promise.all(
    useMutationSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const mutationLifecycleSourceFiles = [
  {
    name: 'mutation-lifecycle-demo.tsx',
    load: mutationLifecycleDemoSources['./demos/mutation-lifecycle/mutation-lifecycle-demo.tsx']!,
  },
  {
    name: 'mutation-lifecycle-demo.css',
    load: mutationLifecycleDemoStyleSources[
      './demos/mutation-lifecycle/mutation-lifecycle-demo.css'
    ]!,
  },
] as const

/** 加载 Mutation 生命周期 Demo 的 React 组件。 */
async function loadMutationLifecycleComponent(): Promise<ReactComponentModule> {
  const { createMutationLifecycleDemo } =
    await mutationLifecycleDemoFactories[
      './demos/mutation-lifecycle/mutation-lifecycle-demo.tsx'
    ]!()
  return { default: createMutationLifecycleDemo() }
}

/** 合并 Mutation 生命周期 Demo 的真实组件与样式源码。 */
async function loadMutationLifecycleSource(): Promise<string> {
  const sources = await Promise.all(
    mutationLifecycleSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const queryInvalidationSourceFiles = [
  {
    name: 'query-invalidation-demo.tsx',
    load: queryInvalidationDemoSources['./demos/query-invalidation/query-invalidation-demo.tsx']!,
  },
  {
    name: 'query-invalidation-demo.css',
    load: queryInvalidationDemoStyleSources[
      './demos/query-invalidation/query-invalidation-demo.css'
    ]!,
  },
] as const

/** 加载查询失效 Demo 的 React 组件。 */
async function loadQueryInvalidationComponent(): Promise<ReactComponentModule> {
  const { createQueryInvalidationDemo } =
    await queryInvalidationDemoFactories[
      './demos/query-invalidation/query-invalidation-demo.tsx'
    ]!()
  return { default: createQueryInvalidationDemo() }
}

/** 合并查询失效 Demo 的真实组件与样式源码。 */
async function loadQueryInvalidationSource(): Promise<string> {
  const sources = await Promise.all(
    queryInvalidationSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const updatesFromMutationResponsesSourceFiles = [
  {
    name: 'updates-from-mutation-responses-demo.tsx',
    load: updatesFromMutationResponsesDemoSources[
      './demos/updates-from-mutation-responses/updates-from-mutation-responses-demo.tsx'
    ]!,
  },
  {
    name: 'updates-from-mutation-responses-demo.css',
    load: updatesFromMutationResponsesDemoStyleSources[
      './demos/updates-from-mutation-responses/updates-from-mutation-responses-demo.css'
    ]!,
  },
] as const

/** 加载 Mutation 响应更新缓存 Demo 的 React 组件。 */
async function loadUpdatesFromMutationResponsesComponent(): Promise<ReactComponentModule> {
  const { createUpdatesFromMutationResponsesDemo } =
    await updatesFromMutationResponsesDemoFactories[
      './demos/updates-from-mutation-responses/updates-from-mutation-responses-demo.tsx'
    ]!()
  return { default: createUpdatesFromMutationResponsesDemo() }
}

/** 合并 Mutation 响应更新缓存 Demo 的真实组件与样式源码。 */
async function loadUpdatesFromMutationResponsesSource(): Promise<string> {
  const sources = await Promise.all(
    updatesFromMutationResponsesSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const optimisticUpdatesSourceFiles = [
  {
    name: 'optimistic-updates-demo.tsx',
    load: optimisticUpdatesDemoSources['./demos/optimistic-updates/optimistic-updates-demo.tsx']!,
  },
  {
    name: 'optimistic-updates-demo.css',
    load: optimisticUpdatesDemoStyleSources[
      './demos/optimistic-updates/optimistic-updates-demo.css'
    ]!,
  },
] as const

/** 加载乐观更新与回滚 Demo 的 React 组件。 */
async function loadOptimisticUpdatesComponent(): Promise<ReactComponentModule> {
  const { createOptimisticUpdatesDemo } =
    await optimisticUpdatesDemoFactories[
      './demos/optimistic-updates/optimistic-updates-demo.tsx'
    ]!()
  return { default: createOptimisticUpdatesDemo() }
}

/** 合并乐观更新与回滚 Demo 的真实组件与样式源码。 */
async function loadOptimisticUpdatesSource(): Promise<string> {
  const sources = await Promise.all(
    optimisticUpdatesSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const dataHooksAndModuleOrganizationSourceFiles = [
  {
    name: 'data-hooks-and-module-organization-demo.tsx',
    load: dataHooksAndModuleOrganizationDemoSources[
      './demos/data-hooks-and-module-organization/data-hooks-and-module-organization-demo.tsx'
    ]!,
  },
  {
    name: 'data-hooks-and-module-organization-demo.css',
    load: dataHooksAndModuleOrganizationDemoStyleSources[
      './demos/data-hooks-and-module-organization/data-hooks-and-module-organization-demo.css'
    ]!,
  },
] as const

/** 加载数据 Hooks 与模块组织 Demo 的 React 组件。 */
async function loadDataHooksAndModuleOrganizationComponent(): Promise<ReactComponentModule> {
  const { createDataHooksAndModuleOrganizationDemo } =
    await dataHooksAndModuleOrganizationDemoFactories[
      './demos/data-hooks-and-module-organization/data-hooks-and-module-organization-demo.tsx'
    ]!()
  return { default: createDataHooksAndModuleOrganizationDemo() }
}

/** 合并数据 Hooks 与模块组织 Demo 的真实组件与样式源码。 */
async function loadDataHooksAndModuleOrganizationSource(): Promise<string> {
  const sources = await Promise.all(
    dataHooksAndModuleOrganizationSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const paginatedContentManagementSourceFiles = [
  {
    name: 'paginated-content-management-demo.tsx',
    load: paginatedContentManagementDemoSources[
      './demos/paginated-content-management/paginated-content-management-demo.tsx'
    ]!,
  },
  {
    name: 'paginated-content-management-demo.css',
    load: paginatedContentManagementDemoStyleSources[
      './demos/paginated-content-management/paginated-content-management-demo.css'
    ]!,
  },
] as const

/** 加载分页内容管理 Demo 的 React 组件。 */
async function loadPaginatedContentManagementComponent(): Promise<ReactComponentModule> {
  const { createPaginatedContentManagementDemo } =
    await paginatedContentManagementDemoFactories[
      './demos/paginated-content-management/paginated-content-management-demo.tsx'
    ]!()
  return { default: createPaginatedContentManagementDemo() }
}

/** 合并分页内容管理 Demo 的真实组件与样式源码。 */
async function loadPaginatedContentManagementSource(): Promise<string> {
  const sources = await Promise.all(
    paginatedContentManagementSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const crudManagementWorkspaceSourceFiles = [
  {
    name: 'crud-management-workspace-demo.tsx',
    load: crudManagementWorkspaceDemoSources[
      './demos/crud-management-workspace/crud-management-workspace-demo.tsx'
    ]!,
  },
  {
    name: 'crud-management-workspace-demo.css',
    load: crudManagementWorkspaceDemoStyleSources[
      './demos/crud-management-workspace/crud-management-workspace-demo.css'
    ]!,
  },
] as const

/** 加载 CRUD 管理工作区 Demo 的 React 组件。 */
async function loadCrudManagementWorkspaceComponent(): Promise<ReactComponentModule> {
  const { createCrudManagementWorkspaceDemo } =
    await crudManagementWorkspaceDemoFactories[
      './demos/crud-management-workspace/crud-management-workspace-demo.tsx'
    ]!()
  return { default: createCrudManagementWorkspaceDemo() }
}

/** 合并 CRUD 管理工作区 Demo 的真实组件与样式源码。 */
async function loadCrudManagementWorkspaceSource(): Promise<string> {
  const sources = await Promise.all(
    crudManagementWorkspaceSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const infiniteQueriesSourceFiles = [
  {
    name: 'infinite-queries-demo.tsx',
    load: infiniteQueriesDemoSources['./demos/infinite-queries/infinite-queries-demo.tsx']!,
  },
  {
    name: 'infinite-queries-demo.css',
    load: infiniteQueriesDemoStyleSources['./demos/infinite-queries/infinite-queries-demo.css']!,
  },
] as const

/** 加载无限查询 Demo 的 React 组件。 */
async function loadInfiniteQueriesComponent(): Promise<ReactComponentModule> {
  const { createInfiniteQueriesDemo } =
    await infiniteQueriesDemoFactories['./demos/infinite-queries/infinite-queries-demo.tsx']!()
  return { default: createInfiniteQueriesDemo() }
}

/** 合并无限查询 Demo 的真实组件与样式源码。 */
async function loadInfiniteQueriesSource(): Promise<string> {
  const sources = await Promise.all(
    infiniteQueriesSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const infiniteQueryMemorySourceFiles = [
  {
    name: 'infinite-query-memory-demo.tsx',
    load: infiniteQueryMemoryDemoSources[
      './demos/infinite-query-memory/infinite-query-memory-demo.tsx'
    ]!,
  },
  {
    name: 'infinite-query-memory-demo.css',
    load: infiniteQueryMemoryDemoStyleSources[
      './demos/infinite-query-memory/infinite-query-memory-demo.css'
    ]!,
  },
] as const

/** 加载无限查询内存控制 Demo 的 React 组件。 */
async function loadInfiniteQueryMemoryComponent(): Promise<ReactComponentModule> {
  const { createInfiniteQueryMemoryDemo } =
    await infiniteQueryMemoryDemoFactories[
      './demos/infinite-query-memory/infinite-query-memory-demo.tsx'
    ]!()
  return { default: createInfiniteQueryMemoryDemo() }
}

/** 合并无限查询内存控制 Demo 的真实组件与样式源码。 */
async function loadInfiniteQueryMemorySource(): Promise<string> {
  const sources = await Promise.all(
    infiniteQueryMemorySourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const queryPrefetchingSourceFiles = [
  {
    name: 'query-prefetching-demo.tsx',
    load: queryPrefetchingDemoSources['./demos/query-prefetching/query-prefetching-demo.tsx']!,
  },
  {
    name: 'query-prefetching-demo.css',
    load: queryPrefetchingDemoStyleSources['./demos/query-prefetching/query-prefetching-demo.css']!,
  },
] as const

/** 加载查询预取 Demo 的 React 组件。 */
async function loadQueryPrefetchingComponent(): Promise<ReactComponentModule> {
  const { createQueryPrefetchingDemo } =
    await queryPrefetchingDemoFactories['./demos/query-prefetching/query-prefetching-demo.tsx']!()
  return { default: createQueryPrefetchingDemo() }
}

/** 合并查询预取 Demo 的真实组件与样式源码。 */
async function loadQueryPrefetchingSource(): Promise<string> {
  const sources = await Promise.all(
    queryPrefetchingSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const reactRouterQueryIntegrationSourceFiles = [
  {
    name: 'react-router-query-integration-demo.tsx',
    load: reactRouterQueryIntegrationDemoSources[
      './demos/react-router-query-integration/react-router-query-integration-demo.tsx'
    ]!,
  },
  {
    name: 'react-router-query-integration-demo.css',
    load: reactRouterQueryIntegrationDemoStyleSources[
      './demos/react-router-query-integration/react-router-query-integration-demo.css'
    ]!,
  },
] as const

/** 加载 React Router 数据集成 Demo 的 React 组件。 */
async function loadReactRouterQueryIntegrationComponent(): Promise<ReactComponentModule> {
  const { createReactRouterQueryIntegrationDemo } =
    await reactRouterQueryIntegrationDemoFactories[
      './demos/react-router-query-integration/react-router-query-integration-demo.tsx'
    ]!()
  return { default: createReactRouterQueryIntegrationDemo() }
}

/** 合并 React Router 数据集成 Demo 的真实组件与样式源码。 */
async function loadReactRouterQueryIntegrationSource(): Promise<string> {
  const sources = await Promise.all(
    reactRouterQueryIntegrationSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const requestWaterfallsSourceFiles = [
  {
    name: 'request-waterfalls-demo.tsx',
    load: requestWaterfallsDemoSources['./demos/request-waterfalls/request-waterfalls-demo.tsx']!,
  },
  {
    name: 'request-waterfalls-demo.css',
    load: requestWaterfallsDemoStyleSources[
      './demos/request-waterfalls/request-waterfalls-demo.css'
    ]!,
  },
] as const

/** 加载请求瀑布优化 Demo 的 React 组件。 */
async function loadRequestWaterfallsComponent(): Promise<ReactComponentModule> {
  const { createRequestWaterfallsDemo } =
    await requestWaterfallsDemoFactories[
      './demos/request-waterfalls/request-waterfalls-demo.tsx'
    ]!()
  return { default: createRequestWaterfallsDemo() }
}

/** 合并请求瀑布优化 Demo 的真实组件与样式源码。 */
async function loadRequestWaterfallsSource(): Promise<string> {
  const sources = await Promise.all(
    requestWaterfallsSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const queryRenderOptimizationsSourceFiles = [
  {
    name: 'query-render-optimizations-demo.tsx',
    load: queryRenderOptimizationsDemoSources[
      './demos/query-render-optimizations/query-render-optimizations-demo.tsx'
    ]!,
  },
  {
    name: 'query-render-optimizations-demo.css',
    load: queryRenderOptimizationsDemoStyleSources[
      './demos/query-render-optimizations/query-render-optimizations-demo.css'
    ]!,
  },
] as const

/** 加载查询渲染优化 Demo 的 React 组件。 */
async function loadQueryRenderOptimizationsComponent(): Promise<ReactComponentModule> {
  const { createQueryRenderOptimizationsDemo } =
    await queryRenderOptimizationsDemoFactories[
      './demos/query-render-optimizations/query-render-optimizations-demo.tsx'
    ]!()
  return { default: createQueryRenderOptimizationsDemo() }
}

/** 合并查询渲染优化 Demo 的真实组件与样式源码。 */
async function loadQueryRenderOptimizationsSource(): Promise<string> {
  const sources = await Promise.all(
    queryRenderOptimizationsSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const queryClientCacheOperationsSourceFiles = [
  {
    name: 'query-client-cache-operations-demo.tsx',
    load: queryClientCacheOperationsDemoSources[
      './demos/query-client-cache-operations/query-client-cache-operations-demo.tsx'
    ]!,
  },
  {
    name: 'query-client-cache-operations-demo.css',
    load: queryClientCacheOperationsDemoStyleSources[
      './demos/query-client-cache-operations/query-client-cache-operations-demo.css'
    ]!,
  },
] as const

/** 加载 Query Client 与缓存操作 Demo 的 React 组件。 */
async function loadQueryClientCacheOperationsComponent(): Promise<ReactComponentModule> {
  const { createQueryClientCacheOperationsDemo } =
    await queryClientCacheOperationsDemoFactories[
      './demos/query-client-cache-operations/query-client-cache-operations-demo.tsx'
    ]!()
  return { default: createQueryClientCacheOperationsDemo() }
}

/** 合并 Query Client 与缓存操作 Demo 的真实组件与样式源码。 */
async function loadQueryClientCacheOperationsSource(): Promise<string> {
  const sources = await Promise.all(
    queryClientCacheOperationsSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const concurrentMutationStateSourceFiles = [
  {
    name: 'concurrent-mutation-state-demo.tsx',
    load: concurrentMutationStateDemoSources[
      './demos/concurrent-mutation-state/concurrent-mutation-state-demo.tsx'
    ]!,
  },
  {
    name: 'concurrent-mutation-state-demo.css',
    load: concurrentMutationStateDemoStyleSources[
      './demos/concurrent-mutation-state/concurrent-mutation-state-demo.css'
    ]!,
  },
] as const

/** 加载并发 Mutation 状态 Demo 的 React 组件。 */
async function loadConcurrentMutationStateComponent(): Promise<ReactComponentModule> {
  const { createConcurrentMutationStateDemo } =
    await concurrentMutationStateDemoFactories[
      './demos/concurrent-mutation-state/concurrent-mutation-state-demo.tsx'
    ]!()
  return { default: createConcurrentMutationStateDemo() }
}

/** 合并并发 Mutation 状态 Demo 的真实组件与样式源码。 */
async function loadConcurrentMutationStateSource(): Promise<string> {
  const sources = await Promise.all(
    concurrentMutationStateSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const suspenseQueriesSourceFiles = [
  {
    name: 'suspense-queries-demo.tsx',
    load: suspenseQueriesDemoSources['./demos/suspense-queries/suspense-queries-demo.tsx']!,
  },
  {
    name: 'suspense-queries-demo.css',
    load: suspenseQueriesDemoStyleSources['./demos/suspense-queries/suspense-queries-demo.css']!,
  },
] as const

/** 加载 Suspense 查询 Demo 的 React 组件。 */
async function loadSuspenseQueriesComponent(): Promise<ReactComponentModule> {
  const { createSuspenseQueriesDemo } =
    await suspenseQueriesDemoFactories['./demos/suspense-queries/suspense-queries-demo.tsx']!()
  return { default: createSuspenseQueriesDemo() }
}

/** 合并 Suspense 查询 Demo 的真实组件与样式源码。 */
async function loadSuspenseQueriesSource(): Promise<string> {
  const sources = await Promise.all(
    suspenseQueriesSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const queryErrorBoundarySourceFiles = [
  {
    name: 'query-error-boundary-demo.tsx',
    load: queryErrorBoundaryDemoSources[
      './demos/query-error-boundary/query-error-boundary-demo.tsx'
    ]!,
  },
  {
    name: 'query-error-boundary-demo.css',
    load: queryErrorBoundaryDemoStyleSources[
      './demos/query-error-boundary/query-error-boundary-demo.css'
    ]!,
  },
] as const

/** 加载 Query Error Boundary Demo 的 React 组件。 */
async function loadQueryErrorBoundaryComponent(): Promise<ReactComponentModule> {
  const { createQueryErrorBoundaryDemo } =
    await queryErrorBoundaryDemoFactories[
      './demos/query-error-boundary/query-error-boundary-demo.tsx'
    ]!()
  return { default: createQueryErrorBoundaryDemo() }
}

/** 合并 Query Error Boundary Demo 的真实组件与样式源码。 */
async function loadQueryErrorBoundarySource(): Promise<string> {
  const sources = await Promise.all(
    queryErrorBoundarySourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const offlineQueryPersistenceSourceFiles = [
  {
    name: 'offline-query-persistence-demo.tsx',
    load: offlineQueryPersistenceDemoSources[
      './demos/offline-query-persistence/offline-query-persistence-demo.tsx'
    ]!,
  },
  {
    name: 'offline-query-persistence-demo.css',
    load: offlineQueryPersistenceDemoStyleSources[
      './demos/offline-query-persistence/offline-query-persistence-demo.css'
    ]!,
  },
] as const

/** 加载离线查询与缓存持久化 Demo 的 React 组件。 */
async function loadOfflineQueryPersistenceComponent(): Promise<ReactComponentModule> {
  const { createOfflineQueryPersistenceDemo } =
    await offlineQueryPersistenceDemoFactories[
      './demos/offline-query-persistence/offline-query-persistence-demo.tsx'
    ]!()
  return { default: createOfflineQueryPersistenceDemo() }
}

/** 合并离线查询与缓存持久化 Demo 的真实组件与样式源码。 */
async function loadOfflineQueryPersistenceSource(): Promise<string> {
  const sources = await Promise.all(
    offlineQueryPersistenceSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const ssrAndHydrationSourceFiles = [
  {
    name: 'ssr-and-hydration-demo.tsx',
    load: ssrAndHydrationDemoSources['./demos/ssr-and-hydration/ssr-and-hydration-demo.tsx']!,
  },
  {
    name: 'ssr-and-hydration-demo.css',
    load: ssrAndHydrationDemoStyleSources['./demos/ssr-and-hydration/ssr-and-hydration-demo.css']!,
  },
] as const

/** 加载 SSR 与 Hydration Demo 的 React 组件。 */
async function loadSsrAndHydrationComponent(): Promise<ReactComponentModule> {
  const { createSsrAndHydrationDemo } =
    await ssrAndHydrationDemoFactories['./demos/ssr-and-hydration/ssr-and-hydration-demo.tsx']!()
  return { default: createSsrAndHydrationDemo() }
}

/** 合并 SSR 与 Hydration Demo 的真实组件与样式源码。 */
async function loadSsrAndHydrationSource(): Promise<string> {
  const sources = await Promise.all(
    ssrAndHydrationSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const queryTestingSourceFiles = [
  {
    name: 'query-testing-demo.tsx',
    load: queryTestingDemoSources['./demos/query-testing/query-testing-demo.tsx']!,
  },
  {
    name: 'query-testing-demo.css',
    load: queryTestingDemoStyleSources['./demos/query-testing/query-testing-demo.css']!,
  },
] as const

/** 加载 TanStack Query 测试 Demo 的 React 组件。 */
async function loadQueryTestingComponent(): Promise<ReactComponentModule> {
  const { createQueryTestingDemo } =
    await queryTestingDemoFactories['./demos/query-testing/query-testing-demo.tsx']!()
  return { default: createQueryTestingDemo() }
}

/** 合并 TanStack Query 测试 Demo 的真实组件与样式源码。 */
async function loadQueryTestingSource(): Promise<string> {
  const sources = await Promise.all(
    queryTestingSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const productionDataLayerSourceFiles = [
  {
    name: 'production-data-layer-demo.tsx',
    load: productionDataLayerDemoSources[
      './demos/production-data-layer/production-data-layer-demo.tsx'
    ]!,
  },
  {
    name: 'production-data-layer-demo.css',
    load: productionDataLayerDemoStyleSources[
      './demos/production-data-layer/production-data-layer-demo.css'
    ]!,
  },
] as const

/** 加载生产级数据层架构 Demo 的 React 组件。 */
async function loadProductionDataLayerComponent(): Promise<ReactComponentModule> {
  const { createProductionDataLayerDemo } =
    await productionDataLayerDemoFactories[
      './demos/production-data-layer/production-data-layer-demo.tsx'
    ]!()
  return { default: createProductionDataLayerDemo() }
}

/** 合并生产级数据层架构 Demo 的真实组件与样式源码。 */
async function loadProductionDataLayerSource(): Promise<string> {
  const sources = await Promise.all(
    productionDataLayerSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const collaborationContentPlatformSourceFiles = [
  {
    name: 'collaboration-content-platform-demo.tsx',
    load: collaborationContentPlatformDemoSources[
      './demos/collaboration-content-platform/collaboration-content-platform-demo.tsx'
    ]!,
  },
  {
    name: 'collaboration-content-platform-demo.css',
    load: collaborationContentPlatformDemoStyleSources[
      './demos/collaboration-content-platform/collaboration-content-platform-demo.css'
    ]!,
  },
] as const

/** 加载协作内容平台 Demo 的 React 组件。 */
async function loadCollaborationContentPlatformComponent(): Promise<ReactComponentModule> {
  const { createCollaborationContentPlatformDemo } =
    await collaborationContentPlatformDemoFactories[
      './demos/collaboration-content-platform/collaboration-content-platform-demo.tsx'
    ]!()
  return { default: createCollaborationContentPlatformDemo() }
}

/** 合并协作内容平台 Demo 的真实组件与样式源码。 */
async function loadCollaborationContentPlatformSource(): Promise<string> {
  const sources = await Promise.all(
    collaborationContentPlatformSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

const productionServerDataCenterSourceFiles = [
  {
    name: 'production-server-data-center-demo.tsx',
    load: productionServerDataCenterDemoSources[
      './demos/production-server-data-center/production-server-data-center-demo.tsx'
    ]!,
  },
  {
    name: 'production-server-data-center-demo.css',
    load: productionServerDataCenterDemoStyleSources[
      './demos/production-server-data-center/production-server-data-center-demo.css'
    ]!,
  },
] as const

/** 加载生产级服务端数据中心 Demo 的 React 组件。 */
async function loadProductionServerDataCenterComponent(): Promise<ReactComponentModule> {
  const { createProductionServerDataCenterDemo } =
    await productionServerDataCenterDemoFactories[
      './demos/production-server-data-center/production-server-data-center-demo.tsx'
    ]!()
  return { default: createProductionServerDataCenterDemo() }
}

/** 合并生产级服务端数据中心 Demo 的真实组件与样式源码。 */
async function loadProductionServerDataCenterSource(): Promise<string> {
  const sources = await Promise.all(
    productionServerDataCenterSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

export const reactDataDemoAssets: DemoAssetManifest[] = [
  {
    id: 'react.data.learn.basics.server-state-and-tanstack-query.server-state-boundary-demo',
    title: '服务端状态与客户端状态边界观察器',
    runtime: 'react',
    loadComponent: loadServerStateComponent,
    loadSource: loadServerStateSource,
  },
  {
    id: 'react.data.learn.basics.query-client-and-provider.query-client-provider-scope-demo',
    title: 'QueryClient 与 Provider 作用域观察器',
    runtime: 'react',
    loadComponent: loadQueryClientProviderComponent,
    loadSource: loadQueryClientProviderSource,
  },
  {
    id: 'react.data.learn.basics.first-use-query.first-use-query-demo',
    title: '第一个 useQuery 观察器',
    runtime: 'react',
    loadComponent: loadFirstUseQueryComponent,
    loadSource: loadFirstUseQuerySource,
  },
  {
    id: 'react.data.learn.basics.query-function-and-fetch.query-function-and-fetch-demo',
    title: 'Query Function 与 fetch 观察器',
    runtime: 'react',
    loadComponent: loadQueryFunctionAndFetchComponent,
    loadSource: loadQueryFunctionAndFetchSource,
  },
  {
    id: 'react.data.learn.basics.query-key.query-key-demo',
    title: 'Query Key 观察器',
    runtime: 'react',
    loadComponent: loadQueryKeyComponent,
    loadSource: loadQueryKeySource,
  },
  {
    id: 'react.data.learn.basics.query-status.query-status-demo',
    title: '查询状态观察器',
    runtime: 'react',
    loadComponent: loadQueryStatusComponent,
    loadSource: loadQueryStatusSource,
  },
  {
    id: 'react.data.learn.basics.query-error-handling.query-error-handling-demo',
    title: '查询错误处理观察器',
    runtime: 'react',
    loadComponent: loadQueryErrorHandlingComponent,
    loadSource: loadQueryErrorHandlingSource,
  },
  {
    id: 'react.data.learn.basics.query-cache-and-sharing.query-cache-sharing-demo',
    title: '查询缓存共享观察器',
    runtime: 'react',
    loadComponent: loadQueryCacheSharingComponent,
    loadSource: loadQueryCacheSharingSource,
  },
  {
    id: 'react.data.learn.basics.stale-time-and-freshness.stale-time-and-freshness-demo',
    title: 'staleTime 与数据新鲜度观察器',
    runtime: 'react',
    loadComponent: loadStaleTimeAndFreshnessComponent,
    loadSource: loadStaleTimeAndFreshnessSource,
  },
  {
    id: 'react.data.learn.basics.background-refetching.background-refetching-demo',
    title: '后台重新获取观察器',
    runtime: 'react',
    loadComponent: loadBackgroundRefetchingComponent,
    loadSource: loadBackgroundRefetchingSource,
  },
  {
    id: 'react.data.learn.basics.cache-lifecycle-and-gctime.cache-lifecycle-demo',
    title: '缓存生命周期与 gcTime 观察器',
    runtime: 'react',
    loadComponent: loadCacheLifecycleAndGcTimeComponent,
    loadSource: loadCacheLifecycleAndGcTimeSource,
  },
  {
    id: 'react.data.learn.basics.conditional-queries.conditional-query-demo',
    title: '条件查询观察器',
    runtime: 'react',
    loadComponent: loadConditionalQueriesComponent,
    loadSource: loadConditionalQueriesSource,
  },
  {
    id: 'react.data.learn.basics.react-query-devtools.react-query-devtools-demo',
    title: 'React Query Devtools 观察器',
    runtime: 'react',
    loadComponent: loadReactQueryDevtoolsComponent,
    loadSource: loadReactQueryDevtoolsSource,
  },
  {
    id: 'react.data.learn.basics.user-profile-panel.user-profile-panel-demo',
    title: '用户信息面板观察器',
    runtime: 'react',
    loadComponent: loadUserProfilePanelComponent,
    loadSource: loadUserProfilePanelSource,
  },
  {
    id: 'react.data.learn.basics.article-list-and-detail.article-list-and-detail-demo',
    title: '文章列表与详情观察器',
    runtime: 'react',
    loadComponent: loadArticleListAndDetailComponent,
    loadSource: loadArticleListAndDetailSource,
  },
  {
    id: 'react.data.learn.intermediate.query-key-organization.query-key-organization-demo',
    title: 'Query Key 组织观察器',
    runtime: 'react',
    loadComponent: loadQueryKeyOrganizationComponent,
    loadSource: loadQueryKeyOrganizationSource,
  },
  {
    id: 'react.data.learn.intermediate.query-options-reuse.query-options-reuse-demo',
    title: '查询配置复用观察器',
    runtime: 'react',
    loadComponent: loadQueryOptionsReuseComponent,
    loadSource: loadQueryOptionsReuseSource,
  },
  {
    id: 'react.data.learn.intermediate.dependent-queries.dependent-queries-demo',
    title: '依赖查询观察器',
    runtime: 'react',
    loadComponent: loadDependentQueriesComponent,
    loadSource: loadDependentQueriesSource,
  },
  {
    id: 'react.data.learn.intermediate.parallel-queries.parallel-queries-demo',
    title: '并行查询观察器',
    runtime: 'react',
    loadComponent: loadParallelQueriesComponent,
    loadSource: loadParallelQueriesSource,
  },
  {
    id: 'react.data.learn.intermediate.query-retry.query-retry-demo',
    title: '查询重试观察器',
    runtime: 'react',
    loadComponent: loadQueryRetryComponent,
    loadSource: loadQueryRetrySource,
  },
  {
    id: 'react.data.learn.intermediate.query-cancellation.query-cancellation-demo',
    title: '查询取消观察器',
    runtime: 'react',
    loadComponent: loadQueryCancellationComponent,
    loadSource: loadQueryCancellationSource,
  },
  {
    id: 'react.data.learn.intermediate.initial-and-placeholder-data.initial-and-placeholder-data-demo',
    title: '初始数据与占位数据观察器',
    runtime: 'react',
    loadComponent: loadInitialAndPlaceholderDataComponent,
    loadSource: loadInitialAndPlaceholderDataSource,
  },
  {
    id: 'react.data.learn.intermediate.paginated-queries.paginated-queries-demo',
    title: '分页查询观察器',
    runtime: 'react',
    loadComponent: loadPaginatedQueriesComponent,
    loadSource: loadPaginatedQueriesSource,
  },
  {
    id: 'react.data.learn.intermediate.use-mutation.use-mutation-demo',
    title: 'useMutation 观察器',
    runtime: 'react',
    loadComponent: loadUseMutationComponent,
    loadSource: loadUseMutationSource,
  },
  {
    id: 'react.data.learn.intermediate.mutation-lifecycle.mutation-lifecycle-demo',
    title: 'Mutation 生命周期观察器',
    runtime: 'react',
    loadComponent: loadMutationLifecycleComponent,
    loadSource: loadMutationLifecycleSource,
  },
  {
    id: 'react.data.learn.intermediate.query-invalidation.query-invalidation-demo',
    title: '查询失效观察器',
    runtime: 'react',
    loadComponent: loadQueryInvalidationComponent,
    loadSource: loadQueryInvalidationSource,
  },
  {
    id: 'react.data.learn.intermediate.updates-from-mutation-responses.updates-from-mutation-responses-demo',
    title: 'Mutation 响应更新缓存观察器',
    runtime: 'react',
    loadComponent: loadUpdatesFromMutationResponsesComponent,
    loadSource: loadUpdatesFromMutationResponsesSource,
  },
  {
    id: 'react.data.learn.intermediate.optimistic-updates.optimistic-updates-demo',
    title: '乐观更新与回滚观察器',
    runtime: 'react',
    loadComponent: loadOptimisticUpdatesComponent,
    loadSource: loadOptimisticUpdatesSource,
  },
  {
    id: 'react.data.learn.intermediate.data-hooks-and-module-organization.data-hooks-and-module-organization-demo',
    title: '数据 Hooks 与模块组织观察器',
    runtime: 'react',
    loadComponent: loadDataHooksAndModuleOrganizationComponent,
    loadSource: loadDataHooksAndModuleOrganizationSource,
  },
  {
    id: 'react.data.learn.intermediate.paginated-content-management.paginated-content-management-demo',
    title: '分页内容管理观察器',
    runtime: 'react',
    loadComponent: loadPaginatedContentManagementComponent,
    loadSource: loadPaginatedContentManagementSource,
  },
  {
    id: 'react.data.learn.intermediate.crud-management-workspace.crud-management-workspace-demo',
    title: 'CRUD 管理工作区观察器',
    runtime: 'react',
    loadComponent: loadCrudManagementWorkspaceComponent,
    loadSource: loadCrudManagementWorkspaceSource,
  },
  {
    id: 'react.data.learn.advanced.infinite-queries.infinite-queries-demo',
    title: '无限查询观察器',
    runtime: 'react',
    loadComponent: loadInfiniteQueriesComponent,
    loadSource: loadInfiniteQueriesSource,
  },
  {
    id: 'react.data.learn.advanced.infinite-query-memory.infinite-query-memory-demo',
    title: '无限查询内存控制观察器',
    runtime: 'react',
    loadComponent: loadInfiniteQueryMemoryComponent,
    loadSource: loadInfiniteQueryMemorySource,
  },
  {
    id: 'react.data.learn.advanced.query-prefetching.query-prefetching-demo',
    title: '查询预取观察器',
    runtime: 'react',
    loadComponent: loadQueryPrefetchingComponent,
    loadSource: loadQueryPrefetchingSource,
  },
  {
    id: 'react.data.learn.advanced.react-router-query-integration.react-router-query-integration-demo',
    title: 'React Router 数据集成观察器',
    runtime: 'react',
    loadComponent: loadReactRouterQueryIntegrationComponent,
    loadSource: loadReactRouterQueryIntegrationSource,
  },
  {
    id: 'react.data.learn.advanced.request-waterfalls.request-waterfalls-demo',
    title: '请求瀑布优化观察器',
    runtime: 'react',
    loadComponent: loadRequestWaterfallsComponent,
    loadSource: loadRequestWaterfallsSource,
  },
  {
    id: 'react.data.learn.advanced.query-render-optimizations.query-render-optimizations-demo',
    title: '查询渲染优化观察器',
    runtime: 'react',
    loadComponent: loadQueryRenderOptimizationsComponent,
    loadSource: loadQueryRenderOptimizationsSource,
  },
  {
    id: 'react.data.learn.advanced.query-client-cache-operations.query-client-cache-operations-demo',
    title: 'Query Client 与缓存操作观察器',
    runtime: 'react',
    loadComponent: loadQueryClientCacheOperationsComponent,
    loadSource: loadQueryClientCacheOperationsSource,
  },
  {
    id: 'react.data.learn.advanced.concurrent-mutation-state.concurrent-mutation-state-demo',
    title: '并发 Mutation 状态观察器',
    runtime: 'react',
    loadComponent: loadConcurrentMutationStateComponent,
    loadSource: loadConcurrentMutationStateSource,
  },
  {
    id: 'react.data.learn.advanced.suspense-queries.suspense-queries-demo',
    title: 'Suspense 查询观察器',
    runtime: 'react',
    loadComponent: loadSuspenseQueriesComponent,
    loadSource: loadSuspenseQueriesSource,
  },
  {
    id: 'react.data.learn.advanced.query-error-boundary.query-error-boundary-demo',
    title: 'Query Error Boundary 观察器',
    runtime: 'react',
    loadComponent: loadQueryErrorBoundaryComponent,
    loadSource: loadQueryErrorBoundarySource,
  },
  {
    id: 'react.data.learn.advanced.offline-query-persistence.offline-query-persistence-demo',
    title: '离线查询与缓存持久化观察器',
    runtime: 'react',
    loadComponent: loadOfflineQueryPersistenceComponent,
    loadSource: loadOfflineQueryPersistenceSource,
  },
  {
    id: 'react.data.learn.advanced.ssr-and-hydration.ssr-and-hydration-demo',
    title: 'SSR 与 Hydration 观察器',
    runtime: 'react',
    loadComponent: loadSsrAndHydrationComponent,
    loadSource: loadSsrAndHydrationSource,
  },
  {
    id: 'react.data.learn.advanced.query-testing.query-testing-demo',
    title: 'TanStack Query 测试观察器',
    runtime: 'react',
    loadComponent: loadQueryTestingComponent,
    loadSource: loadQueryTestingSource,
  },
  {
    id: 'react.data.learn.advanced.production-data-layer.production-data-layer-demo',
    title: '生产级数据层架构观察器',
    runtime: 'react',
    loadComponent: loadProductionDataLayerComponent,
    loadSource: loadProductionDataLayerSource,
  },
  {
    id: 'react.data.learn.advanced.collaboration-content-platform.collaboration-content-platform-demo',
    title: '协作内容平台观察器',
    runtime: 'react',
    loadComponent: loadCollaborationContentPlatformComponent,
    loadSource: loadCollaborationContentPlatformSource,
  },
  {
    id: 'react.data.learn.advanced.production-server-data-center.production-server-data-center-demo',
    title: '生产级服务端数据中心观察器',
    runtime: 'react',
    loadComponent: loadProductionServerDataCenterComponent,
    loadSource: loadProductionServerDataCenterSource,
  },
]
