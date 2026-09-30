import {
  QueryClient,
  QueryClientProvider,
  mutationOptions,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useState, type ComponentType, type ReactElement } from 'react'

import './data-hooks-and-module-organization-demo.css'

type TaskItem = {
  id: string
  title: string
  owner: string
}

type TaskStore = {
  task: TaskItem
  listCount: number
  onListCountChange?: (count: number) => void
}

const editedTitle = '核对创建任务'

const taskStore: TaskStore = {
  task: { id: 't-1', title: '现有任务', owner: '林晓' },
  listCount: 0,
}

/** 等待固定时长，让读取和写入能被看清。 */
function waitForQuery(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

/** 把当前任务读成列表 JSON，失败时抛出带状态码的 Error。 */
async function loadTasks(): Promise<TaskItem[]> {
  queueMicrotask(() => {
    taskStore.listCount += 1
    taskStore.onListCountChange?.(taskStore.listCount)
  })
  await waitForQuery(1400)
  const successUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify([taskStore.task]))}`
  const response = await fetch(successUrl)
  if (!response.ok) {
    throw new Error(`读取失败：HTTP ${response.status}`)
  }
  return (await response.json()) as TaskItem[]
}

/** 保存任务标题，失败时抛出带状态码的 Error。 */
async function editTask(): Promise<TaskItem> {
  await waitForQuery(1400)
  const updated: TaskItem = {
    ...taskStore.task,
    title: editedTitle,
  }
  taskStore.task = updated
  return updated
}

const taskListOptions = queryOptions({
  queryKey: ['tasks'] as const,
  queryFn: loadTasks,
  staleTime: Infinity,
  retry: false,
})

const editTaskOptions = mutationOptions({
  mutationFn: editTask,
  retry: false,
})

/** 用共用 queryOptions 订阅任务列表。 */
function useTaskList() {
  return useQuery(taskListOptions)
}

/** 用共用 mutationOptions 保存，并按 queryOptions 的 queryKey 写回列表。 */
function useEditTask() {
  const queryClient = useQueryClient()
  return useMutation({
    ...editTaskOptions,
    onSuccess: (data) => {
      queryClient.setQueryData(taskListOptions.queryKey, [data])
    },
  })
}

/** 观察同一份任务配置被两个自定义 Hook 共用，写入后两边一起更新。 */
function DataHooksAndModuleOrganizationPanel(): ReactElement {
  const queryClient = useQueryClient()
  const [listCount, setListCount] = useState(taskStore.listCount)
  const boardQuery = useTaskList()
  const sidebarQuery = useTaskList()
  const editMutation = useEditTask()
  const busy = editMutation.isPending || boardQuery.isFetching || sidebarQuery.isFetching

  useEffect(() => {
    taskStore.onListCountChange = setListCount
    return () => {
      taskStore.onListCountChange = undefined
    }
  }, [])

  /** 通过数据 Hook 保存修改。 */
  function runSave(): void {
    editMutation.mutate()
  }

  /** 恢复初始任务并重新读取，清掉计数。 */
  function resetDemo(): void {
    taskStore.task = { id: 't-1', title: '现有任务', owner: '林晓' }
    taskStore.listCount = 0
    setListCount(0)
    editMutation.reset()
    void queryClient.invalidateQueries()
  }

  const boardTask = boardQuery.data?.[0]
  const sidebarTask = sidebarQuery.data?.[0]

  return (
    <section className="data-hooks-demo" data-testid="data-hooks-demo">
      <header className="data-hooks-header">
        <span>TanStack Query</span>
        <h2>数据 Hooks 与模块组织</h2>
        <p>
          看板和侧栏都调用同一份 useTaskList。保存走 useEditTask，按 taskListOptions.queryKey
          写回，两边标题一起变成核对创建任务。
        </p>
      </header>

      <div className="data-hooks-metrics" aria-live="polite">
        <div>
          <span>列表次数</span>
          <strong data-testid="data-hooks-list-count">{listCount}</strong>
        </div>
        <div>
          <span>看板标题</span>
          <strong data-testid="data-hooks-board-title">{boardTask ? boardTask.title : '无'}</strong>
        </div>
        <div>
          <span>侧栏标题</span>
          <strong data-testid="data-hooks-sidebar-title">
            {sidebarTask ? sidebarTask.title : '无'}
          </strong>
        </div>
        <div>
          <span>负责人</span>
          <strong data-testid="data-hooks-owner">{boardTask ? boardTask.owner : '无'}</strong>
        </div>
        <div>
          <span>mutation</span>
          <strong data-testid="data-hooks-mutation-status">{editMutation.status}</strong>
        </div>
      </div>

      <div className="data-hooks-actions">
        <button type="button" data-kind="primary" disabled={busy} onClick={runSave}>
          保存修改
        </button>
        <button type="button" disabled={busy} onClick={resetDemo}>
          重置
        </button>
      </div>

      <div className="data-hooks-columns">
        <section className="data-hooks-card">
          <h3>看板 useTaskList</h3>
          {boardQuery.isPending ? (
            <p className="data-hooks-message" role="status">
              正在读取看板。
            </p>
          ) : null}
          {boardQuery.isSuccess && boardTask ? (
            <ul data-testid="data-hooks-board-list">
              <li>
                {boardTask.title} / {boardTask.owner}
              </li>
            </ul>
          ) : null}
        </section>
        <section className="data-hooks-card">
          <h3>侧栏 useTaskList</h3>
          {sidebarQuery.isPending ? (
            <p className="data-hooks-message" role="status">
              正在读取侧栏。
            </p>
          ) : null}
          {sidebarQuery.isSuccess && sidebarTask ? (
            <ul data-testid="data-hooks-sidebar-list">
              <li>
                {sidebarTask.title} / {sidebarTask.owner}
              </li>
            </ul>
          ) : null}
        </section>
      </div>
    </section>
  )
}

/** 为 Demo 提供独立 QueryClient，并在离开页面时清空本地缓存。 */
function DataHooksAndModuleOrganizationDemoRoot(): ReactElement {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    return () => {
      taskStore.task = { id: 't-1', title: '现有任务', owner: '林晓' }
      taskStore.listCount = 0
      taskStore.onListCountChange = undefined
      queryClient.clear()
    }
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <DataHooksAndModuleOrganizationPanel />
    </QueryClientProvider>
  )
}

/** 为课程页面注册数据 Hooks 与模块组织 Demo。 */
export function createDataHooksAndModuleOrganizationDemo(): ComponentType {
  return DataHooksAndModuleOrganizationDemoRoot
}
