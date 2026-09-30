import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useState, type ComponentType, type ReactElement } from 'react'

import './infinite-queries-demo.css'

type TaskItem = {
  id: string
  title: string
  owner: string
}

type TaskPage = {
  tasks: TaskItem[]
  nextCursor?: number
}

type TaskStore = {
  fetchCount: number
  onFetchCountChange?: (count: number) => void
}

const taskStore: TaskStore = {
  fetchCount: 0,
}

const pagesByCursor: Record<number, TaskPage> = {
  0: {
    tasks: [{ id: 't-1', title: '现有任务', owner: '林晓' }],
    nextCursor: 1,
  },
  1: {
    tasks: [{ id: 't-2', title: '第二页任务', owner: '周宁' }],
  },
}

/** 等待固定时长，让首页和加载更多能被看清。 */
function waitForQuery(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

/** 按游标读取一页任务，并统计真实请求。 */
async function loadTaskPage(pageParam: number): Promise<TaskPage> {
  queueMicrotask(() => {
    taskStore.fetchCount += 1
    taskStore.onFetchCountChange?.(taskStore.fetchCount)
  })
  await waitForQuery(1400)
  const payload = pagesByCursor[pageParam] ?? { tasks: [] }
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload))}`
  const response = await fetch(successUrl)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskPage
}

/** 观察无限查询：首页自动请求，加载更多把新页追加进同一条缓存。 */
function InfiniteQueriesPanel(): ReactElement {
  const queryClient = useQueryClient()
  const [fetchCount, setFetchCount] = useState(taskStore.fetchCount)
  const taskQuery = useInfiniteQuery({
    queryKey: ['tasks'],
    queryFn: ({ pageParam }) => loadTaskPage(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: Infinity,
    retry: false,
  })
  const pages = taskQuery.data?.pages ?? []
  const tasks = pages.flatMap((page) => page.tasks)
  const firstTask = tasks[0]
  const lastTask = tasks[tasks.length - 1]
  const busy = taskQuery.isFetching

  useEffect(() => {
    taskStore.onFetchCountChange = setFetchCount
    return () => {
      taskStore.onFetchCountChange = undefined
    }
  }, [])

  /** 在还有下一页且当前没有进行中的请求时追加一页。 */
  function loadMore(): void {
    if (taskQuery.hasNextPage && !taskQuery.isFetching) {
      void taskQuery.fetchNextPage()
    }
  }

  /** 恢复首页并重新读取。 */
  function resetDemo(): void {
    taskStore.fetchCount = 0
    setFetchCount(0)
    void queryClient.resetQueries({ queryKey: ['tasks'] })
  }

  return (
    <section className="infinite-queries-demo" data-testid="infinite-queries-demo">
      <header className="infinite-queries-header">
        <span>TanStack Query</span>
        <h2>无限查询</h2>
        <p>
          首页用 initialPageParam 请求。加载更多走 fetchNextPage，新页追加进同一条缓存，不另开
          queryKey。
        </p>
      </header>

      <div className="infinite-queries-metrics" aria-live="polite">
        <div>
          <span>请求次数</span>
          <strong data-testid="infinite-queries-fetch-count">{fetchCount}</strong>
        </div>
        <div>
          <span>页数</span>
          <strong data-testid="infinite-queries-page-count">{pages.length}</strong>
        </div>
        <div>
          <span>还有下一页</span>
          <strong data-testid="infinite-queries-has-next">
            {taskQuery.hasNextPage ? '是' : '否'}
          </strong>
        </div>
        <div>
          <span>加载更多中</span>
          <strong data-testid="infinite-queries-fetching-next">
            {taskQuery.isFetchingNextPage ? '是' : '否'}
          </strong>
        </div>
        <div>
          <span>首条标题</span>
          <strong data-testid="infinite-queries-first-title">
            {firstTask ? firstTask.title : '无'}
          </strong>
        </div>
        <div>
          <span>末条标题</span>
          <strong data-testid="infinite-queries-last-title">
            {lastTask ? lastTask.title : '无'}
          </strong>
        </div>
        <div>
          <span>负责人</span>
          <strong data-testid="infinite-queries-owner">{firstTask ? firstTask.owner : '无'}</strong>
        </div>
      </div>

      <div className="infinite-queries-actions">
        <button
          type="button"
          data-kind="primary"
          disabled={!taskQuery.hasNextPage || busy}
          onClick={loadMore}
        >
          加载更多
        </button>
        <button type="button" disabled={busy} onClick={resetDemo}>
          重置
        </button>
      </div>

      <div className="infinite-queries-columns">
        <section className="infinite-queries-card">
          <h3>累计列表</h3>
          {taskQuery.isPending ? (
            <p className="infinite-queries-message" role="status">
              正在读取任务。
            </p>
          ) : null}
          {taskQuery.isSuccess ? (
            <ul data-testid="infinite-queries-list">
              {tasks.map((task) => (
                <li key={task.id}>
                  {task.title} / {task.owner}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </section>
  )
}

/** 为 Demo 提供独立 QueryClient，并在离开页面时清空本地缓存。 */
function InfiniteQueriesDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => {
      taskStore.fetchCount = 0
      taskStore.onFetchCountChange = undefined
      queryClient.clear()
    }
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <InfiniteQueriesPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册无限查询 Demo。 */
export function createInfiniteQueriesDemo(): ComponentType {
  return InfiniteQueriesDemoRoot
}
