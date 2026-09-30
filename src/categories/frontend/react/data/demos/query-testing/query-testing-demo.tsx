import { QueryClient, QueryClientProvider, queryOptions, useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState, type ComponentType, type ReactElement } from 'react'

import './query-testing-demo.css'

type TaskItem = {
  id: string
  title: string
  owner: string
}

type TaskStore = {
  failNext: boolean
  fetchCount: number
  onFetchCountChange?: (count: number) => void
}

type ViewMode = 'idle' | 'fresh' | 'reuse' | 'error'

const taskStore: TaskStore = {
  failNext: false,
  fetchCount: 0,
}

const taskDetail: TaskItem = { id: 't-1', title: '现有任务', owner: '林晓' }

/** 等待固定时长，让成功测试和失败测试的请求都能被看清。 */
function waitForQuery(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

/** 按当前测试意图读取任务详情，并统计真实请求。 */
async function loadTaskDetail(): Promise<TaskItem> {
  queueMicrotask(() => {
    taskStore.fetchCount += 1
    taskStore.onFetchCountChange?.(taskStore.fetchCount)
  })
  await waitForQuery(1400)
  if (taskStore.failNext) {
    const response = new Response(JSON.stringify({ message: '任务服务暂不可用' }), {
      status: 503,
      statusText: 'Service Unavailable',
    })
    if (!response.ok) {
      throw new Error(`读取失败：HTTP ${response.status}`)
    }
  }
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
})

/** 为单次测试创建独立客户端，并关闭默认重试。 */
function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  })
}

/** 观察当前测试是否已经成功。 */
function SuccessMetric(): ReactElement {
  const taskQuery = useQuery(taskDetailOptions)
  return <strong data-testid="query-testing-success">{taskQuery.isSuccess ? '是' : '否'}</strong>
}

/** 观察当前测试读到的任务详情。 */
function TaskMetric(): ReactElement {
  const taskQuery = useQuery(taskDetailOptions)
  const taskText = taskQuery.data ? `${taskQuery.data.title} / ${taskQuery.data.owner}` : '无'
  return <strong data-testid="query-testing-task">{taskText}</strong>
}

/** 对照隔离客户端、成功标记、任务标题和真实请求次数。 */
function QueryTestingChrome({
  fetchCount,
  isolated,
  successSlot,
  taskSlot,
  viewMode,
  onFresh,
  onReuse,
  onError,
  onReset,
}: {
  fetchCount: number
  isolated: boolean
  successSlot: ReactElement
  taskSlot: ReactElement
  viewMode: ViewMode
  onFresh: () => void
  onReuse: () => void
  onError: () => void
  onReset: () => void
}): ReactElement {
  return (
    <section className="query-testing-demo" data-testid="query-testing-demo">
      <header className="query-testing-header">
        <span>TanStack Query</span>
        <h2>TanStack Query 测试</h2>
        <p>
          每次测试用独立 QueryClient，失败用例关闭 retry。复用同一份客户端时，现有任务 /
          林晓会从缓存漏到下一测。
        </p>
      </header>

      <div className="query-testing-metrics" aria-live="polite">
        <div>
          <span>隔离客户端</span>
          <strong data-testid="query-testing-isolated">{isolated ? '是' : '否'}</strong>
        </div>
        <div>
          <span>isSuccess</span>
          {successSlot}
        </div>
        <div>
          <span>请求次数</span>
          <strong data-testid="query-testing-fetch-count">{fetchCount}</strong>
        </div>
        <div>
          <span>任务详情</span>
          {taskSlot}
        </div>
      </div>

      <div className="query-testing-actions">
        <button type="button" data-kind="primary" onClick={onFresh}>
          运行隔离成功测试
        </button>
        <button type="button" onClick={onReuse}>
          复用同一客户端再测
        </button>
        <button type="button" onClick={onError}>
          关闭重试后测失败
        </button>
        <button type="button" onClick={onReset}>
          重置
        </button>
      </div>

      <div className="query-testing-columns">
        <section className="query-testing-card">
          <h3>当前观察</h3>
          {viewMode === 'idle' && (
            <p className="query-testing-message" role="status">
              还没有跑测试。点运行隔离成功测试，或点关闭重试后测失败。
            </p>
          )}
          {viewMode === 'fresh' && (
            <p className="query-testing-message" role="status">
              这份 QueryClient 只服务当前测试。成功后应读出现有任务 / 林晓，请求次数加一。
            </p>
          )}
          {viewMode === 'reuse' && (
            <p className="query-testing-message" role="status">
              复用了上一份客户端。若缓存里已有现有任务 / 林晓，请求次数不会再增加。
            </p>
          )}
          {viewMode === 'error' && (
            <p className="query-testing-message" role="status">
              默认会再试 3 次。这次客户端把 retry 设为 false，失败后只会请求一次。
            </p>
          )}
        </section>
      </div>
    </section>
  )
}

