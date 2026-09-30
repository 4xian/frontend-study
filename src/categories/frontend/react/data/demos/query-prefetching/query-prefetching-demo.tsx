import {
  QueryClient,
  QueryClientProvider,
  noop,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useState, type ComponentType, type ReactElement } from 'react'

import './query-prefetching-demo.css'

type TaskItem = {
  id: string
  title: string
  owner: string
}

type TaskStore = {
  fetchCount: number
  onFetchCountChange?: (count: number) => void
}

const taskStore: TaskStore = {
  fetchCount: 0,
}

const taskList: TaskItem[] = [{ id: 't-1', title: '现有任务', owner: '林晓' }]

const taskDetail: TaskItem = { id: 't-1', title: '现有任务', owner: '林晓' }

/** 等待固定时长，让预取先于查看详情能被看清。 */
function waitForQuery(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

/** 读取任务列表，并统计真实请求。 */
async function loadTaskList(): Promise<TaskItem[]> {
  queueMicrotask(() => {
    taskStore.fetchCount += 1
    taskStore.onFetchCountChange?.(taskStore.fetchCount)
  })
  await waitForQuery(1400)
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(taskList))}`
  const response = await fetch(successUrl)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem[]
}

/** 读取任务详情，并统计真实请求。 */
async function loadTaskDetail(taskId: string): Promise<TaskItem> {
  queueMicrotask(() => {
    taskStore.fetchCount += 1
    taskStore.onFetchCountChange?.(taskStore.fetchCount)
  })
  await waitForQuery(1400)
  const payload = taskId === taskDetail.id ? taskDetail : { id: taskId, title: '无', owner: '无' }
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload))}`
  const response = await fetch(successUrl)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

/** 只在查看详情时订阅详情查询，避免空观察者把禁用查询显示成等待。 */
function TaskDetailPane({
  onPendingChange,
}: {
  onPendingChange: (pending: boolean) => void
}): ReactElement {
  const detailQuery = useQuery({
    queryKey: ['tasks', 'detail', 't-1'],
    queryFn: () => loadTaskDetail('t-1'),
    staleTime: Infinity,
    retry: false,
  })

  useEffect(() => {
    onPendingChange(detailQuery.isPending)
  }, [detailQuery.isPending, onPendingChange])

  if (detailQuery.isPending) {
    return (
      <p className="query-prefetch-message" role="status">
        正在读取详情。
      </p>
    )
  }

  if (!detailQuery.isSuccess) {
    return null
  }

  return (
    <p data-testid="query-prefetch-detail">
      {detailQuery.data.title} / {detailQuery.data.owner}
    </p>
  )
}

/** 观察事件预取：先把详情放进缓存，再查看时不再发请求。 */
function QueryPrefetchingPanel(): ReactElement {
  const queryClient = useQueryClient()
  const [fetchCount, setFetchCount] = useState(taskStore.fetchCount)
  const [showDetail, setShowDetail] = useState(false)
  const [detailPending, setDetailPending] = useState(false)
  const [prefetching, setPrefetching] = useState(false)
  const [cachedTitle, setCachedTitle] = useState('无')
  const [hasCache, setHasCache] = useState(false)
  const listQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: loadTaskList,
    staleTime: Infinity,
    retry: false,
  })
  const tasks = listQuery.data ?? []
  const firstTask = tasks[0]
  const busy = listQuery.isFetching || detailPending || prefetching

  useEffect(() => {
    taskStore.onFetchCountChange = setFetchCount
    return () => {
      taskStore.onFetchCountChange = undefined
    }
  }, [])

  /** 在点击时预取详情，错误交给之后的 useQuery。 */
  function prefetchDetail(): void {
    if (prefetching) {
      return
    }
    setPrefetching(true)
    void queryClient
      .query({
        queryKey: ['tasks', 'detail', 't-1'],
        queryFn: () => loadTaskDetail('t-1'),
        staleTime: 60_000,
      })
      .then((data) => {
        setHasCache(true)
        setCachedTitle(data.title)
      })
      .catch(noop)
      .finally(() => {
        setPrefetching(false)
      })
  }

  /** 挂载详情观察者，读取已经预取或即将请求的缓存。 */
  function viewDetail(): void {
    setShowDetail(true)
  }

  /** 恢复列表并清空详情缓存。 */
  function resetDemo(): void {
    taskStore.fetchCount = 0
    setFetchCount(0)
    setShowDetail(false)
    setDetailPending(false)
    setPrefetching(false)
    setHasCache(false)
    setCachedTitle('无')
    void queryClient.resetQueries({ queryKey: ['tasks'] })
  }

  return (
    <section className="query-prefetch-demo" data-testid="query-prefetch-demo">
      <header className="query-prefetch-header">
        <span>TanStack Query</span>
        <h2>查询预取</h2>
        <p>先预取详情。再查看详情时直接读缓存，请求次数不再增加。</p>
      </header>

      <div className="query-prefetch-metrics" aria-live="polite">
        <div>
          <span>请求次数</span>
          <strong data-testid="query-prefetch-fetch-count">{fetchCount}</strong>
        </div>
        <div>
          <span>详情已缓存</span>
          <strong data-testid="query-prefetch-has-cache">{hasCache ? '是' : '否'}</strong>
        </div>
        <div>
          <span>缓存标题</span>
          <strong data-testid="query-prefetch-cached-title">{cachedTitle}</strong>
        </div>
        <div>
          <span>详情等待中</span>
          <strong data-testid="query-prefetch-pending">{detailPending ? '是' : '否'}</strong>
        </div>
        <div>
          <span>列表标题</span>
          <strong data-testid="query-prefetch-list-title">
            {firstTask ? firstTask.title : '无'}
          </strong>
        </div>
        <div>
          <span>负责人</span>
          <strong data-testid="query-prefetch-owner">{firstTask ? firstTask.owner : '无'}</strong>
        </div>
      </div>

      <div className="query-prefetch-actions">
        <button type="button" data-kind="primary" disabled={busy} onClick={prefetchDetail}>
          预取详情
        </button>
        <button type="button" disabled={busy} onClick={viewDetail}>
          查看详情
        </button>
        <button type="button" disabled={busy} onClick={resetDemo}>
          重置
        </button>
      </div>

      <div className="query-prefetch-columns">
        <section className="query-prefetch-card">
          <h3>任务列表</h3>
          {listQuery.isPending ? (
            <p className="query-prefetch-message" role="status">
              正在读取任务。
            </p>
          ) : null}
          {listQuery.isSuccess ? (
            <ul data-testid="query-prefetch-list">
              {tasks.map((task) => (
                <li key={task.id}>
                  {task.title} / {task.owner}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
        <section className="query-prefetch-card">
          <h3>任务详情</h3>
          {showDetail ? (
            <TaskDetailPane onPendingChange={setDetailPending} />
          ) : (
            <p className="query-prefetch-message">尚未查看详情。</p>
          )}
        </section>
      </div>
    </section>
  )
}

/** 为 Demo 提供独立 QueryClient，并在离开页面时清空本地缓存。 */
function QueryPrefetchingDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => {
      taskStore.fetchCount = 0
      taskStore.onFetchCountChange = undefined
      queryClient.clear()
    }
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <QueryPrefetchingPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册查询预取 Demo。 */
export function createQueryPrefetchingDemo(): ComponentType {
  return QueryPrefetchingDemoRoot
}
