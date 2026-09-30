import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  type QueryFunctionContext,
} from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactElement } from 'react'

import './cache-lifecycle-and-gctime-demo.css'

type CachePolicyId = 'short' | 'default' | 'infinity'
type LessonQueryKey = readonly ['lesson-gc-time', CachePolicyId, number]

type CachePolicy = {
  id: CachePolicyId
  label: string
  gcTime: number
  description: string
}

type LessonSnapshot = {
  version: number
  message: string
}

const cachePolicies: readonly CachePolicy[] = [
  {
    id: 'short',
    label: '3 秒（便于观察）',
    gcTime: 3_000,
    description: '观察者卸载后约 3 秒回收 inactive 缓存。',
  },
  {
    id: 'default',
    label: '5 分钟（客户端默认）',
    gcTime: 5 * 60 * 1000,
    description: '普通客户端查询的默认 inactive 保留时间。',
  },
  {
    id: 'infinity',
    label: 'Infinity',
    gcTime: Infinity,
    description: '不因 inactive 自动回收，需要明确的清理策略。',
  },
]

/** 保持延迟可观察，并在查询取消时清理计时器。 */
function waitForSnapshot(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timerId = window.setTimeout(() => {
      signal.removeEventListener('abort', cancel)
      resolve()
    }, 550)

    /** 取消本地延迟查询并报告 AbortError。 */
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

/** 将剩余毫秒数格式化为观察器中的倒计时文字。 */
function formatRemaining(milliseconds: number): string {
  if (milliseconds <= 0) return '即将回收'
  return `${(milliseconds / 1000).toFixed(1)} 秒后检查回收`
}

/** 挂载一个真实查询观察者，并展示缓存复用和请求状态。 */
function LifecycleObserver({
  queryKey,
  gcTime,
  serverVersionRef,
  onRequest,
  onHide,
  onServerUpdate,
}: {
  queryKey: LessonQueryKey
  gcTime: number
  serverVersionRef: { current: number }
  onRequest: () => void
  onHide: () => void
  onServerUpdate: () => void
}): ReactElement {
  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }: QueryFunctionContext<LessonQueryKey>): Promise<LessonSnapshot> => {
      await waitForSnapshot(signal)
      onRequest()
      return {
        version: serverVersionRef.current,
        message: '观察者卸载后，这份成功数据仍可暂存在 QueryCache。',
      }
    },
    staleTime: Infinity,
    gcTime,
    retry: false,
  })

  /** 修改本地服务端版本并立即重新读取当前查询。 */
  function refreshSnapshot(): void {
    onServerUpdate()
    void query.refetch()
  }

  if (query.isPending) {
    return (
      <div className="gc-lifecycle-observer gc-lifecycle-observer-loading">
        <p role="status">正在读取快照...</p>
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="gc-lifecycle-observer" role="alert">
        <p>读取失败：{query.error.message}</p>
        <button type="button" onClick={() => void query.refetch()}>
          重试读取
        </button>
      </div>
    )
  }

  return (
    <div className="gc-lifecycle-observer">
      <div className="gc-lifecycle-data">
        <span>当前数据版本</span>
        <strong>{query.data.version}</strong>
        <p>{query.data.message}</p>
      </div>
      <div className="gc-lifecycle-query-state" aria-live="polite">
        <span>{query.isFetching ? '请求进行中' : '请求空闲'}</span>
        <span>{query.isStale ? 'stale' : 'fresh'}</span>
      </div>
      <div className="gc-lifecycle-actions">
        <button type="button" onClick={refreshSnapshot} disabled={query.isFetching}>
          {query.isFetching ? '读取中...' : '更新服务端版本'}
        </button>
        <button type="button" onClick={onHide}>
          隐藏观察者
        </button>
      </div>
    </div>
  )
}

