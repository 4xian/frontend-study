import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { Suspense, useEffect, useState, type ComponentType, type ReactElement } from 'react'

import './suspense-queries-demo.css'

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

const taskDetail: TaskItem = { id: 't-1', title: '现有任务', owner: '林晓' }

/** 等待固定时长，让 Suspense fallback 能被看清。 */
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

/** 成功后直接读 data，不再判断 isPending。 */
function TaskDetailPane(): ReactElement {
  const taskQuery = useSuspenseQuery(taskDetailOptions)
  return (
    <p data-testid="suspense-query-task">
      {taskQuery.data.title} / {taskQuery.data.owner}
    </p>
  )
}

/** 首次没有缓存时显示 fallback，成功后显示现有任务。 */
function SuspenseFallback(): ReactElement {
  return (
    <p className="suspense-query-message" role="status" data-testid="suspense-query-fallback">
      正在读取任务。
    </p>
  )
}

/** 对照 Suspense fallback 与保证存在的 data。 */
function SuspenseQueriesPanel({
  fetchCount,
  onReset,
}: {
  fetchCount: number
  onReset: () => void
}): ReactElement {
  return (
    <section className="suspense-query-demo" data-testid="suspense-query-demo">
      <header className="suspense-query-header">
        <span>TanStack Query</span>
        <h2>Suspense 查询</h2>
        <p>
          首次读取时组件挂起，fallback 显示正在读取任务。成功后 data 一定有值，直接显示现有任务 /
          林晓。
        </p>
      </header>

      <div className="suspense-query-metrics" aria-live="polite">
        <div>
          <span>请求次数</span>
          <strong data-testid="suspense-query-fetch-count">{fetchCount}</strong>
        </div>
      </div>

      <div className="suspense-query-actions">
        <button type="button" data-kind="primary" onClick={onReset}>
          重置
        </button>
      </div>

      <div className="suspense-query-columns">
        <section className="suspense-query-card">
          <h3>任务详情</h3>
          <Suspense fallback={<SuspenseFallback />}>
            <TaskDetailPane />
          </Suspense>
        </section>
      </div>
    </section>
  )
}

/** 客户端放在 Suspense 外面，避免挂起时丢掉 QueryClient。 */
function SuspenseQueriesSession({ onReset }: { onReset: () => void }): ReactElement {
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
      <SuspenseQueriesPanel fetchCount={fetchCount} onReset={onReset} />
    </QueryClientProvider>
  )
}

/** 为课程页面注册 Suspense 查询 Demo。 */
export function createSuspenseQueriesDemo(): ComponentType {
  /** 重置时整段重挂，让 fallback 再次出现。 */
  function SuspenseQueriesDemoRoot(): ReactElement {
    const [session, setSession] = useState(0)

    /** 丢弃当前缓存，重新走一次挂起。 */
    function resetDemo(): void {
      setSession((current) => current + 1)
    }

    return <SuspenseQueriesSession key={session} onReset={resetDemo} />
  }

  return SuspenseQueriesDemoRoot
}
