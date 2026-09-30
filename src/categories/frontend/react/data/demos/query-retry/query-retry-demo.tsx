import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
  type QueryFunctionContext,
} from '@tanstack/react-query'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactElement,
} from 'react'

import './query-retry-demo.css'

type QueryOutcome = 'unavailable' | 'not-found' | 'success'

type LessonTask = {
  id: string
  title: string
  owner: string
}

type TasksQueryKey = readonly ['tasks', 'list', number]

type ObservedTasksFn = (context: QueryFunctionContext<TasksQueryKey>) => Promise<LessonTask[]>

const lessonTasks: LessonTask[] = [
  { id: 't-801', title: '核对重试次数', owner: '林晓' },
  { id: 't-802', title: '区分 404 与 503', owner: '周宁' },
]

const lessonTasksUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(lessonTasks))}`

/** 等待固定时长并响应取消，让每次尝试都可被点到。 */
function waitForRetryAttempt(signal: AbortSignal, delayMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timerId = window.setTimeout(() => {
      signal.removeEventListener('abort', cancel)
      resolve()
    }, delayMs)

    /** 取消本地延迟并结束当前尝试。 */
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

/** 按当前选择返回成功列表、503 或 404。 */
async function loadTasks(
  outcome: QueryOutcome,
  { signal }: QueryFunctionContext<TasksQueryKey>,
): Promise<LessonTask[]> {
  await waitForRetryAttempt(signal, 180)
  const response =
    outcome === 'unavailable'
      ? new Response(JSON.stringify({ message: '任务服务暂不可用' }), {
          status: 503,
          statusText: 'Service Unavailable',
        })
      : outcome === 'not-found'
        ? new Response(JSON.stringify({ message: '任务不存在' }), {
            status: 404,
            statusText: 'Not Found',
          })
        : await fetch(lessonTasksUrl, { signal })
  if (!response.ok) {
    throw new Error(`任务请求失败：HTTP ${response.status}`)
  }
  return (await response.json()) as LessonTask[]
}

/** 判断这次失败要不要继续重试：404 立即停，其他最多额外试 2 次。 */
function shouldRetryTasks(failureCount: number, error: Error): boolean {
  if (error.message.includes('HTTP 404')) {
    return false
  }
  return failureCount < 2
}

/** 把任务列表的身份、请求和重试策略收进同一份配置。 */
function tasksOptions(revision: number, started: boolean, queryFn: ObservedTasksFn) {
  return queryOptions({
    queryKey: ['tasks', 'list', revision] as const,
    queryFn,
    enabled: started,
    retry: shouldRetryTasks,
    retryDelay: 400,
    staleTime: Infinity,
  })
}

/** 观察失败后的自动重试、failureReason 与最终 error。 */
function QueryRetryPanel(): ReactElement {
  const [outcome, setOutcome] = useState<QueryOutcome>('unavailable')
  const [started, setStarted] = useState(false)
  const [revision, setRevision] = useState(0)
  const [requestCount, setRequestCount] = useState(0)
  const outcomeRef = useRef<QueryOutcome>(outcome)
  outcomeRef.current = outcome

  const loadObservedTasks = useCallback(async (context: QueryFunctionContext<TasksQueryKey>) => {
    setRequestCount((count) => count + 1)
    return loadTasks(outcomeRef.current, context)
  }, [])

  const tasksQuery = useQuery(tasksOptions(revision, started, loadObservedTasks))

  /** 选择下一次请求应返回的结果。 */
  function chooseOutcome(nextOutcome: QueryOutcome): void {
    setOutcome(nextOutcome)
  }

  /** 尚未启用时开始查询，已经启用后改为手动重新获取。 */
  function runQuery(): void {
    if (!started) {
      setStarted(true)
      return
    }
    void tasksQuery.refetch()
  }

  /** 换一份查询身份，清掉当前失败记录，保留这次选择的结果。 */
  function resetQuery(): void {
    setStarted(false)
    setRequestCount(0)
    setRevision((current) => current + 1)
  }

  const failureReasonText = tasksQuery.failureReason?.message ?? '无'
  const errorText = tasksQuery.error?.message ?? '无'

  return (
    <section className="query-retry-demo" data-testid="query-retry-demo">
      <header className="query-retry-header">
        <span>TanStack Query</span>
        <h2>查询重试</h2>
        <p>
          503 会按 retryDelay 额外重试 2 次；404 用函数立刻停。重试还没结束时看
          failureReason，最后一次失败才写入 error。
        </p>
      </header>

      <div className="query-retry-metrics" aria-live="polite">
        <div>
          <span>请求次数</span>
          <strong data-testid="query-retry-count">{requestCount}</strong>
        </div>
        <div>
          <span>failureCount</span>
          <strong data-testid="query-retry-failure-count">{tasksQuery.failureCount}</strong>
        </div>
        <div>
          <span>status</span>
          <strong data-testid="query-retry-status">{tasksQuery.status}</strong>
        </div>
        <div>
          <span>isFetching</span>
          <strong data-testid="query-retry-fetching">{String(tasksQuery.isFetching)}</strong>
        </div>
        <div>
          <span>isError</span>
          <strong data-testid="query-retry-is-error">{String(tasksQuery.isError)}</strong>
        </div>
        <div>
          <span>failureReason</span>
          <strong data-testid="query-retry-failure-reason">{failureReasonText}</strong>
        </div>
        <div>
          <span>error</span>
          <strong data-testid="query-retry-error">{errorText}</strong>
        </div>
      </div>

      <div className="query-retry-actions">
        <button
          type="button"
          aria-pressed={outcome === 'unavailable'}
          disabled={tasksQuery.isFetching}
          onClick={() => chooseOutcome('unavailable')}
        >
          503
        </button>
        <button
          type="button"
          aria-pressed={outcome === 'not-found'}
          disabled={tasksQuery.isFetching}
          onClick={() => chooseOutcome('not-found')}
        >
          404
        </button>
        <button
          type="button"
          aria-pressed={outcome === 'success'}
          disabled={tasksQuery.isFetching}
          onClick={() => chooseOutcome('success')}
        >
          成功
        </button>
        <button
          type="button"
          data-kind="primary"
          disabled={tasksQuery.isFetching}
          onClick={runQuery}
        >
          {started ? '再次获取' : '开始查询'}
        </button>
        <button type="button" disabled={tasksQuery.isFetching} onClick={resetQuery}>
          重置
        </button>
      </div>

      <div className="query-retry-columns">
        <section className="query-retry-card">
          <h3>当前观察</h3>
          {!started && (
            <p className="query-retry-message" role="status">
              查询尚未开始。默认会请求 503，开始后会看到 3 次尝试。
            </p>
          )}
          {started && tasksQuery.isFetching && tasksQuery.failureCount === 0 && (
            <p className="query-retry-message" role="status">
              正在请求，还没有记入失败。
            </p>
          )}
          {started && tasksQuery.isFetching && tasksQuery.failureCount > 0 && (
            <p className="query-retry-message" role="status">
              正在重试，failureReason 已有内容，error 仍为空。
            </p>
          )}
          {tasksQuery.isError && !tasksQuery.isFetching && requestCount === 1 && (
            <p className="query-retry-message" role="alert">
              {tasksQuery.error.message}。函数在第一次失败后返回 false，没有进入重试。
            </p>
          )}
          {tasksQuery.isError && !tasksQuery.isFetching && requestCount > 1 && (
            <p className="query-retry-message" role="alert">
              重试耗尽后才进入 error。这次共 {requestCount} 次尝试。
            </p>
          )}
          {tasksQuery.isSuccess && !tasksQuery.isFetching && (
            <p className="query-retry-message" role="status">
              查询成功，failureCount 已归零。
            </p>
          )}
        </section>
        <section className="query-retry-card" data-testid="query-retry-tasks">
          <h3>任务列表</h3>
          {tasksQuery.isPending && !tasksQuery.isFetching && (
            <p className="query-retry-message" role="status">
              还没有成功数据。
            </p>
          )}
          {tasksQuery.isError && (
            <p className="query-retry-message" role="alert">
              {tasksQuery.error.message}
            </p>
          )}
          {tasksQuery.isSuccess && (
            <ul data-testid="query-retry-task-list">
              {tasksQuery.data.map((task) => (
                <li key={task.id}>
                  {task.title} / {task.owner}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  )
}

/** 为 Demo 提供独立 QueryClient，并在离开页面时清空本地缓存。 */
function QueryRetryDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => queryClient.clear()
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <QueryRetryPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册查询重试 Demo。 */
export function createQueryRetryDemo(): ComponentType {
  return QueryRetryDemoRoot
}
