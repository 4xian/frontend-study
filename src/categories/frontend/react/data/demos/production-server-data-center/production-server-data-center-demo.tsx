import {
  QueryClient,
  QueryClientProvider,
  mutationOptions,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useRef, useState, type ComponentType, type ReactElement } from 'react'

import './production-server-data-center-demo.css'

type TaskItem = {
  id: string
  title: string
  owner: string
}

type TaskStore = {
  tasks: TaskItem[]
  nextId: number
  fetchCount: number
  onFetchCountChange?: (count: number) => void
}

type ThemeMode = '浅色' | '深色'
type ViewMode = 'idle' | 'prefetched' | 'center'

const createdTitle = '核对创建任务'
const initialTasks: TaskItem[] = [{ id: 't-1', title: '现有任务', owner: '林晓' }]

const taskStore: TaskStore = {
  tasks: [{ id: 't-1', title: '现有任务', owner: '林晓' }],
  nextId: 2,
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

/** 把任务仓库恢复成进入时的现有任务。 */
function restoreTaskStore(): void {
  clearPendingTimers()
  taskStore.tasks = [...initialTasks]
  taskStore.nextId = 2
  taskStore.fetchCount = 0
}

/** 等待固定时长，让预取、打开和作废后的重拉能被看清。 */
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

/** 读取任务列表，并统计真实请求。 */
async function loadTasks(): Promise<TaskItem[]> {
  queueMicrotask(() => {
    taskStore.fetchCount += 1
    taskStore.onFetchCountChange?.(taskStore.fetchCount)
  })
  await waitForQuery(1400)
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(taskStore.tasks))}`
  const response = await fetch(successUrl)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem[]
}

/** 追加一条林晓的新任务。 */
async function createTask(): Promise<TaskItem> {
  await waitForQuery(1400)
  const created: TaskItem = {
    id: `t-${taskStore.nextId}`,
    title: createdTitle,
    owner: '林晓',
  }
  taskStore.nextId += 1
  taskStore.tasks = [created, ...taskStore.tasks]
  return created
}

const taskListOptions = queryOptions({
  queryKey: ['tasks'] as const,
  queryFn: loadTasks,
  staleTime: Infinity,
  retry: false,
})

const createTaskOptions = mutationOptions({
  mutationFn: createTask,
  retry: false,
})

/** 创建应用边界上的生产 QueryClient。 */
function createCenterQueryClient(): QueryClient {
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

/** 订阅任务列表。 */
function useTaskList() {
  return useQuery(taskListOptions)
}

/** 创建任务后作废同一条列表查询。 */
function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...createTaskOptions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: taskListOptions.queryKey })
    },
  })
}

/** 对照查询缓存、主题和真实请求次数。 */
function ProductionServerDataCenterChrome({
  busy,
  canCreate,
  canOpen,
  canPrefetch,
  fetchCount,
  firstTask,
  theme,
  viewMode,
  onPrefetch,
  onOpen,
  onCreate,
  onToggleTheme,
  onReset,
}: {
  busy: boolean
  canCreate: boolean
  canOpen: boolean
  canPrefetch: boolean
  fetchCount: number
  firstTask: string
  theme: ThemeMode
  viewMode: ViewMode
  onPrefetch: () => void
  onOpen: () => void
  onCreate: () => void
  onToggleTheme: () => void
  onReset: () => void
}): ReactElement {
  return (
    <section
      className="production-server-data-center-demo"
      data-testid="production-server-data-center-demo"
    >
      <header className="production-server-data-center-header">
        <span>TanStack Query</span>
        <h2>生产级服务端数据中心</h2>
        <p>
          应用边界一份 QueryClient。先用 query 预取任务列表，再挂 useQuery。创建后作废同一条
          queryKey；主题留在客户端状态。
        </p>
      </header>

      <div className="production-server-data-center-metrics" aria-live="polite">
        <div>
          <span>列表首项</span>
          <strong data-testid="production-server-data-center-first">{firstTask}</strong>
        </div>
        <div>
          <span>主题</span>
          <strong data-testid="production-server-data-center-theme">{theme}</strong>
        </div>
        <div>
          <span>请求次数</span>
          <strong data-testid="production-server-data-center-fetch-count">{fetchCount}</strong>
        </div>
      </div>

      <div className="production-server-data-center-actions">
        <button
          type="button"
          data-kind="primary"
          onClick={onPrefetch}
          disabled={!canPrefetch || busy}
        >
          预取任务列表
        </button>
        <button type="button" onClick={onOpen} disabled={!canOpen || busy}>
          打开数据中心
        </button>
        <button type="button" onClick={onCreate} disabled={!canCreate || busy}>
          创建任务
        </button>
        <button type="button" onClick={onToggleTheme} disabled={busy}>
          切换客户端主题
        </button>
        <button type="button" onClick={onReset} disabled={busy}>
          重置
        </button>
      </div>

      <div className="production-server-data-center-columns">
        <section className="production-server-data-center-card">
          <h3>当前观察</h3>
          {viewMode === 'idle' && (
            <p className="production-server-data-center-message" role="status">
              还没有预取。点预取任务列表后，缓存会出现现有任务 / 林晓，请求次数加一。
            </p>
          )}
          {viewMode === 'prefetched' && (
            <p className="production-server-data-center-message" role="status">
              列表已经在缓存里。再点打开数据中心时，观察者直接读缓存，请求次数不会增加。
            </p>
          )}
          {viewMode === 'center' && (
            <p className="production-server-data-center-message" role="status">
              数据中心已打开。创建后同一条列表查询会重拉；切换主题不发请求。
            </p>
          )}
        </section>
      </div>
    </section>
  )
}

/** 在已提供的 QueryClient 下观察任务列表。 */
function ProductionCenterObserver({
  fetchCount,
  theme,
  onOpen,
  onPrefetch,
  onToggleTheme,
  onReset,
}: {
  fetchCount: number
  theme: ThemeMode
  onOpen: () => void
  onPrefetch: () => void
  onToggleTheme: () => void
  onReset: () => void
}): ReactElement {
  const listQuery = useTaskList()
  const createMutation = useCreateTask()
  const firstTask = formatTask(listQuery.data?.[0])
  const busy = listQuery.isFetching || createMutation.isPending

  /** 通过数据 Hook 创建任务。 */
  function runCreate(): void {
    createMutation.mutate()
  }

  return (
    <ProductionServerDataCenterChrome
      busy={busy}
      canCreate
      canOpen={false}
      canPrefetch={false}
      fetchCount={fetchCount}
      firstTask={firstTask}
      theme={theme}
      viewMode="center"
      onPrefetch={onPrefetch}
      onOpen={onOpen}
      onCreate={runCreate}
      onToggleTheme={onToggleTheme}
      onReset={onReset}
    />
  )
}

/** 用 QueryClientProvider 包住数据中心观察。 */
function ProductionCenterSession({
  fetchCount,
  queryClient,
  theme,
  onOpen,
  onPrefetch,
  onToggleTheme,
  onReset,
}: {
  fetchCount: number
  queryClient: QueryClient
  theme: ThemeMode
  onOpen: () => void
  onPrefetch: () => void
  onToggleTheme: () => void
  onReset: () => void
}): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <ProductionCenterObserver
        fetchCount={fetchCount}
        theme={theme}
        onOpen={onOpen}
        onPrefetch={onPrefetch}
        onToggleTheme={onToggleTheme}
        onReset={onReset}
      />
    </QueryClientProvider>
  )
}

/** 为课程页面注册生产级服务端数据中心 Demo。 */
export function createProductionServerDataCenterDemo(): ComponentType {
  /** 对照一份 QueryClient、预取列表和客户端主题。 */
  function ProductionServerDataCenterDemoRoot(): ReactElement {
    const [queryClient, setQueryClient] = useState<QueryClient | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>('idle')
    const [theme, setTheme] = useState<ThemeMode>('浅色')
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

    /** 在观察者出现之前预取任务列表。 */
    async function prefetchList(): Promise<void> {
      if (queryClient || viewMode !== 'idle') {
        return
      }
      const client = createCenterQueryClient()
      setQueryClient(client)
      setPrefetching(true)
      await client.query(taskListOptions)
      if (!aliveRef.current) {
        return
      }
      setPrefetching(false)
      setViewMode('prefetched')
    }

    /** 挂上数据中心观察者。 */
    function openCenter(): void {
      if (viewMode === 'center') {
        return
      }
      if (!queryClient) {
        setQueryClient(createCenterQueryClient())
      }
      setViewMode('center')
    }

    /** 只改客户端主题，不碰查询缓存。 */
    function toggleTheme(): void {
      setTheme((current) => (current === '浅色' ? '深色' : '浅色'))
    }

    /** 丢掉数据层和计数，回到未观察查询的状态。 */
    function resetDemo(): void {
      restoreTaskStore()
      setFetchCount(0)
      setPrefetching(false)
      setTheme('浅色')
      setQueryClient(null)
      setViewMode('idle')
    }

    if (viewMode === 'center' && queryClient) {
      return (
        <ProductionCenterSession
          fetchCount={fetchCount}
          queryClient={queryClient}
          theme={theme}
          onOpen={openCenter}
          onPrefetch={() => {
            void prefetchList()
          }}
          onToggleTheme={toggleTheme}
          onReset={resetDemo}
        />
      )
    }

    const cachedList = queryClient?.getQueryData(taskListOptions.queryKey)
    const busy = prefetching

    return (
      <ProductionServerDataCenterChrome
        busy={busy}
        canCreate={false}
        canOpen={viewMode === 'prefetched' && !busy}
        canPrefetch={viewMode === 'idle' && !busy}
        fetchCount={fetchCount}
        firstTask={formatTask(cachedList?.[0])}
        theme={theme}
        viewMode={viewMode}
        onPrefetch={() => {
          void prefetchList()
        }}
        onOpen={openCenter}
        onCreate={() => undefined}
        onToggleTheme={toggleTheme}
        onReset={resetDemo}
      />
    )
  }

  return ProductionServerDataCenterDemoRoot
}
