import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  type QueryFunctionContext,
  type UseQueryResult,
} from '@tanstack/react-query'
import { useEffect, useRef, useState, type ComponentType, type ReactElement } from 'react'

import './stale-time-and-freshness-demo.css'

type PolicyId = 'zero' | 'five-seconds' | 'infinity'
type LessonQueryKey = readonly ['lesson-stale-time', number]

type FreshnessPolicy = {
  id: PolicyId
  label: string
  staleTime: number
  description: string
}

type LessonSnapshot = {
  version: number
  message: string
}

const freshnessPolicies: readonly FreshnessPolicy[] = [
  {
    id: 'zero',
    label: '0ms',
    staleTime: 0,
    description: '成功后立即进入 stale 状态',
  },
  {
    id: 'five-seconds',
    label: '5 秒',
    staleTime: 5_000,
    description: '成功后 5 秒内保持 fresh',
  },
  {
    id: 'infinity',
    label: 'Infinity',
    staleTime: Infinity,
    description: '不会因时间流逝变 stale',
  },
]

const lessonSnapshot: LessonSnapshot = {
  version: 1,
  message: '这份数据来自同一次成功查询。',
}

/** 保持延迟可观察，并在查询取消时清理计时器。 */
function waitForSnapshot(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timerId = window.setTimeout(() => {
      signal.removeEventListener('abort', cancel)
      resolve()
    }, 650)

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

/** 将时间戳格式化为学习者可读的本地时间。 */
function formatUpdatedAt(timestamp: number): string {
  if (timestamp === 0) return '尚未成功更新'
  return new Date(timestamp).toLocaleTimeString()
}

/** 将毫秒年龄格式化为稳定的秒数读数。 */
function formatAge(milliseconds: number): string {
  if (milliseconds < 1000) return `${milliseconds} ms`
  return `${(milliseconds / 1000).toFixed(1)} 秒`
}

/** 返回当前选择策略的可观察剩余窗口说明。 */
function getWindowDescription(policy: FreshnessPolicy, age: number): string {
  if (policy.staleTime === Infinity) return policy.description
  if (policy.staleTime === 0) return policy.description
  const remaining = Math.max(0, policy.staleTime - age)
  return remaining > 0 ? `距离 stale 约 ${formatAge(remaining)}` : 'fresh 窗口已结束'
}

/** 渲染当前查询的新鲜度指标和数据结果。 */
function FreshnessMetrics({
  policy,
  query,
  now,
  requestCount,
}: {
  policy: FreshnessPolicy
  query: UseQueryResult<LessonSnapshot, Error>
  now: number
  requestCount: number
}): ReactElement {
  const age = query.dataUpdatedAt === 0 ? 0 : Math.max(0, now - query.dataUpdatedAt)
  const freshnessLabel = query.isPending
    ? '等待读取'
    : query.isError
      ? '读取失败'
      : query.isStale
        ? 'stale'
        : 'fresh'
  const freshnessClassName = query.isSuccess ? (query.isStale ? 'is-stale' : 'is-fresh') : undefined
  const windowDescription = query.isSuccess
    ? getWindowDescription(policy, age)
    : '查询成功后开始计算 fresh 窗口'

  return (
    <div className="stale-time-metrics" aria-live="polite">
      <div>
        <span>当前策略</span>
        <strong>{policy.label}</strong>
      </div>
      <div>
        <span>新鲜度</span>
        <strong className={freshnessClassName}>{freshnessLabel}</strong>
      </div>
      <div>
        <span>最近更新</span>
        <strong>{formatUpdatedAt(query.dataUpdatedAt)}</strong>
      </div>
      <div>
        <span>已过去</span>
        <strong>{query.dataUpdatedAt === 0 ? '0 ms' : formatAge(age)}</strong>
      </div>
      <div>
        <span>请求次数</span>
        <strong>{requestCount}</strong>
      </div>
      <div>
        <span>数据版本</span>
        <strong>{query.data?.version ?? '—'}</strong>
      </div>
      <p className="stale-time-window">{windowDescription}</p>
    </div>
  )
}

/** 观察 staleTime 窗口、数据年龄和手动重新获取。 */
function StaleTimeAndFreshnessPanel(): ReactElement {
  const [policyId, setPolicyId] = useState<PolicyId>('five-seconds')
  const [revision, setRevision] = useState(0)
  const [started, setStarted] = useState(false)
  const [requestCount, setRequestCount] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const serverVersionRef = useRef(1)
  const policy = freshnessPolicies.find((item) => item.id === policyId) ?? freshnessPolicies[1]!
  const queryKey: LessonQueryKey = ['lesson-stale-time', revision]

  /** 请求一份带版本号的本地快照，以便观察成功更新时间。 */
  async function loadSnapshot({
    signal,
  }: QueryFunctionContext<LessonQueryKey>): Promise<LessonSnapshot> {
    setRequestCount((count) => count + 1)
    await waitForSnapshot(signal)
    return {
      version: serverVersionRef.current,
      message: lessonSnapshot.message,
    }
  }

  const query = useQuery({
    queryKey,
    queryFn: loadSnapshot,
    staleTime: policy.staleTime,
    enabled: started,
    retry: false,
  })

  useEffect(() => {
    if (query.dataUpdatedAt === 0) return
    setNow(Date.now())
    const intervalId = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(intervalId)
  }, [query.dataUpdatedAt])

  /** 切换策略并创建新的查询身份，要求学习者重新观察窗口。 */
  function selectPolicy(nextPolicyId: PolicyId): void {
    setPolicyId(nextPolicyId)
    setRevision((currentRevision) => currentRevision + 1)
    setStarted(false)
    setRequestCount(0)
    serverVersionRef.current = 1
    setNow(Date.now())
  }

  /** 启动当前策略下的第一次查询。 */
  function startQuery(): void {
    setStarted(true)
  }

  /** 让本地服务端版本递增，再手动请求同一查询。 */
  function refetchSnapshot(): void {
    serverVersionRef.current += 1
    void query.refetch()
  }

  /** 重置当前策略、请求次数和查询身份。 */
  function resetDemo(): void {
    setRevision((currentRevision) => currentRevision + 1)
    setStarted(false)
    setRequestCount(0)
    serverVersionRef.current = 1
    setNow(Date.now())
  }

  const hasData = query.isSuccess
  const isBusy = query.isFetching

  return (
    <section className="stale-time-panel" data-testid="stale-time-and-freshness-demo">
      <header className="stale-time-header">
        <span>TanStack Query</span>
        <h2>观察 staleTime 的新鲜窗口</h2>
        <p>选择策略后开始一次本地查询，观察数据从 fresh 变为 stale 的时间边界。</p>
      </header>

      <div className="stale-time-policy-picker" role="group" aria-label="选择 staleTime 策略">
        {freshnessPolicies.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === policyId}
            disabled={isBusy}
            className={item.id === policyId ? 'is-selected' : ''}
            onClick={() => selectPolicy(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <p className="stale-time-policy-description">{policy.description}</p>
      <FreshnessMetrics policy={policy} query={query} now={now} requestCount={requestCount} />

      {query.isPending && started && <p className="stale-time-message">正在读取本地快照...</p>}
      {query.isError && (
        <p className="stale-time-message" role="alert">
          读取失败：{query.error.message}
        </p>
      )}
      {hasData && (
        <div className="stale-time-result">
          <strong>版本 {query.data.version}</strong>
          <span>{query.data.message}</span>
        </div>
      )}

      <div className="stale-time-actions">
        <button type="button" onClick={startQuery} disabled={started || isBusy}>
          开始查询
        </button>
        <button type="button" onClick={refetchSnapshot} disabled={!hasData || isBusy}>
          {isBusy && hasData ? '重新获取中...' : '手动重新获取'}
        </button>
        <button type="button" onClick={resetDemo} disabled={isBusy}>
          重置观察
        </button>
      </div>
    </section>
  )
}

/** 为每次 Demo 挂载提供独立 QueryClient，并在卸载时清理缓存。 */
function StaleTimeAndFreshnessDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => queryClient.clear()
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <StaleTimeAndFreshnessPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册 staleTime 新鲜度 Demo。 */
export function createStaleTimeAndFreshnessDemo(): ComponentType {
  return StaleTimeAndFreshnessDemoRoot
}