/** 观察 QueryCache 条目从 active、inactive 到垃圾回收的变化。 */
function CacheLifecyclePanel(): ReactElement {
  const [policyId, setPolicyId] = useState<CachePolicyId>('short')
  const [revision, setRevision] = useState(0)
  const [observerMounted, setObserverMounted] = useState(true)
  const [inactiveSince, setInactiveSince] = useState<number | null>(null)
  const [requestCount, setRequestCount] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const serverVersionRef = useRef(1)
  const previousQueryKeyRef = useRef<LessonQueryKey | null>(null)
  const [queryClient] = useState(() => new QueryClient())
  const policy = cachePolicies.find((item) => item.id === policyId) ?? cachePolicies[0]!
  const queryKey = useMemo<LessonQueryKey>(
    () => ['lesson-gc-time', policy.id, revision],
    [policy.id, revision],
  )

  useEffect(() => {
    return () => queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    const previousQueryKey = previousQueryKeyRef.current
    if (previousQueryKey && previousQueryKey !== queryKey) {
      queryClient.removeQueries({ queryKey: previousQueryKey, exact: true })
    }
    previousQueryKeyRef.current = queryKey
  }, [queryClient, queryKey])

  useEffect(() => {
    if (observerMounted || inactiveSince === null || policy.gcTime === Infinity) return
    const intervalDelay = Math.min(5_000, Math.max(100, policy.gcTime / 30))
    const intervalId = window.setInterval(() => setNow(Date.now()), intervalDelay)
    const stopTimerId = window.setTimeout(() => {
      window.clearInterval(intervalId)
      setNow(Date.now())
    }, policy.gcTime + 250)
    return () => {
      window.clearInterval(intervalId)
      window.clearTimeout(stopTimerId)
    }
  }, [inactiveSince, observerMounted, policy.gcTime])

  const cacheEntry = queryClient.getQueryCache().find({ queryKey })
  const cachedData = queryClient.getQueryData<LessonSnapshot>(queryKey)
  const remaining =
    inactiveSince === null || policy.gcTime === Infinity
      ? null
      : Math.max(0, policy.gcTime - (now - inactiveSince))
  const cacheState = cacheEntry
    ? observerMounted
      ? 'active：观察者正在使用缓存'
      : 'inactive：等待 gcTime 回收'
    : observerMounted
      ? '正在创建查询与缓存条目'
      : '缓存条目已回收'

  /** 记录一次真实 queryFn 执行，供学习者观察请求次数。 */
  function recordRequest(): void {
    setRequestCount((count) => count + 1)
  }

  /** 隐藏查询观察者并开始 inactive 保留倒计时。 */
  function hideObserver(): void {
    setObserverMounted(false)
    setInactiveSince(Date.now())
    setNow(Date.now())
  }

  /** 在缓存仍存在时重新挂载查询观察者。 */
  function mountObserver(): void {
    setObserverMounted(true)
    setInactiveSince(null)
    setNow(Date.now())
  }

  /** 更新本地模拟服务端版本，供重新读取动作观察缓存数据变化。 */
  function updateServerVersion(): void {
    serverVersionRef.current += 1
  }

  /** 切换缓存策略并为新策略建立独立的查询身份。 */
  function selectPolicy(nextPolicyId: CachePolicyId): void {
    setPolicyId(nextPolicyId)
    setRevision((currentRevision) => currentRevision + 1)
    setObserverMounted(true)
    setInactiveSince(null)
    setRequestCount(0)
    serverVersionRef.current = 1
    setNow(Date.now())
  }

  return (
    <QueryClientProvider client={queryClient}>
      <section className="gc-lifecycle-panel" data-testid="cache-lifecycle-and-gctime-demo">
        <header className="gc-lifecycle-header">
          <span>TanStack Query</span>
          <h2>观察 inactive 缓存的生命周期</h2>
          <p>先让查询成功，再隐藏观察者，观察 gcTime 如何决定缓存何时被移除。</p>
        </header>

        <div className="gc-lifecycle-policy-picker" role="group" aria-label="选择 gcTime 策略">
          {cachePolicies.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.id === policyId}
              className={item.id === policyId ? 'is-selected' : ''}
              onClick={() => selectPolicy(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <p className="gc-lifecycle-policy-description">{policy.description}</p>

        <div className="gc-lifecycle-metrics" aria-live="polite">
          <div>
            <span>缓存状态</span>
            <strong>{cacheState}</strong>
          </div>
          <div>
            <span>缓存条目</span>
            <strong>{cacheEntry ? '存在' : '不存在'}</strong>
          </div>
          <div>
            <span>数据版本</span>
            <strong>{cachedData?.version ?? '—'}</strong>
          </div>
          <div>
            <span>请求次数</span>
            <strong>{requestCount}</strong>
          </div>
        </div>

        <p className="gc-lifecycle-countdown">
          {observerMounted
            ? '观察者已挂载，gcTime 尚未开始计时。'
            : remaining === null
              ? cacheEntry
                ? 'Infinity 不会自动回收，除非显式清理缓存。'
                : '当前条目已经回收。'
              : cacheEntry
                ? formatRemaining(remaining)
                : '当前条目已经回收。'}
        </p>

        {observerMounted ? (
          <LifecycleObserver
            key={queryKey.join(':')}
            queryKey={queryKey}
            gcTime={policy.gcTime}
            serverVersionRef={serverVersionRef}
            onRequest={recordRequest}
            onHide={hideObserver}
            onServerUpdate={updateServerVersion}
          />
        ) : (
          <div className="gc-lifecycle-inactive-panel">
            <p>观察者已卸载，页面不再读取这条查询。</p>
            <button type="button" onClick={mountObserver}>
              重新挂载观察者
            </button>
          </div>
        )}
      </section>
    </QueryClientProvider>
  )
}

/** 为课程页面注册缓存生命周期 Demo。 */
export function createCacheLifecycleAndGcTimeDemo(): ComponentType {
  return CacheLifecyclePanel
}
