import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
  useQuery,
  type QueryFunctionContext,
} from '@tanstack/react-query'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type FormEvent,
  type ReactElement,
} from 'react'

import './conditional-queries-demo.css'

type LessonQueryKey = readonly ['lesson-conditional-query', string]

type SearchResult = {
  id: string
  title: string
  detail: string
}

const resultCatalog: readonly SearchResult[] = [
  { id: '1', title: 'Query Key 组织', detail: '让筛选条件成为缓存身份的一部分。' },
  { id: '2', title: '后台重新获取', detail: '已有数据可读时在后台同步新结果。' },
  { id: '3', title: '缓存生命周期', detail: '观察 inactive 查询何时被回收。' },
  { id: '4', title: '条件查询', detail: '等待用户提交有效条件后再执行读取。' },
]

/** 保持请求可观察，并在查询取消时清理延迟计时器。 */
function waitForSearch(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timerId = window.setTimeout(() => {
      signal.removeEventListener('abort', cancel)
      resolve()
    }, 650)

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

/** 根据提交的关键词返回本地模拟搜索结果。 */
async function searchCatalog({
  queryKey,
  signal,
}: QueryFunctionContext<LessonQueryKey>): Promise<SearchResult[]> {
  const keyword = queryKey[1]
  await waitForSearch(signal)
  const normalized = keyword.toLocaleLowerCase()
  if (!normalized) return [...resultCatalog]
  return resultCatalog.filter(
    (item) =>
      item.title.toLocaleLowerCase().includes(normalized) ||
      item.detail.toLocaleLowerCase().includes(normalized),
  )
}

/** 展示条件查询的执行状态、缓存和结果数据。 */
function ConditionalQueryPanel(): ReactElement {
  const [draftKeyword, setDraftKeyword] = useState('')
  const [submittedKeyword, setSubmittedKeyword] = useState('')
  const [requestCount, setRequestCount] = useState(0)
  const shouldFailNextRequestRef = useRef(false)
  const queryClient = useQueryClient()
  const queryKey = useMemo<LessonQueryKey>(
    () => ['lesson-conditional-query', submittedKeyword],
    [submittedKeyword],
  )
  const query = useQuery({
    queryKey,
    queryFn: async (context: QueryFunctionContext<LessonQueryKey>) => {
      setRequestCount((count) => count + 1)
      const results = await searchCatalog(context)
      if (shouldFailNextRequestRef.current) {
        shouldFailNextRequestRef.current = false
        throw new Error('这是一次用于观察 error 状态的模拟失败')
      }
      return results
    },
    enabled: submittedKeyword.length > 0,
    staleTime: Infinity,
    retry: false,
  })
  const cachedEntries = queryClient
    .getQueryCache()
    .findAll({ queryKey: ['lesson-conditional-query'] })
    .filter((entry) => entry.queryKey[1] !== '')
  const isWaitingForCondition = query.isPending && query.fetchStatus === 'idle'

  /** 提交去空格后的草稿条件，让查询进入新的身份。 */
  function submitKeyword(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    setSubmittedKeyword(draftKeyword.trim())
  }

  /** 清除已提交条件，但保留旧条件对应的 QueryCache 条目。 */
  function clearSubmittedKeyword(): void {
    setSubmittedKeyword('')
  }

  /** 手动重新执行当前已经启用的查询。 */
  function refetchCurrentQuery(): void {
    void query.refetch()
  }

  /** 让下一次手动请求失败，以便观察 error 状态。 */
  function simulateNextError(): void {
    shouldFailNextRequestRef.current = true
    void query.refetch()
  }

  return (
    <section className="conditional-query-panel" data-testid="conditional-queries-demo">
      <header className="conditional-query-header">
        <span>TanStack Query</span>
        <h2>提交条件后再查询</h2>
        <p>输入只更新草稿；提交有效关键词后，enabled 才允许当前 queryKey 执行。</p>
      </header>

      <form className="conditional-query-form" onSubmit={submitKeyword}>
        <label>
          <span>草稿关键词</span>
          <input
            value={draftKeyword}
            onChange={(event) => setDraftKeyword(event.target.value)}
            placeholder="例如：缓存"
          />
        </label>
        <button type="submit">提交查询</button>
        <button type="button" onClick={clearSubmittedKeyword} disabled={!submittedKeyword}>
          清除条件
        </button>
      </form>

      <div className="conditional-query-metrics" aria-live="polite">
        <div>
          <span>已提交条件</span>
          <strong>{submittedKeyword || '未提交'}</strong>
        </div>
        <div>
          <span>status</span>
          <strong>{query.status}</strong>
        </div>
        <div>
          <span>fetchStatus</span>
          <strong>{query.fetchStatus}</strong>
        </div>
        <div>
          <span>isLoading</span>
          <strong>{String(query.isLoading)}</strong>
        </div>
        <div>
          <span>isEnabled</span>
          <strong>{String(query.isEnabled)}</strong>
        </div>
        <div>
          <span>请求次数</span>
          <strong>{requestCount}</strong>
        </div>
      </div>

      {isWaitingForCondition && (
        <p className="conditional-query-message" role="status">
          尚未启用查询：请提交非空关键词。
        </p>
      )}
      {query.isLoading && (
        <p className="conditional-query-message" role="status">
          首次查询正在执行，输入草稿不会改变这次请求。
        </p>
      )}
      {query.isError && (
        <p className="conditional-query-message" role="alert">
          查询失败：{query.error.message}
        </p>
      )}
      {query.isSuccess && (
        <div className="conditional-query-results">
          <div className="conditional-query-result-heading">
            <strong>结果 {query.data.length} 条</strong>
            <span>{query.isFetching ? '正在重新读取' : '当前结果来自查询'}</span>
          </div>
          {query.data.length ? (
            <ul>
              {query.data.map((item) => (
                <li key={item.id}>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>没有匹配结果，但查询已经成功完成。</p>
          )}
        </div>
      )}

      <div className="conditional-query-cache">
        <div>
          <span>已保留的非空条件缓存</span>
          <strong>{cachedEntries.length} 条</strong>
        </div>
        <p>
          清除条件后，当前观察者回到 pending/idle；旧条件仍由 QueryCache
          保留，重新提交相同条件可复用它。
        </p>
      </div>

      <div className="conditional-query-actions">
        <button type="button" onClick={refetchCurrentQuery} disabled={query.isFetching}>
          {query.isEnabled ? '手动 refetch 当前条件' : '手动 refetch（即使未启用）'}
        </button>
        <button type="button" onClick={simulateNextError} disabled={query.isFetching}>
          模拟下一次请求失败
        </button>
      </div>
    </section>
  )
}

/** 为课程页面提供独立 QueryClient，并在卸载时清空本地缓存。 */
function ConditionalQueriesDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => queryClient.clear()
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <ConditionalQueryPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册条件查询 Demo。 */
export function createConditionalQueriesDemo(): ComponentType {
  return ConditionalQueriesDemoRoot
}
