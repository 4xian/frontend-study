import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  type QueryFunctionContext,
} from '@tanstack/react-query'
import { useEffect, useState, type ComponentType, type ReactElement } from 'react'

import './query-status-demo.css'

type LessonTask = {
  id: string
  title: string
}

const lessonQueryKey = ['lesson-query-status-tasks'] as const

const lessonTasks: LessonTask[] = [
  { id: 't-601', title: '区分 status 与 fetchStatus' },
  { id: 't-602', title: '观察首次查询状态' },
  { id: 't-603', title: '保留后台更新中的数据' },
]

const statusDescriptions = {
  pending: '还没有成功数据',
  error: '最近一次执行失败',
  success: '已经有可用数据',
} as const

const fetchStatusDescriptions = {
  fetching: 'queryFn 正在执行',
  paused: '查询想执行但被暂停',
  idle: '当前没有执行中的 queryFn',
} as const

/** 使用可取消的本地延迟 Promise，让查询执行阶段保持可观察。 */
async function loadLessonTasks({
  signal,
}: QueryFunctionContext<typeof lessonQueryKey>): Promise<LessonTask[]> {
  return new Promise((resolve, reject) => {
    let timer: number | undefined
    let handleAbort: () => void = () => undefined

    /** 清理延迟计时器和 abort 监听器，避免 Demo 卸载后残留资源。 */
    const cleanup = () => {
      if (timer !== undefined) {
        window.clearTimeout(timer)
      }
      signal.removeEventListener('abort', handleAbort)
    }

    /** 完成本地延迟查询并交付固定任务数据。 */
    const finish = () => {
      cleanup()
      resolve(lessonTasks)
    }

    /** 响应查询取消并以错误结束 Promise。 */
    handleAbort = () => {
      cleanup()
      reject(new Error('查询已取消'))
    }

    signal.addEventListener('abort', handleAbort, { once: true })

    if (signal.aborted) {
      handleAbort()
      return
    }

    timer = window.setTimeout(finish, 650)
  })
}

/** 渲染查询的两个状态维度、派生值以及首次和后台更新的不同提示。 */
function QueryStatusPanel(): ReactElement {
  const taskQuery = useQuery({
    queryKey: lessonQueryKey,
    queryFn: loadLessonTasks,
    enabled: false,
    retry: false,
  })

  return (
    <section className="query-status-panel" data-testid="query-status-demo">
      <header className="query-status-header">
        <span>TanStack Query</span>
        <h2>查询状态观察器</h2>
        <p>分别观察数据状态与 queryFn 执行状态，理解首次查询和后台更新的差异。</p>
      </header>

      <div className="query-status-board" aria-label="查询状态">
        <div className="query-status-card">
          <span>status</span>
          <strong data-testid="query-status-value">{taskQuery.status}</strong>
          <small>{statusDescriptions[taskQuery.status]}</small>
        </div>
        <div className="query-status-card">
          <span>fetchStatus</span>
          <strong data-testid="query-fetch-status-value">{taskQuery.fetchStatus}</strong>
          <small>{fetchStatusDescriptions[taskQuery.fetchStatus]}</small>
        </div>
      </div>

      <div className="query-status-derived" aria-label="派生状态">
        <div>
          <span>isPending</span>
          <strong data-testid="query-is-pending">{String(taskQuery.isPending)}</strong>
        </div>
        <div>
          <span>isLoading</span>
          <strong data-testid="query-is-loading">{String(taskQuery.isLoading)}</strong>
        </div>
        <div>
          <span>isFetching</span>
          <strong data-testid="query-is-fetching">{String(taskQuery.isFetching)}</strong>
        </div>
        <div>
          <span>isRefetching</span>
          <strong data-testid="query-is-refetching">{String(taskQuery.isRefetching)}</strong>
        </div>
      </div>

      <div className="query-status-observation" aria-live="polite">
        {taskQuery.isPending && !taskQuery.isFetching && (
          <strong>尚未开始查询：pending + idle</strong>
        )}
        {taskQuery.isPending && taskQuery.isFetching && (
          <strong>首次查询执行中：pending + fetching</strong>
        )}
        {taskQuery.isSuccess && taskQuery.isFetching && (
          <strong>已有数据，后台更新中：success + fetching</strong>
        )}
        {taskQuery.isSuccess && !taskQuery.isFetching && <strong>查询完成：success + idle</strong>}
        {taskQuery.isError && <strong>查询失败：{taskQuery.error.message}</strong>}
      </div>

      {taskQuery.isSuccess && (
        <ul className="query-status-list">
          {taskQuery.data.map((task) => (
            <li key={task.id}>{task.title}</li>
          ))}
        </ul>
      )}

      <button
        className="query-status-button"
        type="button"
        onClick={() => void taskQuery.refetch()}
        disabled={taskQuery.isFetching}
      >
        {taskQuery.isFetching ? '查询中...' : taskQuery.isPending ? '开始查询' : '再次查询'}
      </button>
    </section>
  )
}

/** 为每次 Demo 挂载提供稳定且独立的 QueryClient，并在卸载时清理查询缓存。 */
function QueryStatusDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => {
      queryClient.clear()
    }
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <QueryStatusPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册查询状态 Demo。 */
export function createQueryStatusDemo(): ComponentType {
  return QueryStatusDemoRoot
}
