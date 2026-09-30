import {
  QueryClient,
  QueryClientProvider,
  infiniteQueryOptions,
  mutationOptions,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useRef, useState, type ComponentType, type ReactElement } from 'react'

import './collaboration-content-platform-demo.css'

type TaskItem = {
  id: string
  title: string
  owner: string
}

type TaskPage = {
  tasks: TaskItem[]
  nextCursor?: number
}

type TaskStore = {
  pages: Record<number, TaskPage>
  nextId: number
  fetchCount: number
  onFetchCountChange?: (count: number) => void
}

type ViewMode = 'idle' | 'prefetched' | 'feed'

const createdTitle = '核对创建任务'

const initialPages: Record<number, TaskPage> = {
  0: {
    tasks: [{ id: 't-1', title: '现有任务', owner: '林晓' }],
    nextCursor: 1,
  },
  1: {
    tasks: [{ id: 't-2', title: '第二页任务', owner: '周宁' }],
  },
}

const taskStore: TaskStore = {
  pages: {
    0: {
      tasks: [{ id: 't-1', title: '现有任务', owner: '林晓' }],
      nextCursor: 1,
    },
    1: {
      tasks: [{ id: 't-2', title: '第二页任务', owner: '周宁' }],
    },
  },
  nextId: 3,
  fetchCount: 0,
}

const pendingTimers: number[] = []

/** 清掉未完成的延迟，避免离开页面后还改仓库。 */
function clearPendingTimers(): void {
  for (const timerId of pendingTimers) {
    window.clearTimeout(timerId)
  }
  pendingTimers.length = 0
}

/** 把协作流仓库恢复成进入时的现有任务。 */
function restoreTaskStore(): void {
  clearPendingTimers()
  taskStore.pages = {
    0: {
      tasks: [...initialPages[0]!.tasks],
      nextCursor: 1,
    },
    1: {
      tasks: [...initialPages[1]!.tasks],
    },
  }
  taskStore.nextId = 3
  taskStore.fetchCount = 0
}

/** 等待固定时长，让预取、加载更多和作废后的重拉能被看清。 */
function waitForQuery(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    const timerId = window.setTimeout(() => {
      const index = pendingTimers.indexOf(timerId)
      if (index >= 0) {
        pendingTimers.splice(index, 1)
      }
      resolve()
    }, delayMs)
    pendingTimers.push(timerId)
  })
}

