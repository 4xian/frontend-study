import type { LearningTrackManifest } from '@/common/catalog/types'

export const reactDataTrackManifest: LearningTrackManifest = {
  stages: [
    {
      id: 'basics',
      title: '基础课程',
      summary: '从服务端状态边界开始，逐步建立 TanStack Query 的查询与缓存模型。',
      categories: [
        {
          id: 'server-state-foundations',
          title: '服务端状态基础',
          summary: '理解远程数据的生命周期，并观察它与 React 客户端状态的职责边界。',
          topics: [
            '服务端状态',
            '客户端状态',
            'QueryClient',
            'QueryClientProvider',
            'useQuery',
            'queryKey',
            'queryFn',
            'status',
            'fetchStatus',
            'error',
            'isError',
            'isLoadingError',
            'isRefetchError',
            'response.ok',
            'QueryCache',
            '缓存共享',
            '请求去重',
            'staleTime',
            'fresh',
            'stale',
            'isStale',
            'dataUpdatedAt',
            'background refetching',
            'refetchOnMount',
            'refetchOnWindowFocus',
            'refetchOnReconnect',
            'isRefetching',
            'gcTime',
            'active query',
            'inactive query',
            'garbage collection',
            'QueryCache lifecycle',
            'enabled',
            'conditional query',
            'lazy query',
            'isLoading',
            'isEnabled',
            'TypeScript query inference',
            'QueryFunctionContext',
            'skipToken',
            'typed query key',
            'typed error',
            'React Query Devtools',
            'ReactQueryDevtools',
            'ReactQueryDevtoolsPanel',
            '用户信息面板',
            'user profile panel',
            '文章列表',
            '文章详情',
            'article list',
            'article detail',
          ],
          entries: [
            {
              id: 'react.data.learn.basics.server-state-and-tanstack-query',
              status: 'available',
            },
            {
              id: 'react.data.learn.basics.query-client-and-provider',
              status: 'available',
            },
            {
              id: 'react.data.learn.basics.first-use-query',
              status: 'available',
            },
            {
              id: 'react.data.learn.basics.query-function-and-fetch',
              status: 'available',
            },
            {
              id: 'react.data.learn.basics.query-key',
              status: 'available',
            },
            {
              id: 'react.data.learn.basics.query-status',
              status: 'available',
            },
            {
              id: 'react.data.learn.basics.query-error-handling',
              status: 'available',
            },
            {
              id: 'react.data.learn.basics.query-cache-and-sharing',
              status: 'available',
            },
            {
              id: 'react.data.learn.basics.stale-time-and-freshness',
              status: 'available',
            },
            {
              id: 'react.data.learn.basics.background-refetching',
              status: 'available',
            },
            {
              id: 'react.data.learn.basics.cache-lifecycle-and-gctime',
              status: 'available',
            },
            {
              id: 'react.data.learn.basics.conditional-queries',
              status: 'available',
            },
            {
              id: 'react.data.learn.basics.typescript-queries',
              status: 'available',
            },
            {
              id: 'react.data.learn.basics.react-query-devtools',
              status: 'available',
            },
            {
              id: 'react.data.learn.basics.user-profile-panel',
              status: 'available',
            },
            {
              id: 'react.data.learn.basics.article-list-and-detail',
              status: 'available',
            },
          ],
        },
      ],
    },
    {
      id: 'intermediate',
      title: '中级课程',
      summary: '围绕查询组织、异步写入和缓存协调建立可复用的数据层。',
      categories: [
        {
          id: 'query-organization',
          title: '查询组织',
          summary: '用稳定的 queryKey 层次和可复用配置，把分散的查询收成可维护的数据层。',
          topics: [
            'Query Key 组织',
            'query key factory',
            '层次化 queryKey',
            '前缀匹配',
            'exact',
            'queryOptions',
            '查询配置复用',
            'dependent queries',
            '依赖查询',
            'enabled',
            'isLoading',
            '请求瀑布',
            'parallel queries',
            '并行查询',
            'useQueries',
          ],
          entries: [
            {
              id: 'react.data.learn.intermediate.query-key-organization',
              status: 'available',
            },
            {
              id: 'react.data.learn.intermediate.query-options-reuse',
              status: 'available',
            },
            {
              id: 'react.data.learn.intermediate.dependent-queries',
              status: 'available',
            },
            {
              id: 'react.data.learn.intermediate.parallel-queries',
              status: 'available',
            },
          ],
        },
        {
          id: 'query-execution',
          title: '查询执行',
          summary: '处理失败后的自动重试，以及进行中查询的取消和回退。',
          topics: [
            'retry',
            '查询重试',
            'retryDelay',
            'failureCount',
            'failureReason',
            'query cancellation',
            '查询取消',
            'cancelQueries',
            'AbortSignal',
            'CancelledError',
          ],
          entries: [
            {
              id: 'react.data.learn.intermediate.query-retry',
              status: 'available',
            },
            {
              id: 'react.data.learn.intermediate.query-cancellation',
              status: 'available',
            },
          ],
        },
        {
          id: 'query-seeding',
          title: '初始与占位数据',
          summary: '用初始数据写入缓存，或用占位数据只给观察者画面。',
          topics: [
            'initialData',
            'placeholderData',
            'initialDataUpdatedAt',
            'isPlaceholderData',
            'keepPreviousData',
            '初始数据',
            '占位数据',
          ],
          entries: [
            {
              id: 'react.data.learn.intermediate.initial-and-placeholder-data',
              status: 'available',
            },
          ],
        },
        {
          id: 'paginated-queries',
          title: '分页查询',
          summary: '把页码写进 queryKey，用占位数据在翻页时留下上一页。',
          topics: [
            'paginated queries',
            '分页查询',
            'placeholderData',
            'keepPreviousData',
            'isPlaceholderData',
            'hasMore',
          ],
          entries: [
            {
              id: 'react.data.learn.intermediate.paginated-queries',
              status: 'available',
            },
          ],
        },
        {
          id: 'use-mutation',
          title: 'useMutation',
          summary: '用 useMutation 声明写入，调用 mutate 后才执行。',
          topics: [
            'useMutation',
            'mutationFn',
            'mutate',
            'mutateAsync',
            'reset',
            'isIdle',
            'isPending',
          ],
          entries: [
            {
              id: 'react.data.learn.intermediate.use-mutation',
              status: 'available',
            },
          ],
        },
        {
          id: 'mutation-lifecycle',
          title: 'Mutation 生命周期',
          summary: '分清钩子级与调用级回调，并看清连续 mutate 时调用回调只跟最后一次绑定。',
          topics: [
            'Mutation 生命周期',
            'onMutate',
            'onSuccess',
            'onError',
            'onSettled',
            'mutate callbacks',
          ],
          entries: [
            {
              id: 'react.data.learn.intermediate.mutation-lifecycle',
              status: 'available',
            },
          ],
        },
        {
          id: 'query-invalidation',
          title: '查询失效',
          summary:
            '用 invalidateQueries 把已知过期的查询标成 stale，并在 mutation 成功后作废相关查询。',
          topics: ['查询失效', 'invalidateQueries', 'exact', 'refetchType', 'queryKey'],
          entries: [
            {
              id: 'react.data.learn.intermediate.query-invalidation',
              status: 'available',
            },
          ],
        },
        {
          id: 'updates-from-mutation-responses',
          title: 'Mutation 响应更新缓存',
          summary: '用 mutation 返回的对象 setQueryData 写回对应查询，避免再拉一次已经拿到的数据。',
          topics: ['Mutation 响应更新缓存', 'setQueryData', 'onSuccess', 'immutability'],
          entries: [
            {
              id: 'react.data.learn.intermediate.updates-from-mutation-responses',
              status: 'available',
            },
          ],
        },
        {
          id: 'optimistic-updates',
          title: '乐观更新与回滚',
          summary:
            '在 mutation 完成前先改缓存，失败时用 onMutate 快照回滚，结束时再作废对齐服务端。',
          topics: ['乐观更新', '回滚', 'onMutate', 'setQueryData', 'cancelQueries'],
          entries: [
            {
              id: 'react.data.learn.intermediate.optimistic-updates',
              status: 'available',
            },
          ],
        },
        {
          id: 'data-hooks-and-module-organization',
          title: '数据 Hooks 与模块组织',
          summary: '把 queryOptions 和 mutationOptions 收进自定义 Hook，让组件只调用数据入口。',
          topics: ['数据 Hooks', 'queryOptions', 'mutationOptions', '模块组织'],
          entries: [
            {
              id: 'react.data.learn.intermediate.data-hooks-and-module-organization',
              status: 'available',
            },
          ],
        },
        {
          id: 'paginated-content-management',
          title: '实战：分页内容管理',
          summary: '把分页查询、数据 Hooks 和创建后作废组合进内容管理工作区。',
          topics: ['分页内容管理', 'keepPreviousData', 'queryOptions', 'invalidateQueries'],
          entries: [
            {
              id: 'react.data.learn.intermediate.paginated-content-management',
              status: 'available',
            },
          ],
        },
        {
          id: 'crud-management-workspace',
          title: '实战：CRUD 管理工作区',
          summary: '把列表读取、创建作废、保存写回详情和删除作废收进同一组数据 Hook。',
          topics: ['CRUD 管理工作区', 'queryOptions', 'setQueryData', 'invalidateQueries'],
          entries: [
            {
              id: 'react.data.learn.intermediate.crud-management-workspace',
              status: 'available',
            },
          ],
        },
      ],
    },
    {
      id: 'advanced',
      title: '高级课程',
      summary: '处理复杂查询、框架集成、持久化和生产级数据层边界。',
      categories: [
        {
          id: 'infinite-queries',
          title: '无限查询',
          summary: '用 useInfiniteQuery 把多页追加进同一条缓存，再用 fetchNextPage 加载更多。',
          topics: ['无限查询', 'useInfiniteQuery', 'fetchNextPage', 'getNextPageParam'],
          entries: [
            {
              id: 'react.data.learn.advanced.infinite-queries',
              status: 'available',
            },
          ],
        },
        {
          id: 'infinite-query-memory',
          title: '无限查询内存控制',
          summary: '用 maxPages 限制无限查询保留的页数，超过上限时丢掉最旧一页。',
          topics: ['无限查询内存控制', 'maxPages', 'useInfiniteQuery'],
          entries: [
            {
              id: 'react.data.learn.advanced.infinite-query-memory',
              status: 'available',
            },
          ],
        },
        {
          id: 'query-prefetching',
          title: '查询预取',
          summary: '在真正观察详情之前，用 queryClient.query 把结果放进缓存。',
          topics: ['查询预取', 'queryClient.query', 'staleTime'],
          entries: [
            {
              id: 'react.data.learn.advanced.query-prefetching',
              status: 'available',
            },
          ],
        },
        {
          id: 'react-router-query-integration',
          title: 'React Router 数据集成',
          summary: '在 React Router Loader 里 await queryClient.query，让详情页直接读缓存。',
          topics: ['React Router 数据集成', 'queryClient.query', 'queryOptions', 'staleTime'],
          entries: [
            {
              id: 'react.data.learn.advanced.react-router-query-integration',
              status: 'available',
            },
          ],
        },
        {
          id: 'request-waterfalls',
          title: '请求瀑布优化',
          summary: '把互不依赖的子查询提升到父组件，让两条请求一起开始。',
          topics: ['请求瀑布', '嵌套查询', '并行查询'],
          entries: [
            {
              id: 'react.data.learn.advanced.request-waterfalls',
              status: 'available',
            },
          ],
        },
        {
          id: 'query-render-optimizations',
          title: '查询渲染优化',
          summary: '用稳定的 select 让观察者只订阅切片，未选中字段变化时不重绘。',
          topics: ['查询渲染优化', 'select', 'notifyOnChangeProps'],
          entries: [
            {
              id: 'react.data.learn.advanced.query-render-optimizations',
              status: 'available',
            },
          ],
        },
        {
          id: 'query-client-cache-operations',
          title: 'Query Client 与缓存操作',
          summary:
            '用 getQueryData 和 setQueryData 同步读写，再用 setQueriesData 和 removeQueries 改已有条目。',
          topics: [
            'QueryClient',
            'getQueryData',
            'setQueryData',
            'setQueriesData',
            'removeQueries',
          ],
          entries: [
            {
              id: 'react.data.learn.advanced.query-client-cache-operations',
              status: 'available',
            },
          ],
        },
        {
          id: 'concurrent-mutation-state',
          title: '并发 Mutation 状态',
          summary: '默认多次 mutate 并行；观察者只跟最后一次，进行中的写入要问 MutationCache。',
          topics: ['并发 Mutation', 'useIsMutating', 'useMutationState', 'mutationKey'],
          entries: [
            {
              id: 'react.data.learn.advanced.concurrent-mutation-state',
              status: 'available',
            },
          ],
        },
        {
          id: 'suspense-queries',
          title: 'Suspense 查询',
          summary: '用 useSuspenseQuery 把首次等待交给 Suspense，成功后直接读取保证存在的 data。',
          topics: ['Suspense', 'useSuspenseQuery', 'queryOptions'],
          entries: [
            {
              id: 'react.data.learn.advanced.suspense-queries',
              status: 'available',
            },
          ],
        },
        {
          id: 'query-error-boundary',
          title: 'Query Error Boundary',
          summary: '首次失败抛给错误边界；再试一次必须先 reset 查询，再清掉边界。',
          topics: ['QueryErrorResetBoundary', 'Error Boundary', 'useSuspenseQuery'],
          entries: [
            {
              id: 'react.data.learn.advanced.query-error-boundary',
              status: 'available',
            },
          ],
        },
        {
          id: 'offline-query-persistence',
          title: '离线查询与缓存持久化',
          summary: '用 PersistQueryClientProvider 先恢复缓存再订阅写入，恢复完成前查询保持 idle。',
          topics: ['缓存持久化', 'PersistQueryClientProvider', 'useIsRestoring'],
          entries: [
            {
              id: 'react.data.learn.advanced.offline-query-persistence',
              status: 'available',
            },
          ],
        },
        {
          id: 'ssr-and-hydration',
          title: 'SSR 与 Hydration',
          summary:
            '服务端预取后再 dehydrate，客户端用 HydrationBoundary 注水，同一条查询不必再请求。',
          topics: ['SSR', 'HydrationBoundary', 'dehydrate'],
          entries: [
            {
              id: 'react.data.learn.advanced.ssr-and-hydration',
              status: 'available',
            },
          ],
        },
        {
          id: 'query-testing',
          title: 'TanStack Query 测试',
          summary: '每次测试用独立 QueryClient 包住钩子，失败用例关闭默认 retry。',
          topics: ['测试', 'QueryClientProvider', 'retry'],
          entries: [
            {
              id: 'react.data.learn.advanced.query-testing',
              status: 'available',
            },
          ],
        },
        {
          id: 'production-data-layer',
          title: '生产级数据层架构',
          summary: '应用边界只放一份 QueryClient，服务端数据进查询缓存，客户端状态只留同步值。',
          topics: ['数据层', 'QueryClient', 'queryOptions'],
          entries: [
            {
              id: 'react.data.learn.advanced.production-data-layer',
              status: 'available',
            },
          ],
        },
        {
          id: 'collaboration-content-platform',
          title: '实战：协作内容平台',
          summary: '先预取协作流首页，再观察并加载更多；创建后作废同一条无限查询。',
          topics: ['无限查询', '预取', 'infiniteQueryOptions'],
          entries: [
            {
              id: 'react.data.learn.advanced.collaboration-content-platform',
              status: 'available',
            },
          ],
        },
        {
          id: 'production-server-data-center',
          title: '实战：生产级服务端数据中心',
          summary: '应用边界一份 QueryClient；先预取任务列表再观察，创建后作废同一条查询。',
          topics: ['数据中心', 'queryOptions', 'queryClient.query'],
          entries: [
            {
              id: 'react.data.learn.advanced.production-server-data-center',
              status: 'available',
            },
          ],
        },
      ],
    },
  ],
}
