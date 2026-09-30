import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useState, type ComponentType, type ReactElement } from 'react'

import './production-data-layer-demo.css'

type TaskItem = {
  id: string
  title: string
  owner: string
}

type TaskStore = {
  fetchCount: number
  useUpdatedTask: boolean
  onFetchCountChange?: (count: number) => void
}

type ThemeMode = '浅色' | '深色'

type ViewMode = 'idle' | 'layer'

const taskStore: TaskStore = {
  fetchCount: 0,
  useUpdatedTask: false,
}

const currentTask: TaskItem = { id: 't-1', title: '现有任务', owner: '林晓' }
const updatedTask: TaskItem = { id: 't-1', title: '修订任务', owner: '林晓' }

/** 等待固定时长，让查询缓存和客户端副本的差异都能被看清。 */
function waitForQuery(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

/** 按当前服务端版本读取任务详情，并统计真实请求。 */
async function loadTaskDetail(): Promise<TaskItem> {
  queueMicrotask(() => {
    taskStore.fetchCount += 1
    taskStore.onFetchCountChange?.(taskStore.fetchCount)
  })
  await waitForQuery(1400)
  const task = taskStore.useUpdatedTask ? updatedTask : currentTask
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(task))}`
  const response = await fetch(successUrl)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

const taskDetailOptions = queryOptions({
  queryKey: ['tasks', 'detail', 't-1'] as const,
  queryFn: loadTaskDetail,
})

/** 创建应用边界上的生产 QueryClient。 */
function createProductionQueryClient(): QueryClient {
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

/** 观察查询缓存里的任务详情。 */
function QueryCacheMetric(): ReactElement {
  const taskQuery = useQuery(taskDetailOptions)
  return <strong data-testid="production-data-layer-cache">{formatTask(taskQuery.data)}</strong>
}

/** 在失效后从同一份 queryOptions 再读服务端。 */
function InvalidateButton({ disabled }: { disabled: boolean }): ReactElement {
  const queryClient = useQueryClient()

  /** 把详情标为过期并重新获取，模拟服务端已更新。 */
  function invalidateTask(): void {
    taskStore.useUpdatedTask = true
    void queryClient.invalidateQueries({ queryKey: taskDetailOptions.queryKey })
  }

  return (
    <button type="button" onClick={invalidateTask} disabled={disabled}>
      服务端更新后再读
    </button>
  )
}

/** 对照查询缓存、客户端副本、主题和真实请求次数。 */
function ProductionDataLayerChrome({
  clientCopy,
  fetchCount,
  showInvalidate,
  theme,
  viewMode,
  onMountLayer,
  onCopyToClient,
  onToggleTheme,
  onReset,
}: {
  clientCopy: TaskItem | null
  fetchCount: number
  showInvalidate: boolean
  theme: ThemeMode
  viewMode: ViewMode
  onMountLayer: () => void
  onCopyToClient: () => void
  onToggleTheme: () => void
  onReset: () => void
}): ReactElement {
  return (
    <section className="production-data-layer-demo" data-testid="production-data-layer-demo">
      <header className="production-data-layer-header">
        <span>TanStack Query</span>
        <h2>生产级数据层架构</h2>
        <p>
          应用边界只放一份 QueryClient。任务详情走
          queryOptions，主题留在客户端状态。复制进客户端状态后，服务端更新不会改那份副本。
        </p>
      </header>

      <div className="production-data-layer-metrics" aria-live="polite">
        <div>
          <span>查询缓存</span>
          {viewMode === 'idle' ? (
            <strong data-testid="production-data-layer-cache">无</strong>
          ) : (
            <QueryCacheMetric />
          )}
        </div>
        <div>
          <span>客户端副本</span>
          <strong data-testid="production-data-layer-copy">
            {formatTask(clientCopy ?? undefined)}
          </strong>
        </div>
        <div>
          <span>主题</span>
          <strong data-testid="production-data-layer-theme">{theme}</strong>
        </div>
        <div>
          <span>请求次数</span>
          <strong data-testid="production-data-layer-fetch-count">{fetchCount}</strong>
        </div>
      </div>

      <div className="production-data-layer-actions">
        <button type="button" data-kind="primary" onClick={onMountLayer}>
          挂上生产数据层
        </button>
        <button type="button" onClick={onCopyToClient} disabled={viewMode === 'idle'}>
          复制进客户端状态
        </button>
        {showInvalidate ? (
          <InvalidateButton disabled={false} />
        ) : (
          <button type="button" disabled>
            服务端更新后再读
          </button>
        )}
        <button type="button" onClick={onToggleTheme}>
          切换客户端主题
        </button>
        <button type="button" onClick={onReset}>
          重置
        </button>
      </div>

      <div className="production-data-layer-columns">
        <section className="production-data-layer-card">
          <h3>当前观察</h3>
          {viewMode === 'idle' && (
            <p className="production-data-layer-message" role="status">
              还没有挂数据层。点挂上生产数据层后，查询缓存会读出现有任务 / 林晓。
            </p>
          )}
          {viewMode === 'layer' && (
            <p className="production-data-layer-message" role="status">
              任务走 Query 缓存，主题走客户端状态。复制进客户端状态后，再读服务端只会更新查询缓存。
            </p>
          )}
        </section>
      </div>
    </section>
  )
}

/** 用 QueryClientProvider 包住生产数据层观察。 */
function ProductionDataLayerSession({
  clientCopy,
  fetchCount,
  queryClient,
  theme,
  onMountLayer,
  onCopyToClient,
  onToggleTheme,
  onReset,
}: {
  clientCopy: TaskItem | null
  fetchCount: number
  queryClient: QueryClient
  theme: ThemeMode
  onMountLayer: () => void
  onCopyToClient: () => void
  onToggleTheme: () => void
  onReset: () => void
}): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <ProductionDataLayerChrome
        clientCopy={clientCopy}
        fetchCount={fetchCount}
        showInvalidate
        theme={theme}
        viewMode="layer"
        onMountLayer={onMountLayer}
        onCopyToClient={onCopyToClient}
        onToggleTheme={onToggleTheme}
        onReset={onReset}
      />
    </QueryClientProvider>
  )
}

/** 为课程页面注册生产级数据层架构 Demo。 */
export function createProductionDataLayerDemo(): ComponentType {
  /** 对照一份 QueryClient、查询缓存和客户端状态。 */
  function ProductionDataLayerDemoRoot(): ReactElement {
    const [queryClient, setQueryClient] = useState<QueryClient | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>('idle')
    const [theme, setTheme] = useState<ThemeMode>('浅色')
    const [clientCopy, setClientCopy] = useState<TaskItem | null>(null)
    const [fetchCount, setFetchCount] = useState(0)

    useEffect(() => {
      taskStore.onFetchCountChange = setFetchCount
      return () => {
        taskStore.onFetchCountChange = undefined
      }
    }, [])

    /** 在应用边界挂上一份生产 QueryClient。 */
    function mountLayer(): void {
      if (queryClient) {
        return
      }
      setQueryClient(createProductionQueryClient())
      setViewMode('layer')
    }

    /** 错误地把查询结果复制进客户端状态。 */
    function copyToClient(): void {
      if (!queryClient) {
        return
      }
      const cached = queryClient.getQueryData(taskDetailOptions.queryKey)
      if (cached) {
        setClientCopy(cached)
      }
    }

    /** 只改客户端主题，不碰查询缓存。 */
    function toggleTheme(): void {
      setTheme((current) => (current === '浅色' ? '深色' : '浅色'))
    }

    /** 丢掉数据层和计数，回到未观察查询的状态。 */
    function resetDemo(): void {
      taskStore.fetchCount = 0
      taskStore.useUpdatedTask = false
      setFetchCount(0)
      setClientCopy(null)
      setTheme('浅色')
      setQueryClient(null)
      setViewMode('idle')
    }

    if (viewMode === 'idle' || !queryClient) {
      return (
        <ProductionDataLayerChrome
          clientCopy={clientCopy}
          fetchCount={fetchCount}
          showInvalidate={false}
          theme={theme}
          viewMode="idle"
          onMountLayer={mountLayer}
          onCopyToClient={copyToClient}
          onToggleTheme={toggleTheme}
          onReset={resetDemo}
        />
      )
    }

    return (
      <ProductionDataLayerSession
        clientCopy={clientCopy}
        fetchCount={fetchCount}
        queryClient={queryClient}
        theme={theme}
        onMountLayer={mountLayer}
        onCopyToClient={copyToClient}
        onToggleTheme={toggleTheme}
        onReset={resetDemo}
      />
    )
  }

  return ProductionDataLayerDemoRoot
}
