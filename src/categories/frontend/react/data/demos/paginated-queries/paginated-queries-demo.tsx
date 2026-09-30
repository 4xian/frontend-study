import {
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactElement,
} from 'react'

import './paginated-queries-demo.css'

type LessonTask = {
  id: string
  title: string
  owner: string
}

type TaskPage = {
  tasks: LessonTask[]
  hasMore: boolean
}

type PageQueryKey = readonly ['tasks', 'page', number, number]

const pageOne: TaskPage = {
  tasks: [
    { id: 't-801', title: '核对第一页标题', owner: '林晓' },
    { id: 't-802', title: '核对分页缓存', owner: '林晓' },
  ],
  hasMore: true,
}

const pageTwo: TaskPage = {
  tasks: [
    { id: 't-803', title: '核对第二页标题', owner: '周宁' },
    { id: 't-804', title: '核对翻页占位', owner: '周宁' },
  ],
  hasMore: false,
}

const pageOneUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(pageOne))}`
const pageTwoUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(pageTwo))}`

/** 等待固定时长，让翻页时上一页是否留下能被看清。 */
function waitForPage(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

/** 按页码读取任务列表，并带上是否还有下一页。 */
async function loadTaskPage(page: number): Promise<TaskPage> {
  await waitForPage(1400)
  const url = page === 1 ? pageOneUrl : pageTwoUrl
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`任务请求失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskPage
}

/** 把页码、请求和是否留下上一页收进同一份配置。 */
function pageOptions(
  queryKey: PageQueryKey,
  queryFn: () => Promise<TaskPage>,
  keepPrevious: boolean,
) {
  return queryOptions({
    queryKey,
    queryFn,
    retry: false,
    placeholderData: keepPrevious ? keepPreviousData : undefined,
  })
}

/** 观察把页码放进 queryKey 后，留下上一页和直接空白两种翻页。 */
function PaginatedQueriesPanel(): ReactElement {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [keepPrevious, setKeepPrevious] = useState(true)
  const [revision, setRevision] = useState(0)
  const [requestCount, setRequestCount] = useState(0)
  const queryKey = useMemo((): PageQueryKey => ['tasks', 'page', revision, page], [revision, page])

  /** 统计每次真实请求，避免在渲染期间同步更新次数。 */
  const loadObservedPage = useCallback(async () => {
    queueMicrotask(() => {
      setRequestCount((count) => count + 1)
    })
    return loadTaskPage(page)
  }, [page])

  const pageQuery = useQuery(pageOptions(queryKey, loadObservedPage, keepPrevious))
  const cacheHasData = queryClient.getQueryData<TaskPage>(queryKey) !== undefined
  const pageData = pageQuery.data
  const canGoNext = !pageQuery.isPlaceholderData && pageData?.hasMore === true

  /** 切到上一页；第一页时按钮会禁用。 */
  function goPrevious(): void {
    setPage((current) => Math.max(current - 1, 1))
  }

  /** 只有当前页已经是真实数据、并且还有下一页时才前进。 */
  function goNext(): void {
    if (!canGoNext) {
      return
    }
    setPage((current) => current + 1)
  }

  /** 换一种翻页方式时清掉缓存，从第一页重新观察。 */
  function selectKeepPrevious(nextKeepPrevious: boolean): void {
    setKeepPrevious(nextKeepPrevious)
    setPage(1)
    setRequestCount(0)
    setRevision((current) => current + 1)
    queryClient.clear()
  }

  /** 换一份查询身份，清掉当前缓存记录，保留这次是否留下上一页。 */
  function resetQuery(): void {
    setPage(1)
    setRequestCount(0)
    setRevision((current) => current + 1)
    queryClient.clear()
  }

  return (
    <section className="paginated-queries-demo" data-testid="paginated-queries-demo">
      <header className="paginated-queries-header">
        <span>TanStack Query</span>
        <h2>分页查询</h2>
        <p>
          页码写进
          queryKey。默认留下上一页，翻到周宁那一页时先看到林晓。改成不留上一页后，翻页会先回到
          pending。
        </p>
      </header>

      <div className="paginated-queries-metrics" aria-live="polite">
        <div>
          <span>当前页</span>
          <strong data-testid="paginated-queries-page">{page}</strong>
        </div>
        <div>
          <span>请求次数</span>
          <strong data-testid="paginated-queries-count">{requestCount}</strong>
        </div>
        <div>
          <span>status</span>
          <strong data-testid="paginated-queries-status">{pageQuery.status}</strong>
        </div>
        <div>
          <span>isPending</span>
          <strong data-testid="paginated-queries-pending">{String(pageQuery.isPending)}</strong>
        </div>
        <div>
          <span>isPlaceholderData</span>
          <strong data-testid="paginated-queries-is-placeholder">
            {String(pageQuery.isPlaceholderData)}
          </strong>
        </div>
        <div>
          <span>isFetching</span>
          <strong data-testid="paginated-queries-fetching">{String(pageQuery.isFetching)}</strong>
        </div>
        <div>
          <span>缓存 data</span>
          <strong data-testid="paginated-queries-cache-data">{cacheHasData ? '有' : '无'}</strong>
        </div>
        <div>
          <span>hasMore</span>
          <strong data-testid="paginated-queries-has-more">
            {String(pageData?.hasMore ?? false)}
          </strong>
        </div>
      </div>

      <div className="paginated-queries-actions">
        <button
          type="button"
          aria-pressed={keepPrevious}
          disabled={pageQuery.isFetching}
          onClick={() => selectKeepPrevious(true)}
        >
          留下上一页
        </button>
        <button
          type="button"
          aria-pressed={!keepPrevious}
          disabled={pageQuery.isFetching}
          onClick={() => selectKeepPrevious(false)}
        >
          不留上一页
        </button>
        <button type="button" disabled={pageQuery.isFetching || page === 1} onClick={goPrevious}>
          上一页
        </button>
        <button type="button" data-kind="primary" disabled={!canGoNext} onClick={goNext}>
          下一页
        </button>
        <button type="button" disabled={pageQuery.isFetching} onClick={resetQuery}>
          重置
        </button>
      </div>

      <div className="paginated-queries-columns">
        <section className="paginated-queries-card">
          <h3>当前观察</h3>
          {pageQuery.isPending && (
            <p className="paginated-queries-message" role="status">
              这一页还没有成功数据，所以是 pending。第一页总会这样；不留上一页时翻页也会这样。
            </p>
          )}
          {pageQuery.isPlaceholderData && (
            <p className="paginated-queries-message" role="status">
              queryKey 已经换成第 {page} 页，观察者仍显示上一页。下一页按钮会先停住，避免连跳。
            </p>
          )}
          {pageQuery.isSuccess &&
            !pageQuery.isFetching &&
            !pageQuery.isPlaceholderData &&
            page === 1 && (
              <p className="paginated-queries-message" role="status">
                第一页是林晓的真实数据。点下一页可以对照留下上一页和直接空白。
              </p>
            )}
          {pageQuery.isSuccess &&
            !pageQuery.isFetching &&
            !pageQuery.isPlaceholderData &&
            page === 2 && (
              <p className="paginated-queries-message" role="status">
                第二页是周宁的真实数据。没有下一页了，hasMore 为 false。
              </p>
            )}
        </section>
        <section className="paginated-queries-card" data-testid="paginated-queries-tasks">
          <h3>这一页的任务</h3>
          {pageQuery.isPending && (
            <p className="paginated-queries-message" role="status">
              还没有可显示的任务。
            </p>
          )}
          {pageQuery.isSuccess && (
            <ul data-testid="paginated-queries-task-list">
              {pageData?.tasks.map((task) => (
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
function PaginatedQueriesDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => queryClient.clear()
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <PaginatedQueriesPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册分页查询 Demo。 */
export function createPaginatedQueriesDemo(): ComponentType {
  return PaginatedQueriesDemoRoot
}
