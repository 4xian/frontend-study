import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
  useQuery,
  type QueryFunctionContext,
  type UseQueryResult,
} from '@tanstack/react-query'
import { useEffect, useRef, useState, type ComponentType, type ReactElement } from 'react'

import './background-refetching-demo.css'

type LessonQueryKey = readonly ['lesson-background-refetch', number]

type LessonSnapshot = {
  version: number
  label: string
}

type TriggerKind = 'window' | 'reconnect' | 'mount'

const triggerLabels: Record<TriggerKind, string> = {
  window: '窗口重新可见',
  reconnect: '网络恢复',
  mount: '观察组件重新挂载',
}

/** 保持本地请求可观察，并在查询取消时清理计时器。 */
function waitForSnapshot(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timerId = window.setTimeout(() => {
      signal.removeEventListener('abort', cancel)
      resolve()
    }, 700)

    /** 取消本地延迟请求并报告 AbortError。 */
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

/** 格式化查询最近一次成功更新的本地时间。 */
function formatUpdatedAt(timestamp: number): string {
  return timestamp === 0 ? '尚未成功更新' : new Date(timestamp).toLocaleTimeString()
}

/** 渲染一个观察组件看到的查询状态，便于比较重新挂载前后的数据。 */
function ObserverCard({
  label,
  query,
}: {
  label: string
  query: UseQueryResult<LessonSnapshot, Error>
}): ReactElement {
  const hasData = query.data !== undefined

  return (
    <article className="background-refetch-observer">
      <span>{label}</span>
      <strong>{query.status}</strong>
      <small>
        {query.isFetching ? 'queryFn 执行中' : hasData ? '正在观察缓存数据' : '等待查询启动'}
      </small>
      {hasData && <small>数据版本：{query.data.version}</small>}
    </article>
  )
}

/** 渲染可切换的第二个观察者，验证 refetchOnMount 的触发时机。 */
function BackgroundRefetchMirror({
  queryKey,
  queryFn,
  enabled,
  refetchOnMount,
  refetchOnWindowFocus,
  refetchOnReconnect,
}: {
  queryKey: LessonQueryKey
  queryFn: (context: QueryFunctionContext<LessonQueryKey>) => Promise<LessonSnapshot>
  enabled: boolean
  refetchOnMount: boolean | 'always'
  refetchOnWindowFocus: boolean | 'always'
  refetchOnReconnect: boolean | 'always'
}): ReactElement {
  const query = useQuery({
    queryKey,
    queryFn,
    enabled,
    refetchOnMount,
    refetchOnWindowFocus,
    refetchOnReconnect,
    retry: false,
  })

  return <ObserverCard label="观察组件 B" query={query} />
}

/** 观察窗口、网络和挂载触发器在后台重新获取中的共同状态。 */
function BackgroundRefetchPanel(): ReactElement {
  const [revision, setRevision] = useState(0)
  const [started, setStarted] = useState(false)
  const [showMirror, setShowMirror] = useState(false)
  const [requestCount, setRequestCount] = useState(0)
  const [windowFocusEnabled, setWindowFocusEnabled] = useState(true)
  const [reconnectEnabled, setReconnectEnabled] = useState(true)
  const [mountEnabled, setMountEnabled] = useState(true)
  const [lastTrigger, setLastTrigger] = useState<TriggerKind | undefined>()
  const serverVersionRef = useRef(1)
  const queryKey: LessonQueryKey = ['lesson-background-refetch', revision]

  /** 返回递增版本的本地服务端快照，让后台更新结果可区分。 */
  async function loadSnapshot({
    signal,
  }: QueryFunctionContext<LessonQueryKey>): Promise<LessonSnapshot> {
    setRequestCount((count) => count + 1)
    await waitForSnapshot(signal)
    return {
      version: serverVersionRef.current,
      label: '旧数据在后台请求期间仍然可读。',
    }
  }

  const query = useQuery({
    queryKey,
    queryFn: loadSnapshot,
    enabled: started,
    staleTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: windowFocusEnabled,
    refetchOnReconnect: reconnectEnabled,
    retry: false,
  })

  /** 让查询进入 stale 后模拟窗口从隐藏回到可见。 */
  function triggerWindowFocus(): void {
    setLastTrigger('window')
    serverVersionRef.current += 1
    focusManager.setFocused(false)
    focusManager.setFocused(true)
  }

  /** 让查询进入 stale 后模拟浏览器恢复联网。 */
  function triggerReconnect(): void {
    setLastTrigger('reconnect')
    serverVersionRef.current += 1
    onlineManager.setOnline(false)
    onlineManager.setOnline(true)
  }

  /** 切换第二个观察者，以便在重新挂载时检查 refetchOnMount。 */
  function toggleMirror(): void {
    if (showMirror) {
      setShowMirror(false)
      return
    }
    setLastTrigger('mount')
    serverVersionRef.current += 1
    setShowMirror(true)
  }

  /** 启动当前查询的首次读取。 */
  function startQuery(): void {
    setStarted(true)
  }

  /** 创建新的查询身份并恢复 Demo 的观察起点。 */
  function resetDemo(): void {
    setRevision((currentRevision) => currentRevision + 1)
    setStarted(false)
    setShowMirror(false)
    setRequestCount(0)
    setLastTrigger(undefined)
    serverVersionRef.current = 1
  }

  const hasData = query.data !== undefined
  const hasBackgroundFetch = query.isRefetching
  const canTrigger = query.isSuccess && !query.isFetching
  const queryStatus = query.isPending && started ? '首次查询中' : query.status

  return (
    <section className="background-refetch-panel" data-testid="background-refetching-demo">
      <header className="background-refetch-header">
        <span>TanStack Query</span>
        <h2>后台重新获取观察器</h2>
        <p>同一份快照响应生命周期事件，观察旧数据与后台请求同时存在。</p>
      </header>

      <div className="background-refetch-settings" role="group" aria-label="自动重新获取策略">
        <label>
          <input
            type="checkbox"
            checked={windowFocusEnabled}
            onChange={(event) => setWindowFocusEnabled(event.target.checked)}
          />
          <span>窗口重新可见</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={reconnectEnabled}
            onChange={(event) => setReconnectEnabled(event.target.checked)}
          />
          <span>网络恢复</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={mountEnabled}
            onChange={(event) => setMountEnabled(event.target.checked)}
          />
          <span>重新挂载</span>
        </label>
      </div>

      <div className="background-refetch-metrics" aria-live="polite">
        <div>
          <span>查询状态</span>
          <strong>{queryStatus}</strong>
        </div>
        <div>
          <span>fetchStatus</span>
          <strong>{query.fetchStatus}</strong>
        </div>
        <div>
          <span>isFetching</span>
          <strong>{String(query.isFetching)}</strong>
        </div>
        <div>
          <span>isRefetching</span>
          <strong>{String(query.isRefetching)}</strong>
        </div>
        <div>
          <span>请求次数</span>
          <strong>{requestCount}</strong>
        </div>
        <div>
          <span>最近更新</span>
          <strong>{formatUpdatedAt(query.dataUpdatedAt)}</strong>
        </div>
      </div>

      <div className="background-refetch-observers" aria-label="查询观察组件">
        <ObserverCard label="观察组件 A" query={query} />
        {showMirror && (
          <BackgroundRefetchMirror
            queryKey={queryKey}
            queryFn={loadSnapshot}
            enabled={started}
            refetchOnMount={mountEnabled}
            refetchOnWindowFocus={windowFocusEnabled}
            refetchOnReconnect={reconnectEnabled}
          />
        )}
      </div>

      {query.isPending && started && (
        <p className="background-refetch-message">正在首次读取快照...</p>
      )}
      {hasBackgroundFetch && (
        <p className="background-refetch-message" role="status">
          {lastTrigger
            ? `${triggerLabels[lastTrigger]}触发后台重新获取，旧数据仍然保留。`
            : '后台重新获取中，旧数据仍然保留。'}
        </p>
      )}
      {query.isError && !hasData && (
        <p className="background-refetch-message" role="alert">
          首次读取失败：{query.error.message}
        </p>
      )}
      {query.isError && hasData && (
        <p className="background-refetch-message" role="alert">
          后台更新失败，继续显示上一次成功数据：{query.error.message}
        </p>
      )}
      {hasData && (
        <div className="background-refetch-result">
          <strong>数据版本 {query.data.version}</strong>
          <span>{query.data.label}</span>
        </div>
      )}

      <div className="background-refetch-actions">
        <button type="button" onClick={startQuery} disabled={started || query.isFetching}>
          {query.isFetching ? '读取中...' : '首次读取快照'}
        </button>
        <button
          type="button"
          onClick={triggerWindowFocus}
          disabled={!canTrigger || !windowFocusEnabled}
        >
          模拟窗口重新可见
        </button>
        <button
          type="button"
          onClick={triggerReconnect}
          disabled={!canTrigger || !reconnectEnabled}
        >
          模拟网络恢复
        </button>
        <button
          type="button"
          onClick={toggleMirror}
          disabled={!query.isSuccess || query.isFetching}
        >
          {showMirror ? '卸载观察组件 B' : '挂载观察组件 B'}
        </button>
        <button type="button" onClick={resetDemo} disabled={query.isFetching}>
          重置观察
        </button>
      </div>
    </section>
  )
}

/** 为每次 Demo 挂载提供独立客户端，并恢复全局焦点和在线状态。 */
function BackgroundRefetchDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => {
      queryClient.clear()
      focusManager.setFocused(undefined)
      onlineManager.setOnline(true)
    }
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <BackgroundRefetchPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册后台重新获取 Demo。 */
export function createBackgroundRefetchingDemo(): ComponentType {
  return BackgroundRefetchDemoRoot
}
