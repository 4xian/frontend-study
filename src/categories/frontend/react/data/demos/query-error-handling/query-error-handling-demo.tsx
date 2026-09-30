import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  type QueryFunctionContext,
} from '@tanstack/react-query'
import { useEffect, useRef, useState, type ComponentType, type ReactElement } from 'react'

import './query-error-handling-demo.css'

type LessonTask = {
  id: string
  title: string
  owner: string
}

type QueryOutcome = 'success' | 'failure'
type LessonQueryKey = readonly ['lesson-query-error-tasks', number]

const lessonTasks: LessonTask[] = [
  { id: 't-701', title: '检查 response.ok', owner: '林晓' },
  { id: 't-702', title: '渲染 error.message', owner: '周宁' },
  { id: 't-703', title: '保留重新获取前的数据', owner: '陈默' },
]

const lessonTasksUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(lessonTasks))}`

/** 等待固定时长并响应 AbortSignal，保证错误状态和卸载清理都可观察。 */
function waitForQuery(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timerId = window.setTimeout(() => {
      signal.removeEventListener('abort', cancel)
      resolve()
    }, 550)

    /** 取消本地延迟并结束当前查询的等待。 */
    function cancel(): void {
      window.clearTimeout(timerId)
      signal.removeEventListener('abort', cancel)
      reject(new DOMException('查询已取消', 'AbortError'))
    }

    if (signal.aborted) {
      cancel()
      return
    }

    signal.addEventListener('abort', cancel, { once: true })
  })
}

/** 渲染已经确认可用的任务列表，供成功和重新获取失败状态复用。 */
function TaskList({ tasks }: { tasks: LessonTask[] }): ReactElement {
  return (
    <ul className="query-error-list">
      {tasks.map((task) => (
        <li key={task.id}>
          <strong>{task.title}</strong>
          <span>{task.owner}</span>
        </li>
      ))}
    </ul>
  )
}

/** 观察 queryFn 抛错、错误状态渲染以及重新获取失败后的数据保留。 */
function QueryErrorPanel(): ReactElement {
  const [revision, setRevision] = useState(0)
  const [selectedOutcome, setSelectedOutcome] = useState<QueryOutcome>('success')
  const nextOutcomeRef = useRef<QueryOutcome>('success')
  const queryKey: LessonQueryKey = ['lesson-query-error-tasks', revision]

  /** 根据按钮选择记录下一次 queryFn 应返回成功还是错误。 */
  function chooseOutcome(outcome: QueryOutcome): void {
    nextOutcomeRef.current = outcome
    setSelectedOutcome(outcome)
  }

  /** 使用本地 Response 模拟 HTTP 成功或 503，并显式检查 response.ok。 */
  async function loadLessonTasks({
    signal,
  }: QueryFunctionContext<LessonQueryKey>): Promise<LessonTask[]> {
    await waitForQuery(signal)

    const response =
      nextOutcomeRef.current === 'failure'
        ? new Response(JSON.stringify({ message: '任务服务暂不可用' }), {
            status: 503,
            statusText: 'Service Unavailable',
          })
        : await fetch(lessonTasksUrl, { signal })

    if (!response.ok) {
      throw new Error(`任务请求失败：HTTP ${response.status}`)
    }

    return (await response.json()) as LessonTask[]
  }

  /** 手动执行当前选择的查询结果，避免 Demo 自动重试改变观察顺序。 */
  function runQuery(): void {
    void taskQuery.refetch()
  }

  /** 创建新的查询身份，把错误观察器恢复到 pending + idle 起点。 */
  function resetQuery(): void {
    nextOutcomeRef.current = 'success'
    setSelectedOutcome('success')
    setRevision((currentRevision) => currentRevision + 1)
  }

  const taskQuery = useQuery({
    queryKey,
    queryFn: loadLessonTasks,
    enabled: false,
    retry: false,
  })

  return (
    <section className="query-error-panel" data-testid="query-error-handling-demo">
      <header className="query-error-header">
        <span>TanStack Query</span>
        <h2>查询错误观察器</h2>
        <p>切换本地响应结果，观察首次错误、成功恢复和重新获取失败时的数据保留。</p>
      </header>

      <div className="query-error-controls" aria-label="下一次响应结果">
        <span className="query-error-controls-label">下一次响应</span>
        <button
          className={selectedOutcome === 'success' ? 'is-selected' : ''}
          type="button"
          aria-pressed={selectedOutcome === 'success'}
          onClick={() => chooseOutcome('success')}
          disabled={taskQuery.isFetching}
        >
          成功（200）
        </button>
        <button
          className={selectedOutcome === 'failure' ? 'is-selected' : ''}
          type="button"
          aria-pressed={selectedOutcome === 'failure'}
          onClick={() => chooseOutcome('failure')}
          disabled={taskQuery.isFetching}
        >
          失败（503）
        </button>
      </div>

      <div className="query-error-state" aria-label="错误状态" aria-live="polite">
        <div>
          <span>status</span>
          <strong data-testid="query-error-status">{taskQuery.status}</strong>
        </div>
        <div>
          <span>isError</span>
          <strong data-testid="query-error-is-error">{String(taskQuery.isError)}</strong>
        </div>
        <div>
          <span>isFetching</span>
          <strong data-testid="query-error-is-fetching">{String(taskQuery.isFetching)}</strong>
        </div>
        <div>
          <span>isLoadingError</span>
          <strong data-testid="query-error-is-loading-error">
            {String(taskQuery.isLoadingError)}
          </strong>
        </div>
        <div>
          <span>isRefetchError</span>
          <strong data-testid="query-error-is-refetch-error">
            {String(taskQuery.isRefetchError)}
          </strong>
        </div>
      </div>

      <div className="query-error-observation" aria-live="polite">
        {taskQuery.isPending && !taskQuery.isFetching && (
          <strong>尚未开始查询：pending + idle</strong>
        )}
        {taskQuery.isPending && taskQuery.isFetching && (
          <strong>首次查询执行中：pending + fetching</strong>
        )}
        {taskQuery.isSuccess && taskQuery.isFetching && (
          <strong>重新获取执行中：继续保留已有 data</strong>
        )}
        {taskQuery.isLoadingError && <strong>首次查询失败：没有可用数据</strong>}
        {taskQuery.isSuccess && !taskQuery.isFetching && <strong>查询成功：可以渲染 data</strong>}
        {taskQuery.isRefetchError && <strong>重新获取失败：保留上一次成功的数据</strong>}
      </div>

      {taskQuery.isError && (
        <p className="query-error-message" role="alert">
          错误信息：{taskQuery.error.message}
        </p>
      )}

      {taskQuery.isSuccess && <TaskList tasks={taskQuery.data} />}
      {taskQuery.isRefetchError && <TaskList tasks={taskQuery.data} />}

      <div className="query-error-actions">
        <button
          className="query-error-primary-button"
          type="button"
          onClick={runQuery}
          disabled={taskQuery.isFetching}
        >
          {taskQuery.isFetching ? '查询中...' : '执行查询'}
        </button>
        <button
          className="query-error-secondary-button"
          type="button"
          onClick={resetQuery}
          disabled={taskQuery.isFetching}
        >
          重置观察
        </button>
      </div>
    </section>
  )
}

/** 为每次 Demo 挂载提供独立的 QueryClient，并在卸载时清理查询缓存。 */
function QueryErrorHandlingDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => {
      queryClient.clear()
    }
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册查询错误处理 Demo。 */
export function createQueryErrorHandlingDemo(): ComponentType {
  return QueryErrorHandlingDemoRoot
}