/** 用 QueryClientProvider 包住单次测试观察。 */
function QueryTestingSession({
  fetchCount,
  isolated,
  queryClient,
  viewMode,
  onFresh,
  onReuse,
  onError,
  onReset,
}: {
  fetchCount: number
  isolated: boolean
  queryClient: QueryClient
  viewMode: ViewMode
  onFresh: () => void
  onReuse: () => void
  onError: () => void
  onReset: () => void
}): ReactElement {
  const chrome = (
    <QueryTestingChrome
      fetchCount={fetchCount}
      isolated={isolated}
      successSlot={<SuccessMetric />}
      taskSlot={<TaskMetric />}
      viewMode={viewMode}
      onFresh={onFresh}
      onReuse={onReuse}
      onError={onError}
      onReset={onReset}
    />
  )

  return <QueryClientProvider client={queryClient}>{chrome}</QueryClientProvider>
}

/** 为课程页面注册 TanStack Query 测试 Demo。 */
export function createQueryTestingDemo(): ComponentType {
  /** 用独立或复用的 QueryClient 模拟测试隔离。 */
  function QueryTestingDemoRoot(): ReactElement {
    const sharedClientRef = useRef<QueryClient | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>('idle')
    const [sessionKey, setSessionKey] = useState(0)
    const [fetchCount, setFetchCount] = useState(0)

    useEffect(() => {
      taskStore.onFetchCountChange = setFetchCount
      return () => {
        taskStore.onFetchCountChange = undefined
      }
    }, [])

    /** 新建一份客户端，跑成功查询。 */
    function runFreshTest(): void {
      taskStore.failNext = false
      sharedClientRef.current = createTestQueryClient()
      setViewMode('fresh')
      setSessionKey((current) => current + 1)
    }

    /** 复用上一份客户端，观察缓存是否串到下一测。 */
    function runReuseTest(): void {
      taskStore.failNext = false
      if (!sharedClientRef.current) {
        sharedClientRef.current = createTestQueryClient()
      }
      setViewMode('reuse')
      setSessionKey((current) => current + 1)
    }

    /** 新建客户端并关闭重试，观察失败只请求一次。 */
    function runErrorTest(): void {
      taskStore.failNext = true
      sharedClientRef.current = createTestQueryClient()
      setViewMode('error')
      setSessionKey((current) => current + 1)
    }

    /** 丢掉测试客户端和计数，回到未观察查询的状态。 */
    function resetDemo(): void {
      taskStore.failNext = false
      taskStore.fetchCount = 0
      sharedClientRef.current = null
      setFetchCount(0)
      setViewMode('idle')
      setSessionKey((current) => current + 1)
    }

    if (viewMode === 'idle' || !sharedClientRef.current) {
      return (
        <QueryTestingChrome
          fetchCount={fetchCount}
          isolated={false}
          successSlot={<strong data-testid="query-testing-success">否</strong>}
          taskSlot={<strong data-testid="query-testing-task">无</strong>}
          viewMode="idle"
          onFresh={runFreshTest}
          onReuse={runReuseTest}
          onError={runErrorTest}
          onReset={resetDemo}
        />
      )
    }

    return (
      <QueryTestingSession
        key={sessionKey}
        fetchCount={fetchCount}
        isolated={viewMode === 'fresh' || viewMode === 'error'}
        queryClient={sharedClientRef.current}
        viewMode={viewMode}
        onFresh={runFreshTest}
        onReuse={runReuseTest}
        onError={runErrorTest}
        onReset={resetDemo}
      />
    )
  }

  return QueryTestingDemoRoot
}
