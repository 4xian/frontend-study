import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  type QueryFunctionContext,
  type UseQueryResult,
} from '@tanstack/react-query'
import { useEffect, useRef, useState, type ComponentType, type ReactElement } from 'react'

import './query-cache-sharing-demo.css'

type LessonTask = {
  id: string
  title: string
}

type SharedTaskData = {
  version: number
  tasks: LessonTask[]
}

type LessonQueryKey = readonly ['lesson-query-cache-sharing-tasks', number]

const lessonTasks: LessonTask[] = [
  { id: 't-801', title: '同一个 queryKey 共享缓存' },
  { id: 't-802', title: '并发查询只执行一次' },
  { id: 't-803', title: '重新获取同步观察者' },
]

/** 等待固定时长，让首次查询和共享请求状态保持可观察。 */
function waitForQuery(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timerId = window.setTimeout(() => {
      signal.removeEventListener('abort', cancel)
      resolve()
    }, 600)

    /** 清理延迟并报告查询取消。 */
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

/** 渲染一个观察组件当前读取到的共享缓存结果。 */
function ObserverCard({
  label,
  query,
}: {
  label: string
  query: UseQueryResult<SharedTaskData, Error>
}): ReactElement {
  return (
    <article className="query-cache-observer-card">
      <span className="query-cache-observer-label">{label}</span>
      <strong>{query.status}</strong>
      <span className="query-cache-observer-state">
        {query.isFetching
          ? '正在读取共享查询'
          : query.isSuccess
            ? '已读取缓存数据'
            : '等待查询执行'}
      </span>
      {query.isSuccess && (
        <>
          <span className="query-cache-observer-version">缓存版本：{query.data.version}</span>
          <span className="query-cache-observer-count">任务数量：{query.data.tasks.length}</span>
        </>
      )}
    </article>
  )
}

/** 挂载第二个查询观察者，验证它会加入同 key 请求或读取已有缓存。 */
function SecondaryObserver({
  queryKey,
  queryFn,
  enabled,
}: {
  queryKey: LessonQueryKey
  queryFn: (context: QueryFunctionContext<LessonQueryKey>) => Promise<SharedTaskData>
  enabled: boolean
}): ReactElement {
  const query = useQuery({
    queryKey,
    queryFn,
    enabled,
    retry: false,
  })

  return <ObserverCard label="观察组件 B" query={query} />
}

/** 观察同一个 queryKey 的缓存共享、请求去重和后挂载读取。 */
function QueryCacheSharingPanel(): ReactElement {
  const [revision, setRevision] = useState(0)
  const [serverVersion, setServerVersion] = useState(1)
  const [requestCount, setRequestCount] = useState(0)
  const [showSecondObserver, setShowSecondObserver] = useState(true)
  const [queryStarted, setQueryStarted] = useState(false)
  const [initialReadComplete, setInitialReadComplete] = useState(false)
  const serverVersionRef = useRef(1)
  const queryKey: LessonQueryKey = ['lesson-query-cache-sharing-tasks', revision]

  /** 返回当前服务端快照，让每次重新获取都能显示新的缓存版本。 */
  async function loadSharedTasks({
    signal,
  }: QueryFunctionContext<LessonQueryKey>): Promise<SharedTaskData> {
    setRequestCount((count) => count + 1)
    await waitForQuery(signal)

    return {
      version: serverVersionRef.current,
      tasks: lessonTasks,
    }
  }

  const primaryQuery = useQuery({
    queryKey,
    queryFn: loadSharedTasks,
    enabled: queryStarted,
    retry: false,
  })

  useEffect(() => {
    if (primaryQuery.isSuccess) {
      setInitialReadComplete(true)
    }
  }, [primaryQuery.isSuccess])

  /** 同时启用两个观察者，验证同 key 的并发查询只执行一次。 */
  function readSharedCache(): void {
    setQueryStarted(true)
  }

  /** 产生新的服务端快照，再从一个观察者重新获取共享数据。 */
  function refetchSharedCache(): void {
    serverVersionRef.current += 1
    setServerVersion(serverVersionRef.current)
    void primaryQuery.refetch()
  }

  /** 创建新的查询身份，清除本次 Demo 的观察起点。 */
  function resetObservation(): void {
    serverVersionRef.current = 1
    setServerVersion(1)
    setRequestCount(0)
    setQueryStarted(false)
    setInitialReadComplete(false)
    setShowSecondObserver(true)
    setRevision((currentRevision) => currentRevision + 1)
  }

  const queryIsFetching = primaryQuery.isFetching

  return (
    <section className="query-cache-sharing-panel" data-testid="query-cache-sharing-demo">
      <header className="query-cache-sharing-header">
        <span>TanStack Query</span>
        <h2>查询缓存共享观察器</h2>
        <p>两个观察组件使用同一个 queryKey，观察请求去重、缓存同步和后挂载读取。</p>
      </header>

      <div className="query-cache-sharing-key" aria-label="查询缓存身份">
        <span>QueryClient 缓存作用域</span>
        <code>{JSON.stringify(queryKey)}</code>
      </div>

      <div className="query-cache-sharing-metrics" aria-label="缓存观察指标">
        <div>
          <span>queryFn 执行次数</span>
          <strong data-testid="query-cache-request-count">{requestCount}</strong>
        </div>
        <div>
          <span>服务端快照版本</span>
          <strong data-testid="query-cache-server-version">{serverVersion}</strong>
        </div>
      </div>

      <div className="query-cache-sharing-observers" aria-label="查询观察组件">
        <ObserverCard label="观察组件 A" query={primaryQuery} />
        {showSecondObserver && (
          <SecondaryObserver
            queryKey={queryKey}
            queryFn={loadSharedTasks}
            enabled={queryStarted && !initialReadComplete}
          />
        )}
      </div>

      <p className="query-cache-sharing-observation" aria-live="polite">
        {queryIsFetching && '正在读取同一个 queryKey 的共享查询。'}
        {!queryIsFetching &&
          primaryQuery.isPending &&
          '尚未读取：两个观察者都在等待同一个缓存条目。'}
        {!queryIsFetching &&
          primaryQuery.isSuccess &&
          showSecondObserver &&
          '两个观察者已收到同一份缓存数据。'}
        {!queryIsFetching &&
          primaryQuery.isSuccess &&
          !showSecondObserver &&
          '观察组件 A 已读取缓存；重新显示 B 可观察后挂载读取。'}
      </p>

      <div className="query-cache-sharing-actions">
        <button
          className="query-cache-sharing-primary-button"
          type="button"
          onClick={readSharedCache}
          disabled={queryIsFetching || primaryQuery.isSuccess}
        >
          {queryIsFetching ? '读取中...' : '首次读取共享数据'}
        </button>
        <button
          className="query-cache-sharing-primary-button"
          type="button"
          onClick={refetchSharedCache}
          disabled={queryIsFetching || !primaryQuery.isSuccess}
        >
          重新获取共享数据
        </button>
        <button
          className="query-cache-sharing-secondary-button"
          type="button"
          onClick={() => setShowSecondObserver((visible) => !visible)}
          disabled={queryIsFetching || !primaryQuery.isSuccess}
        >
          {showSecondObserver ? '隐藏观察组件 B' : '显示观察组件 B'}
        </button>
        <button
          className="query-cache-sharing-secondary-button"
          type="button"
          onClick={resetObservation}
          disabled={queryIsFetching}
        >
          重置观察
        </button>
      </div>
    </section>
  )
}

/** 为每次 Demo 挂载提供独立的 QueryClient，并在卸载时清理查询缓存。 */
function QueryCacheSharingDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => {
      queryClient.clear()
    }
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <QueryCacheSharingPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册查询缓存共享 Demo。 */
export function createQueryCacheSharingDemo(): ComponentType {
  return QueryCacheSharingDemoRoot
}
