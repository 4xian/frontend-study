import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useState, type ComponentType, type ReactElement } from 'react'

import './query-client-cache-operations-demo.css'

type TaskItem = {
  id: string
  title: string
  owner: string
}

type TaskStore = {
  fetchCount: number
  onFetchCountChange?: (count: number) => void
}

type CacheView = {
  listTitle: string
  detailTitle: string
  entryCount: number
  hasDetail: boolean
}

const taskStore: TaskStore = {
  fetchCount: 0,
}

const taskList: TaskItem[] = [{ id: 't-1', title: '现有任务', owner: '林晓' }]

const writtenDetail: TaskItem = { id: 't-1', title: '核对详情', owner: '林晓' }

const taskDetailKey = ['tasks', 'detail', 't-1'] as const

/** 等待固定时长，让首次读取能被看清。 */
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

const taskListOptions = queryOptions({
  queryKey: ['tasks'] as const,
  queryFn: loadTaskList,
  staleTime: Infinity,
  retry: false,
})

/** 从 QueryClient 同步读出列表标题、详情标题和条目数。 */
function readCacheView(queryClient: QueryClient): CacheView {
  const list = queryClient.getQueryData(taskListOptions.queryKey)
  const detail = queryClient.getQueryData<TaskItem>(taskDetailKey)
  const entries = queryClient.getQueriesData({ queryKey: ['tasks'] })
  return {
    listTitle: list?.[0]?.title ?? '无',
    detailTitle: detail?.title ?? '无',
    entryCount: entries.length,
    hasDetail: detail !== undefined,
  }
}

/** 把标题改成核对批量，数组和单条对象都按不可变方式展开。 */
function renameCachedTitle(current: unknown): unknown {
  if (!current) {
    return current
  }
  if (Array.isArray(current)) {
    return current.map((task: TaskItem) => ({ ...task, title: '核对批量' }))
  }
  if (typeof current === 'object' && 'title' in current) {
    return { ...(current as TaskItem), title: '核对批量' }
  }
  return current
}

/** 对照同步写入、批量改已有条目和删除缓存。 */
function QueryClientCacheOperationsPanel({
  fetchCount,
  onReset,
}: {
  fetchCount: number
  onReset: () => void
}): ReactElement {
  const queryClient = useQueryClient()
  const listQuery = useQuery(taskListOptions)
  const [cacheView, setCacheView] = useState<CacheView>(() => readCacheView(queryClient))

  useEffect(() => {
    /** 命令式读写不会自动驱动渲染，这里订阅 QueryCache 才能看到变化。 */
    function syncCache(): void {
      setCacheView(readCacheView(queryClient))
    }

    syncCache()
    return queryClient.getQueryCache().subscribe(syncCache)
  }, [queryClient])

  const pending = listQuery.isPending

  /** 同步写入详情 key；查询还不存在时会创建，不发请求。 */
  function writeDetail(): void {
    queryClient.setQueryData(taskDetailKey, writtenDetail)
  }

  /** 按前缀改已经存在的条目，不会新建查询。 */
  function renameMatching(): void {
    queryClient.setQueriesData({ queryKey: ['tasks'] }, renameCachedTitle)
  }

  /** 精确删除详情条目，列表继续留在缓存里。 */
  function removeDetail(): void {
    queryClient.removeQueries({ queryKey: taskDetailKey, exact: true })
  }

  return (
    <section className="query-client-cache-demo" data-testid="query-client-cache-demo">
      <header className="query-client-cache-header">
        <span>TanStack Query</span>
        <h2>Query Client 与缓存操作</h2>
        <p>
          写入详情会同步创建缓存，不发请求。批量改标题只动已经存在的条目。删除详情只拿掉这一条，列表还在。
        </p>
      </header>

      <div className="query-client-cache-metrics" aria-live="polite">
        <div>
          <span>请求次数</span>
          <strong data-testid="query-client-cache-fetch-count">{fetchCount}</strong>
        </div>
        <div>
          <span>缓存条目</span>
          <strong data-testid="query-client-cache-entries">{cacheView.entryCount}</strong>
        </div>
        <div>
          <span>详情已写入</span>
          <strong data-testid="query-client-cache-has-detail">
            {cacheView.hasDetail ? '是' : '否'}
          </strong>
        </div>
        <div>
          <span>等待中</span>
          <strong data-testid="query-client-cache-pending">{pending ? '是' : '否'}</strong>
        </div>
      </div>

      <div className="query-client-cache-actions">
        <button type="button" data-kind="primary" disabled={pending} onClick={writeDetail}>
          写入详情
        </button>
        <button type="button" disabled={pending} onClick={renameMatching}>
          批量改标题
        </button>
        <button type="button" disabled={pending} onClick={removeDetail}>
          删除详情
        </button>
        <button type="button" disabled={pending} onClick={onReset}>
          重置
        </button>
      </div>

      <div className="query-client-cache-columns">
        <section className="query-client-cache-card">
          <h3>列表观察者</h3>
          {pending && (
            <p className="query-client-cache-message" role="status">
              正在读取任务。
            </p>
          )}
          {listQuery.isSuccess && (
            <p data-testid="query-client-cache-list">
              {listQuery.data[0]?.title} / {listQuery.data[0]?.owner}
            </p>
          )}
        </section>
        <section className="query-client-cache-card">
          <h3>命令式缓存</h3>
          <p data-testid="query-client-cache-list-title">{cacheView.listTitle}</p>
          <p data-testid="query-client-cache-detail">{cacheView.detailTitle}</p>
        </section>
      </div>
    </section>
  )
}

/** 为一次观察创建独立 QueryClient，并重置请求计数。 */
function QueryClientCacheOperationsSession({ onReset }: { onReset: () => void }): ReactElement {
  const [queryClient] = useState(() => new QueryClient())
  const [fetchCount, setFetchCount] = useState(0)

  useEffect(() => {
    taskStore.fetchCount = 0
    setFetchCount(0)
    taskStore.onFetchCountChange = setFetchCount
    return () => {
      taskStore.onFetchCountChange = undefined
      queryClient.clear()
    }
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <QueryClientCacheOperationsPanel fetchCount={fetchCount} onReset={onReset} />
    </QueryClientProvider>
  )
}

/** 为课程页面注册 Query Client 与缓存操作 Demo。 */
export function createQueryClientCacheOperationsDemo(): ComponentType {
  /** 重置时整段重挂，避免旧缓存条目留在客户端里。 */
  function QueryClientCacheOperationsDemoRoot(): ReactElement {
    const [session, setSession] = useState(0)

    /** 丢弃当前缓存和请求计数。 */
    function resetDemo(): void {
      setSession((current) => current + 1)
    }

    return <QueryClientCacheOperationsSession key={session} onReset={resetDemo} />
  }

  return QueryClientCacheOperationsDemoRoot
}
