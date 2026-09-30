import {
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
  mutationOptions,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useState, type ComponentType, type ReactElement } from 'react'

import './paginated-content-management-demo.css'

type TaskItem = {
  id: string
  title: string
  owner: string
}

type TaskPage = {
  tasks: TaskItem[]
  hasMore: boolean
}

type TaskStore = {
  pageOne: TaskItem[]
  pageTwo: TaskItem[]
  pageCounts: Record<number, number>
  onPageCountChange?: (counts: Record<number, number>) => void
}

const createdTitle = '核对创建任务'

const taskStore: TaskStore = {
  pageOne: [{ id: 't-1', title: '现有任务', owner: '林晓' }],
  pageTwo: [{ id: 't-2', title: '第二页任务', owner: '周宁' }],
  pageCounts: { 1: 0, 2: 0 },
}

/** 等待固定时长，让翻页和作废后的重新获取能被看清。 */
function waitForQuery(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

/** 按页码读取任务，并统计这一页的真实请求。 */
async function loadTaskPage(page: number): Promise<TaskPage> {
  queueMicrotask(() => {
    taskStore.pageCounts = {
      ...taskStore.pageCounts,
      [page]: (taskStore.pageCounts[page] ?? 0) + 1,
    }
    taskStore.onPageCountChange?.(taskStore.pageCounts)
  })
  await waitForQuery(1400)
  const tasks = page === 1 ? taskStore.pageOne : taskStore.pageTwo
  const payload: TaskPage = {
    tasks,
    hasMore: page === 1,
  }
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload))}`
  const response = await fetch(successUrl)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskPage
}

/** 在第一页追加一条林晓的新任务。 */
async function createTask(): Promise<TaskItem> {
  await waitForQuery(1400)
  const created: TaskItem = {
    id: `t-${taskStore.pageOne.length + 1}`,
    title: createdTitle,
    owner: '林晓',
  }
  taskStore.pageOne = [...taskStore.pageOne, created]
  return created
}

/** 把页码写进 queryKey，翻页时留下上一页。 */
function taskPageOptions(page: number) {
  return queryOptions({
    queryKey: ['tasks', 'page', page] as const,
    queryFn: () => loadTaskPage(page),
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    retry: false,
  })
}

const createTaskOptions = mutationOptions({
  mutationFn: createTask,
  retry: false,
})

/** 订阅当前页任务列表。 */
function useTaskPage(page: number) {
  return useQuery(taskPageOptions(page))
}

/** 创建任务后作废任务前缀，让各页重新对齐。 */
function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...createTaskOptions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

/** 观察分页工作区：翻页留下上一页，创建后作废各页。 */
function PaginatedContentManagementPanel(): ReactElement {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageCounts, setPageCounts] = useState(taskStore.pageCounts)
  const pageQuery = useTaskPage(page)
  const createMutation = useCreateTask()
  const busy = createMutation.isPending || pageQuery.isFetching
  const pageData = pageQuery.data
  const currentTitle = pageData?.tasks[0]?.title ?? '无'
  const owner = pageData?.tasks[0]?.owner ?? '无'

  useEffect(() => {
    taskStore.onPageCountChange = setPageCounts
    return () => {
      taskStore.onPageCountChange = undefined
    }
  }, [])

  /** 在不是占位且还有下一页时前进。 */
  function goNext(): void {
    if (!pageQuery.isPlaceholderData && pageData?.hasMore) {
      setPage((current) => current + 1)
    }
  }

  /** 回到第一页。 */
  function goPrev(): void {
    setPage((current) => Math.max(current - 1, 1))
  }

  /** 通过数据 Hook 创建任务。 */
  function runCreate(): void {
    createMutation.mutate()
  }

  /** 恢复两页初始任务并重新读取。 */
  function resetDemo(): void {
    taskStore.pageOne = [{ id: 't-1', title: '现有任务', owner: '林晓' }]
    taskStore.pageTwo = [{ id: 't-2', title: '第二页任务', owner: '周宁' }]
    taskStore.pageCounts = { 1: 0, 2: 0 }
    setPageCounts({ 1: 0, 2: 0 })
    setPage(1)
    createMutation.reset()
    void queryClient.invalidateQueries()
  }

  return (
    <section className="paginated-content-demo" data-testid="paginated-content-demo">
      <header className="paginated-content-header">
        <span>TanStack Query</span>
        <h2>分页内容管理</h2>
        <p>
          页码写进
          queryKey。翻到第二页时留下上一页；创建任务后作废任务前缀，第一页出现核对创建任务。
        </p>
      </header>

      <div className="paginated-content-metrics" aria-live="polite">
        <div>
          <span>当前页</span>
          <strong data-testid="paginated-content-page">{page}</strong>
        </div>
        <div>
          <span>第一页次数</span>
          <strong data-testid="paginated-content-page-one-count">{pageCounts[1] ?? 0}</strong>
        </div>
        <div>
          <span>第二页次数</span>
          <strong data-testid="paginated-content-page-two-count">{pageCounts[2] ?? 0}</strong>
        </div>
        <div>
          <span>占位</span>
          <strong data-testid="paginated-content-placeholder">
            {pageQuery.isPlaceholderData ? '是' : '否'}
          </strong>
        </div>
        <div>
          <span>当前标题</span>
          <strong data-testid="paginated-content-title">{currentTitle}</strong>
        </div>
        <div>
          <span>负责人</span>
          <strong data-testid="paginated-content-owner">{owner}</strong>
        </div>
        <div>
          <span>mutation</span>
          <strong data-testid="paginated-content-mutation-status">{createMutation.status}</strong>
        </div>
      </div>

      <div className="paginated-content-actions">
        <button type="button" disabled={busy || page === 1} onClick={goPrev}>
          上一页
        </button>
        <button
          type="button"
          disabled={busy || pageQuery.isPlaceholderData || !pageData?.hasMore}
          onClick={goNext}
        >
          下一页
        </button>
        <button type="button" data-kind="primary" disabled={busy} onClick={runCreate}>
          创建任务
        </button>
        <button type="button" disabled={busy} onClick={resetDemo}>
          重置
        </button>
      </div>

      <div className="paginated-content-columns">
        <section className="paginated-content-card">
          <h3>当前页列表</h3>
          {pageQuery.isPending && !pageQuery.isPlaceholderData ? (
            <p className="paginated-content-message" role="status">
              正在读取任务。
            </p>
          ) : null}
          {pageQuery.isSuccess && pageData ? (
            <ul data-testid="paginated-content-list">
              {pageData.tasks.map((task) => (
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
function PaginatedContentManagementDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => {
      taskStore.pageOne = [{ id: 't-1', title: '现有任务', owner: '林晓' }]
      taskStore.pageTwo = [{ id: 't-2', title: '第二页任务', owner: '周宁' }]
      taskStore.pageCounts = { 1: 0, 2: 0 }
      taskStore.onPageCountChange = undefined
      queryClient.clear()
    }
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <PaginatedContentManagementPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册分页内容管理 Demo。 */
export function createPaginatedContentManagementDemo(): ComponentType {
  return PaginatedContentManagementDemoRoot
}
