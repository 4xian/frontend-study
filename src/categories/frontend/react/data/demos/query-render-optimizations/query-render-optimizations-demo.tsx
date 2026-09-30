import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { memo, useEffect, useRef, useState, type ComponentType, type ReactElement } from 'react'

import './query-render-optimizations-demo.css'

type TaskItem = {
  id: string
  title: string
  owner: string
  note: string
}

const taskDetail: TaskItem = {
  id: 't-1',
  title: '现有任务',
  owner: '林晓',
  note: '核对备注',
}

/** 等待固定时长，让首次读取能被看清。 */
function waitForQuery(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

/** 读取任务详情，非 2xx 时抛出带状态码的 Error。 */
async function loadTaskDetail(): Promise<TaskItem> {
  await waitForQuery(1400)
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(taskDetail))}`
  const response = await fetch(successUrl)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem
}

const taskDetailOptions = queryOptions({
  queryKey: ['tasks', 'detail', 't-1'],
  queryFn: loadTaskDetail,
  staleTime: Infinity,
  retry: false,
})

/** 只取出标题，引用保持稳定，避免每次渲染新建 select。 */
function selectTaskTitle(task: TaskItem): string {
  return task.title
}

/** 订阅完整任务。备注变化时这个观察者会重绘。 */
const FullTaskPane = memo(function FullTaskPane(): ReactElement {
  const renderCount = useRef(0)
  renderCount.current += 1
  const taskQuery = useQuery(taskDetailOptions)

  if (taskQuery.isPending) {
    return (
      <p className="query-render-message" role="status">
        正在读取任务。
      </p>
    )
  }

  if (!taskQuery.isSuccess) {
    return null
  }

  return (
    <>
      <p data-testid="query-render-full-count">{renderCount.current}</p>
      <p data-testid="query-render-full-task">
        {taskQuery.data.title} / {taskQuery.data.owner}
      </p>
      <p data-testid="query-render-note">{taskQuery.data.note}</p>
    </>
  )
})

/** 只订阅标题。备注变化时这个观察者不会重绘。 */
const TitleTaskPane = memo(function TitleTaskPane(): ReactElement {
  const renderCount = useRef(0)
  renderCount.current += 1
  const titleQuery = useQuery({
    ...taskDetailOptions,
    select: selectTaskTitle,
  })

  if (titleQuery.isPending) {
    return (
      <p className="query-render-message" role="status">
        正在读取标题。
      </p>
    )
  }

  if (!titleQuery.isSuccess) {
    return null
  }

  return (
    <>
      <p data-testid="query-render-title-count">{renderCount.current}</p>
      <p data-testid="query-render-title">{titleQuery.data}</p>
    </>
  )
})

/** 对照完整观察者和标题切片观察者的重绘。 */
function QueryRenderOptimizationsPanel({ onReset }: { onReset: () => void }): ReactElement {
  const queryClient = useQueryClient()
  const [cachedTitle, setCachedTitle] = useState('无')
  const [cachedNote, setCachedNote] = useState('无')
  const [pending, setPending] = useState(true)

  useEffect(() => {
    /** 把缓存里的标题和备注同步到观察区。 */
    function syncCache(): void {
      const cached = queryClient.getQueryData(taskDetailOptions.queryKey)
      const state = queryClient.getQueryState(taskDetailOptions.queryKey)
      setCachedTitle(cached?.title ?? '无')
      setCachedNote(cached?.note ?? '无')
      setPending(state?.fetchStatus === 'fetching' || cached === undefined)
    }

    syncCache()
    return queryClient.getQueryCache().subscribe(syncCache)
  }, [queryClient])

  /** 只改备注，标题切片不应重绘。 */
  function updateNote(): void {
    queryClient.setQueryData(taskDetailOptions.queryKey, (current) =>
      current ? { ...current, note: '核对新备注' } : current,
    )
  }

  /** 改标题，两个观察者都会重绘。 */
  function updateTitle(): void {
    queryClient.setQueryData(taskDetailOptions.queryKey, (current) =>
      current ? { ...current, title: '核对标题' } : current,
    )
  }

  return (
    <section className="query-render-demo" data-testid="query-render-demo">
      <header className="query-render-header">
        <span>TanStack Query</span>
        <h2>查询渲染优化</h2>
        <p>标题观察者只用稳定的 select。改备注时它不重绘，改标题时才会重绘。</p>
      </header>

      <div className="query-render-metrics" aria-live="polite">
        <div>
          <span>缓存标题</span>
          <strong data-testid="query-render-cached-title">{cachedTitle}</strong>
        </div>
        <div>
          <span>缓存备注</span>
          <strong data-testid="query-render-cached-note">{cachedNote}</strong>
        </div>
      </div>

      <div className="query-render-actions">
        <button type="button" data-kind="primary" disabled={pending} onClick={updateNote}>
          更新备注
        </button>
        <button type="button" disabled={pending} onClick={updateTitle}>
          更新标题
        </button>
        <button type="button" disabled={pending} onClick={onReset}>
          重置
        </button>
      </div>

      <div className="query-render-columns">
        <section className="query-render-card">
          <h3>完整观察者</h3>
          <FullTaskPane />
        </section>
        <section className="query-render-card">
          <h3>标题观察者</h3>
          <TitleTaskPane />
        </section>
      </div>
    </section>
  )
}

/** 为一次观察创建独立 QueryClient。 */
function QueryRenderOptimizationsSession({ onReset }: { onReset: () => void }): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => {
      queryClient.clear()
    }
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <QueryRenderOptimizationsPanel onReset={onReset} />
    </QueryClientProvider>
  )
}

/** 为课程页面注册查询渲染优化 Demo。 */
export function createQueryRenderOptimizationsDemo(): ComponentType {
  /** 重置时整段重挂，避免旧观察者带着渲染次数。 */
  function QueryRenderOptimizationsDemoRoot(): ReactElement {
    const [session, setSession] = useState(0)

    /** 丢弃当前缓存和渲染计数。 */
    function resetDemo(): void {
      setSession((current) => current + 1)
    }

    return <QueryRenderOptimizationsSession key={session} onReset={resetDemo} />
  }

  return QueryRenderOptimizationsDemoRoot
}
