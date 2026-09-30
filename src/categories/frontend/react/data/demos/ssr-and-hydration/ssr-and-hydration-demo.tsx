import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
  type DehydratedState,
} from '@tanstack/react-query'
import { useEffect, useState, type ComponentType, type ReactElement } from 'react'

import './ssr-and-hydration-demo.css'

type TaskItem = {
  id: string
  title: string
  owner: string
}

type TaskStore = {
  fetchCount: number
  onFetchCountChange?: (count: number) => void
}

type ViewMode = 'idle' | 'hydrate' | 'client'

const taskStore: TaskStore = {
  fetchCount: 0,
}

const taskDetail: TaskItem = { id: 't-1', title: '现有任务', owner: '林晓' }

/** 等待固定时长，让服务端预取和客户端请求都能被看清。 */
function waitForQuery(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

/** 读取任务详情，并统计真实请求。 */
async function loadTaskDetail(): Promise<TaskItem> {
  queueMicrotask(() => {
    taskStore.fetchCount += 1
    taskStore.onFetchCountChange?.(taskStore.fetchCount)
  })
  await waitForQuery(1400)
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(taskDetail))}`
  const response = await fetch(successUrl)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

const taskDetailOptions = queryOptions({
  queryKey: ['tasks', 'detail', 't-1'] as const,
  queryFn: loadTaskDetail,
  staleTime: Infinity,
  retry: false,
})

/** 在独立的服务端客户端里预取，再脱水成可序列化快照。 */
async function prefetchAndDehydrateTask(): Promise<DehydratedState> {
  const serverClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        retry: false,
      },
    },
  })
  await serverClient.query(taskDetailOptions)
  const dehydratedState = dehydrate(serverClient)
  serverClient.clear()
  return JSON.parse(JSON.stringify(dehydratedState)) as DehydratedState
}

/** 只在选定路径后观察详情，避免空闲时抢跑请求。 */
function TaskDetailPane(): ReactElement {
  const taskQuery = useQuery(taskDetailOptions)
  const taskText = taskQuery.data ? `${taskQuery.data.title} / ${taskQuery.data.owner}` : '无'

  return <strong data-testid="ssr-hydration-task">{taskText}</strong>
}

/** 对照注水标记、缓存标题和真实请求次数。 */
function SsrAndHydrationChrome({
  fetchCount,
  hydrateEnabled,
  isPrefetching,
  taskSlot,
  viewMode,
  onHydrate,
  onClientOnly,
  onReset,
}: {
  fetchCount: number
  hydrateEnabled: boolean
  isPrefetching: boolean
  taskSlot: ReactElement
  viewMode: ViewMode
  onHydrate: () => void
  onClientOnly: () => void
  onReset: () => void
}): ReactElement {
  return (
    <section className="ssr-hydration-demo" data-testid="ssr-hydration-demo">
      <header className="ssr-hydration-header">
        <span>TanStack Query</span>
        <h2>SSR 与 Hydration</h2>
        <p>
          服务端用独立 QueryClient 预取后再 dehydrate。客户端经 HydrationBoundary
          注水后，可以直接读出现有任务 / 林晓。
        </p>
      </header>

      <div className="ssr-hydration-metrics" aria-live="polite">
        <div>
          <span>已注水</span>
          <strong data-testid="ssr-hydration-hydrated">{hydrateEnabled ? '是' : '否'}</strong>
        </div>
        <div>
          <span>请求次数</span>
          <strong data-testid="ssr-hydration-fetch-count">{fetchCount}</strong>
        </div>
        <div>
          <span>任务详情</span>
          {taskSlot}
        </div>
      </div>

      <div className="ssr-hydration-actions">
        <button type="button" data-kind="primary" onClick={onHydrate} disabled={isPrefetching}>
          模拟服务端预取并注水
        </button>
        <button type="button" onClick={onClientOnly} disabled={isPrefetching}>
          不经注水直接读取
        </button>
        <button type="button" onClick={onReset} disabled={isPrefetching}>
          重置
        </button>
      </div>

      <div className="ssr-hydration-columns">
        <section className="ssr-hydration-card">
          <h3>当前观察</h3>
          {isPrefetching && (
            <p className="ssr-hydration-message" role="status">
              正在服务端预取任务，完成后才会把脱水结果交给 HydrationBoundary。
            </p>
          )}
          {!isPrefetching && viewMode === 'idle' && (
            <p className="ssr-hydration-message" role="status">
              还没有观察查询。点模拟服务端预取并注水，或点不经注水直接读取。
            </p>
          )}
          {!isPrefetching && viewMode === 'hydrate' && (
            <p className="ssr-hydration-message" role="status">
              注水完成。客户端读的是脱水缓存，不会再发一次请求。
            </p>
          )}
          {!isPrefetching && viewMode === 'client' && (
            <p className="ssr-hydration-message" role="status">
              这次没有 HydrationBoundary，结果来自客户端请求。
            </p>
          )}
        </section>
      </div>
    </section>
  )
}

/** 用 QueryClientProvider 包住可选的 HydrationBoundary。 */
function SsrAndHydrationSession({
  dehydratedState,
  fetchCount,
  hydrateEnabled,
  isPrefetching,
  viewMode,
  onHydrate,
  onClientOnly,
  onReset,
}: {
  dehydratedState: DehydratedState | null
  fetchCount: number
  hydrateEnabled: boolean
  isPrefetching: boolean
  viewMode: ViewMode
  onHydrate: () => void
  onClientOnly: () => void
  onReset: () => void
}): ReactElement {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Infinity,
            retry: false,
          },
        },
      }),
  )

  const chrome = (
    <SsrAndHydrationChrome
      fetchCount={fetchCount}
      hydrateEnabled={hydrateEnabled}
      isPrefetching={isPrefetching}
      taskSlot={
        viewMode === 'idle' ? (
          <strong data-testid="ssr-hydration-task">无</strong>
        ) : (
          <TaskDetailPane />
        )
      }
      viewMode={viewMode}
      onHydrate={onHydrate}
      onClientOnly={onClientOnly}
      onReset={onReset}
    />
  )

  if (viewMode === 'idle') {
    return chrome
  }

  return (
    <QueryClientProvider client={queryClient}>
      {hydrateEnabled && dehydratedState ? (
        <HydrationBoundary state={dehydratedState}>{chrome}</HydrationBoundary>
      ) : (
        chrome
      )}
    </QueryClientProvider>
  )
}

/** 为课程页面注册 SSR 与 Hydration Demo。 */
export function createSsrAndHydrationDemo(): ComponentType {
  /** 用独立服务端客户端预取，再决定客户端要不要注水。 */
  function SsrAndHydrationDemoRoot(): ReactElement {
    const [dehydratedState, setDehydratedState] = useState<DehydratedState | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>('idle')
    const [isPrefetching, setIsPrefetching] = useState(false)
    const [clientSession, setClientSession] = useState(0)
    const [fetchCount, setFetchCount] = useState(0)

    useEffect(() => {
      taskStore.onFetchCountChange = setFetchCount
      return () => {
        taskStore.onFetchCountChange = undefined
      }
    }, [])

    /** 没有脱水结果时先预取；已有结果则只重挂带注水的客户端。 */
    async function hydrateFromServer(): Promise<void> {
      if (!dehydratedState) {
        setIsPrefetching(true)
        const nextState = await prefetchAndDehydrateTask()
        setDehydratedState(nextState)
        setIsPrefetching(false)
      }
      setViewMode('hydrate')
      setClientSession((current) => current + 1)
    }

    /** 丢掉注水，让客户端自己请求。 */
    function loadOnClient(): void {
      setViewMode('client')
      setClientSession((current) => current + 1)
    }

    /** 清空脱水结果和计数，回到未观察查询的状态。 */
    function resetDemo(): void {
      taskStore.fetchCount = 0
      setFetchCount(0)
      setDehydratedState(null)
      setViewMode('idle')
      setIsPrefetching(false)
      setClientSession((current) => current + 1)
    }

    return (
      <SsrAndHydrationSession
        key={clientSession}
        dehydratedState={dehydratedState}
        fetchCount={fetchCount}
        hydrateEnabled={viewMode === 'hydrate'}
        isPrefetching={isPrefetching}
        viewMode={viewMode}
        onHydrate={() => {
          void hydrateFromServer()
        }}
        onClientOnly={loadOnClient}
        onReset={resetDemo}
      />
    )
  }

  return SsrAndHydrationDemoRoot
}