/** 按游标读取一页协作任务，并统计真实请求。 */
async function loadTaskPage(pageParam: number): Promise<TaskPage> {
  queueMicrotask(() => {
    taskStore.fetchCount += 1
    taskStore.onFetchCountChange?.(taskStore.fetchCount)
  })
  await waitForQuery(1400)
  const payload = taskStore.pages[pageParam] ?? { tasks: [] }
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload))}`
  const response = await fetch(successUrl)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskPage
}

/** 在首页前追加一条林晓的协作任务。 */
async function createTask(): Promise<TaskItem> {
  await waitForQuery(1400)
  const created: TaskItem = {
    id: `t-${taskStore.nextId}`,
    title: createdTitle,
    owner: '林晓',
  }
  taskStore.nextId += 1
  const home = taskStore.pages[0] ?? { tasks: [] }
  taskStore.pages = {
    ...taskStore.pages,
    0: {
      ...home,
      tasks: [created, ...home.tasks],
    },
  }
  return created
}

const feedOptions = infiniteQueryOptions({
  queryKey: ['tasks', 'feed'] as const,
  queryFn: ({ pageParam }) => loadTaskPage(pageParam),
  initialPageParam: 0,
  getNextPageParam: (lastPage: TaskPage) => lastPage.nextCursor,
  staleTime: Infinity,
  retry: false,
})

const createTaskOptions = mutationOptions({
  mutationFn: createTask,
  retry: false,
})

/** 创建应用边界上的协作平台 QueryClient。 */
function createPlatformQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        retry: false,
      },
    },
  })
}

/** 把任务写成可观察文案。 */
function formatTask(task: TaskItem | undefined): string {
  return task ? `${task.title} / ${task.owner}` : '无'
}

type FeedCache = {
  pages: TaskPage[]
  pageParams: unknown[]
}

/** 从无限查询缓存里取出展平后的任务。 */
function flattenFeed(data: FeedCache | undefined): TaskItem[] {
  return data?.pages.flatMap((page) => page.tasks) ?? []
}

/** 订阅协作流。 */
function useTaskFeed() {
  return useInfiniteQuery(feedOptions)
}

/** 创建协作任务后作废同一条无限查询。 */
function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...createTaskOptions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: feedOptions.queryKey })
    },
  })
}

/** 对照预取缓存、页数和真实请求次数。 */
function CollaborationContentPlatformChrome({
  busy,
  canCreate,
  canLoadMore,
  canOpen,
  canPrefetch,
  fetchCount,
  firstTask,
  lastTask,
  pageCount,
  viewMode,
  onPrefetch,
  onOpen,
  onLoadMore,
  onCreate,
  onReset,
}: {
  busy: boolean
  canCreate: boolean
  canLoadMore: boolean
  canOpen: boolean
  canPrefetch: boolean
  fetchCount: number
  firstTask: string
  lastTask: string
  pageCount: number
  viewMode: ViewMode
  onPrefetch: () => void
  onOpen: () => void
  onLoadMore: () => void
  onCreate: () => void
  onReset: () => void
}): ReactElement {
  return (
    <section
      className="collaboration-content-platform-demo"
      data-testid="collaboration-content-platform-demo"
    >
      <header className="collaboration-content-platform-header">
        <span>TanStack Query</span>
        <h2>协作内容平台</h2>
        <p>
          先用 infiniteQuery 预取协作流首页，再挂
          useInfiniteQuery。加载更多追加第二页；创建后作废同一条 queryKey，已打开的页会按序重拉。
        </p>
      </header>

      <div className="collaboration-content-platform-metrics" aria-live="polite">
        <div>
          <span>列表首项</span>
          <strong data-testid="collaboration-content-platform-first">{firstTask}</strong>
        </div>
        <div>
          <span>列表末项</span>
          <strong data-testid="collaboration-content-platform-last">{lastTask}</strong>
        </div>
        <div>
          <span>页数</span>
          <strong data-testid="collaboration-content-platform-pages">{pageCount}</strong>
        </div>
        <div>
          <span>请求次数</span>
          <strong data-testid="collaboration-content-platform-fetch-count">{fetchCount}</strong>
        </div>
      </div>

      <div className="collaboration-content-platform-actions">
        <button
          type="button"
          data-kind="primary"
          onClick={onPrefetch}
          disabled={!canPrefetch || busy}
        >
          预取协作流首页
        </button>
        <button type="button" onClick={onOpen} disabled={!canOpen || busy}>
          打开协作流
        </button>
        <button type="button" onClick={onLoadMore} disabled={!canLoadMore || busy}>
          加载更多
        </button>
        <button type="button" onClick={onCreate} disabled={!canCreate || busy}>
          创建协作任务
        </button>
        <button type="button" onClick={onReset} disabled={busy}>
          重置
        </button>
      </div>

      <div className="collaboration-content-platform-columns">
        <section className="collaboration-content-platform-card">
          <h3>当前观察</h3>
          {viewMode === 'idle' && (
            <p className="collaboration-content-platform-message" role="status">
              还没有预取。点预取协作流首页后，缓存会出现现有任务 / 林晓，请求次数加一。
            </p>
          )}
          {viewMode === 'prefetched' && (
            <p className="collaboration-content-platform-message" role="status">
              首页已经在缓存里。再点打开协作流时，观察者直接读缓存，请求次数不会增加。
            </p>
          )}
          {viewMode === 'feed' && (
            <p className="collaboration-content-platform-message" role="status">
              协作流已打开。加载更多会追加第二页任务 / 周宁；创建后同一条无限查询按序重拉。
            </p>
          )}
        </section>
      </div>
    </section>
  )
}

/** 在已提供的 QueryClient 下观察协作流。 */
function CollaborationFeedObserver({
  fetchCount,
  onOpen,
  onPrefetch,
  onReset,
}: {
  fetchCount: number
  onOpen: () => void
  onPrefetch: () => void
  onReset: () => void
}): ReactElement {
  const feedQuery = useTaskFeed()
  const createMutation = useCreateTask()
  const tasks = flattenFeed(feedQuery.data)
  const firstTask = formatTask(tasks[0])
  const lastTask = formatTask(tasks[tasks.length - 1])
  const pageCount = feedQuery.data?.pages.length ?? 0
  const busy = feedQuery.isFetching || createMutation.isPending

  /** 在还有下一页且当前没有进行中的请求时追加一页。 */
  function loadMore(): void {
    if (feedQuery.hasNextPage && !feedQuery.isFetching) {
      void feedQuery.fetchNextPage()
    }
  }

  /** 通过数据 Hook 创建协作任务。 */
  function runCreate(): void {
    createMutation.mutate()
  }

  return (
    <CollaborationContentPlatformChrome
      busy={busy}
      canCreate
      canLoadMore={Boolean(feedQuery.hasNextPage) && !feedQuery.isFetching}
      canOpen={false}
      canPrefetch={false}
      fetchCount={fetchCount}
      firstTask={firstTask}
      lastTask={lastTask}
      pageCount={pageCount}
      viewMode="feed"
      onPrefetch={onPrefetch}
      onOpen={onOpen}
      onLoadMore={loadMore}
      onCreate={runCreate}
      onReset={onReset}
    />
  )
}

/** 用 QueryClientProvider 包住协作流观察。 */
function CollaborationFeedSession({
  fetchCount,
  queryClient,
  onOpen,
  onPrefetch,
  onReset,
}: {
  fetchCount: number
  queryClient: QueryClient
  onOpen: () => void
  onPrefetch: () => void
  onReset: () => void
}): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <CollaborationFeedObserver
        fetchCount={fetchCount}
        onOpen={onOpen}
        onPrefetch={onPrefetch}
        onReset={onReset}
      />
    </QueryClientProvider>
  )
}

/** 为课程页面注册协作内容平台 Demo。 */
export function createCollaborationContentPlatformDemo(): ComponentType {
  /** 对照无限查询预取、加载更多和创建后作废。 */
  function CollaborationContentPlatformDemoRoot(): ReactElement {
    const [queryClient, setQueryClient] = useState<QueryClient | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>('idle')
    const [fetchCount, setFetchCount] = useState(0)
    const [prefetching, setPrefetching] = useState(false)
    const aliveRef = useRef(true)

    useEffect(() => {
      aliveRef.current = true
      restoreTaskStore()
      setFetchCount(0)
      taskStore.onFetchCountChange = setFetchCount
      return () => {
        aliveRef.current = false
        taskStore.onFetchCountChange = undefined
        restoreTaskStore()
      }
    }, [])

    /** 在观察者出现之前预取无限查询的第一页。 */
    async function prefetchFeed(): Promise<void> {
      if (queryClient || viewMode !== 'idle') {
        return
      }
      const client = createPlatformQueryClient()
      setQueryClient(client)
      setPrefetching(true)
      await client.infiniteQuery(feedOptions)
      if (!aliveRef.current) {
        return
      }
      setPrefetching(false)
      setViewMode('prefetched')
    }

    /** 挂上协作流观察者。 */
    function openFeed(): void {
      if (viewMode === 'feed') {
        return
      }
      if (!queryClient) {
        setQueryClient(createPlatformQueryClient())
      }
      setViewMode('feed')
    }

    /** 丢掉数据层和计数，回到未观察查询的状态。 */
    function resetDemo(): void {
      restoreTaskStore()
      setFetchCount(0)
      setPrefetching(false)
      setQueryClient(null)
      setViewMode('idle')
    }

    if (viewMode === 'feed' && queryClient) {
      return (
        <CollaborationFeedSession
          fetchCount={fetchCount}
          queryClient={queryClient}
          onOpen={openFeed}
          onPrefetch={() => {
            void prefetchFeed()
          }}
          onReset={resetDemo}
        />
      )
    }

    const cachedFeed = queryClient?.getQueryData<FeedCache>(feedOptions.queryKey)
    const cachedTasks = flattenFeed(cachedFeed)
    const busy = prefetching

    return (
      <CollaborationContentPlatformChrome
        busy={busy}
        canCreate={false}
        canLoadMore={false}
        canOpen={viewMode === 'prefetched' && !busy}
        canPrefetch={viewMode === 'idle' && !busy}
        fetchCount={fetchCount}
        firstTask={formatTask(cachedTasks[0])}
        lastTask={formatTask(cachedTasks[cachedTasks.length - 1])}
        pageCount={cachedFeed?.pages.length ?? 0}
        viewMode={viewMode}
        onPrefetch={() => {
          void prefetchFeed()
        }}
        onOpen={openFeed}
        onLoadMore={() => undefined}
        onCreate={() => undefined}
        onReset={resetDemo}
      />
    )
  }

  return CollaborationContentPlatformDemoRoot
}
