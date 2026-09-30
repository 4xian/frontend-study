import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
  useQueryClient,
  type QueryFunctionContext,
} from '@tanstack/react-query'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactElement,
} from 'react'

import './query-cancellation-demo.css'

type LessonTask = {
  id: string
  title: string
  owner: string
}

type TasksQueryKey = readonly ['tasks', 'list', number]

type ObservedTasksFn = (context: QueryFunctionContext<TasksQueryKey>) => Promise<LessonTask[]>

type CacheView = {
  status: string
  fetchStatus: string
  isError: boolean
  data: LessonTask[] | undefined
}

const lessonTasks: LessonTask[] = [
  { id: 't-901', title: '核对取消后的旧数据', owner: '林晓' },
  { id: 't-902', title: '区分是否消费 signal', owner: '周宁' },
]

const lessonTasksUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(lessonTasks))}`

const emptyCacheView: CacheView = {
  status: '无',
  fetchStatus: '无',
  isError: false,
  data: undefined,
}

/** 等待固定时长；传入 signal 时才能被查询取消打断。 */
function waitForCancellation(signal: AbortSignal | undefined, delayMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timerId = window.setTimeout(() => {
      signal?.removeEventListener('abort', cancel)
      resolve()
    }, delayMs)

    /** 取消本地延迟并结束当前尝试。 */
    function cancel(): void {
      window.clearTimeout(timerId)
      signal?.removeEventListener('abort', cancel)
      reject(new DOMException('查询已取消', 'AbortError'))
    }

    if (!signal) {
      return
    }
    if (signal.aborted) {
      cancel()
      return
    }
    signal.addEventListener('abort', cancel, { once: true })
  })
}

/** 按是否消费 signal 读取任务列表。 */
async function loadTasks(
  consumeSignal: boolean,
  context: QueryFunctionContext<TasksQueryKey>,
): Promise<LessonTask[]> {
  if (consumeSignal) {
    const { signal } = context
    await waitForCancellation(signal, 1400)
    const response = await fetch(lessonTasksUrl, { signal })
    if (!response.ok) {
      throw new Error(`任务请求失败：HTTP ${response.status}`)
    }
    return (await response.json()) as LessonTask[]
  }

  await waitForCancellation(undefined, 1400)
  const response = await fetch(lessonTasksUrl)
  if (!response.ok) {
    throw new Error(`任务请求失败：HTTP ${response.status}`)
  }
  return (await response.json()) as LessonTask[]
}

/** 把任务列表的身份、请求和取消相关配置收进同一份配置。 */
function tasksOptions(queryKey: TasksQueryKey, started: boolean, queryFn: ObservedTasksFn) {
  return queryOptions({
    queryKey,
    queryFn,
    enabled: started,
    retry: false,
    staleTime: Infinity,
  })
}

/** 读取当前查询在缓存里的状态，观察者隐藏时也能看到请求是否写回。 */
function readCacheView(queryClient: QueryClient, queryKey: TasksQueryKey): CacheView {
  const state = queryClient.getQueryState<LessonTask[]>(queryKey)
  if (!state) {
    return emptyCacheView
  }
  return {
    status: state.status,
    fetchStatus: state.fetchStatus,
    isError: state.status === 'error',
    data: state.data,
  }
}

/** 缓存快照没变时沿用旧对象，避免订阅回调把面板打进更新环。 */
function isSameCacheView(left: CacheView, right: CacheView): boolean {
  return (
    left.status === right.status &&
    left.fetchStatus === right.fetchStatus &&
    left.isError === right.isError &&
    left.data === right.data
  )
}

/** 挂上 useQuery，让这条查询真正被观察；界面状态由父组件从缓存读取。 */
function QueryCancellationObserver({
  queryKey,
  started,
  queryFn,
}: {
  queryKey: TasksQueryKey
  started: boolean
  queryFn: ObservedTasksFn
}): null {
  useQuery(tasksOptions(queryKey, started, queryFn))
  return null
}

/** 观察手动取消、消费 signal 后的卸载取消，以及未消费时请求仍会写回缓存。 */
function QueryCancellationPanel(): ReactElement {
  const queryClient = useQueryClient()
  const [consumeSignal, setConsumeSignal] = useState(true)
  const [started, setStarted] = useState(false)
  const [mounted, setMounted] = useState(true)
  const [revision, setRevision] = useState(0)
  const [requestCount, setRequestCount] = useState(0)
  const [cacheView, setCacheView] = useState<CacheView>(emptyCacheView)
  const consumeRef = useRef(consumeSignal)
  consumeRef.current = consumeSignal
  const queryKey = useMemo((): TasksQueryKey => ['tasks', 'list', revision], [revision])

  /** 统计每次 queryFn 执行，并按当前选择决定要不要消费 signal。 */
  const loadObservedTasks = useCallback(async (context: QueryFunctionContext<TasksQueryKey>) => {
    queueMicrotask(() => {
      setRequestCount((count) => count + 1)
    })
    return loadTasks(consumeRef.current, context)
  }, [])

  useEffect(() => {
    /** 把缓存快照同步到面板，观察者隐藏时也能看到写回或回退。 */
    const syncCacheView = () => {
      const nextView = readCacheView(queryClient, queryKey)
      setCacheView((current) => (isSameCacheView(current, nextView) ? current : nextView))
    }
    syncCacheView()
    return queryClient.getQueryCache().subscribe(syncCacheView)
  }, [queryClient, queryKey])

  const isFetching = cacheView.fetchStatus === 'fetching'
  const hasData = cacheView.data !== undefined
  const wasCancelled =
    started && requestCount > 0 && !isFetching && cacheView.status === 'pending' && !hasData

  /** 尚未启用时开始查询，已经启用后改为手动重新获取。 */
  function runQuery(): void {
    setMounted(true)
    if (!started) {
      setStarted(true)
      return
    }
    void queryClient.refetchQueries({ queryKey })
  }

  /** 取消当前查询，并按默认 revert 回到这次请求开始前的状态。 */
  function cancelQuery(): void {
    void queryClient.cancelQueries({ queryKey })
  }

  /** 卸掉唯一观察者，用来对比消费 signal 前后卸载会不会取消。 */
  function toggleObserver(): void {
    setMounted((current) => !current)
  }

  /** 换一份查询身份，清掉当前缓存记录，保留这次是否消费 signal。 */
  function resetQuery(): void {
    setStarted(false)
    setMounted(true)
    setRequestCount(0)
    setRevision((current) => current + 1)
  }

  return (
    <section className="query-cancellation-demo" data-testid="query-cancellation-demo">
      {mounted && (
        <QueryCancellationObserver
          queryKey={queryKey}
          started={started}
          queryFn={loadObservedTasks}
        />
      )}

      <header className="query-cancellation-header">
        <span>TanStack Query</span>
        <h2>查询取消</h2>
        <p>
          默认会消费 signal。请求发出后可取消，或隐藏观察者。改选不消费 signal
          再隐藏观察者，请求仍会完成并写入缓存。
        </p>
      </header>

      <div className="query-cancellation-metrics" aria-live="polite">
        <div>
          <span>请求次数</span>
          <strong data-testid="query-cancellation-count">{requestCount}</strong>
        </div>
        <div>
          <span>status</span>
          <strong data-testid="query-cancellation-status">{cacheView.status}</strong>
        </div>
        <div>
          <span>fetchStatus</span>
          <strong data-testid="query-cancellation-fetch-status">{cacheView.fetchStatus}</strong>
        </div>
        <div>
          <span>isFetching</span>
          <strong data-testid="query-cancellation-fetching">{String(isFetching)}</strong>
        </div>
        <div>
          <span>isError</span>
          <strong data-testid="query-cancellation-is-error">{String(cacheView.isError)}</strong>
        </div>
        <div>
          <span>缓存 data</span>
          <strong data-testid="query-cancellation-cache-data">{hasData ? '有' : '无'}</strong>
        </div>
        <div>
          <span>观察者</span>
          <strong data-testid="query-cancellation-observer">{mounted ? '已挂载' : '已隐藏'}</strong>
        </div>
      </div>

      <div className="query-cancellation-actions">
        <button
          type="button"
          aria-pressed={consumeSignal}
          disabled={isFetching}
          onClick={() => setConsumeSignal(true)}
        >
          消费 signal
        </button>
        <button
          type="button"
          aria-pressed={!consumeSignal}
          disabled={isFetching}
          onClick={() => setConsumeSignal(false)}
        >
          不消费 signal
        </button>
        <button type="button" data-kind="primary" disabled={isFetching} onClick={runQuery}>
          {started ? '再次获取' : '开始查询'}
        </button>
        <button type="button" disabled={!isFetching} onClick={cancelQuery}>
          取消查询
        </button>
        <button type="button" onClick={toggleObserver}>
          {mounted ? '隐藏观察者' : '显示观察者'}
        </button>
        <button type="button" disabled={isFetching} onClick={resetQuery}>
          重置
        </button>
      </div>

      <div className="query-cancellation-columns">
        <section className="query-cancellation-card">
          <h3>当前观察</h3>
          {!started && (
            <p className="query-cancellation-message" role="status">
              查询尚未开始。开始后会等待约 1.4 秒，这段时间可以点取消或隐藏观察者。
            </p>
          )}
          {started && mounted && isFetching && !hasData && (
            <p className="query-cancellation-message" role="status">
              正在请求，还没有成功数据。现在取消会回到 pending 且 idle，不会变成 error。
            </p>
          )}
          {started && mounted && isFetching && hasData && (
            <p className="query-cancellation-message" role="status">
              正在重新获取。现在取消会回到上一份成功数据，fetchStatus 回到 idle。
            </p>
          )}
          {!mounted && isFetching && consumeSignal && (
            <p className="query-cancellation-message" role="status">
              已隐藏唯一观察者，并且消费了 signal，查询会取消并回退。
            </p>
          )}
          {!mounted && isFetching && !consumeSignal && (
            <p className="query-cancellation-message" role="status">
              已隐藏唯一观察者，但没有消费 signal，请求仍会完成并写入缓存。
            </p>
          )}
          {wasCancelled && (
            <p className="query-cancellation-message" role="status">
              查询已取消并回退。没有旧数据，所以 status 仍是 pending，isError 为 false。
            </p>
          )}
          {started && cacheView.status === 'success' && !isFetching && (
            <p className="query-cancellation-message" role="status">
              查询成功。可以再次获取后中途取消，或改选不消费 signal 后隐藏观察者。
            </p>
          )}
        </section>
        <section className="query-cancellation-card" data-testid="query-cancellation-tasks">
          <h3>任务列表</h3>
          {!hasData && (
            <p className="query-cancellation-message" role="status">
              缓存里还没有成功数据。
            </p>
          )}
          {hasData && (
            <ul data-testid="query-cancellation-task-list">
              {cacheView.data?.map((task) => (
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
function QueryCancellationDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => queryClient.clear()
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <QueryCancellationPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册查询取消 Demo。 */
export function createQueryCancellationDemo(): ComponentType {
  return QueryCancellationDemoRoot
}
